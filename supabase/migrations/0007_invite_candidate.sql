-- DentMatch — invitation d'un candidat à postuler sur une annonce
-- Un cabinet peut inviter un remplaçant (profil public) à candidater :
-- crée une notification « job_post_match » chez le candidat, avec déduplication.

create or replace function public.invite_candidate(
  p_job_post_id uuid,
  p_candidate_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post public.job_posts%rowtype;
  v_cabinet public.cabinet_profiles%rowtype;
  v_candidate public.profiles%rowtype;
begin
  select * into v_post from public.job_posts where id = p_job_post_id;
  if not found then
    raise exception 'ANNONCE_INTROUVABLE';
  end if;

  select * into v_cabinet from public.cabinet_profiles where id = v_post.cabinet_id;
  if v_cabinet.user_id is distinct from auth.uid() then
    raise exception 'NON_AUTORISE';
  end if;

  if v_post.status <> 'published' then
    raise exception 'ANNONCE_NON_PUBLIEE';
  end if;

  select * into v_candidate from public.profiles where id = p_candidate_user_id;
  if not found or v_candidate.role <> 'replacement_dentist'
     or not v_candidate.onboarding_completed then
    raise exception 'CANDIDAT_INTROUVABLE';
  end if;

  -- Déduplication : une seule invitation par annonce et par candidat.
  if exists (
    select 1 from public.notifications
    where user_id = p_candidate_user_id
      and type = 'job_post_match'
      and metadata ->> 'job_post_id' = p_job_post_id::text
  ) then
    raise exception 'DEJA_INVITE';
  end if;

  -- Inutile d'inviter quelqu'un qui a déjà candidaté.
  if exists (
    select 1 from public.applications
    where job_post_id = p_job_post_id
      and applicant_user_id = p_candidate_user_id
  ) then
    raise exception 'DEJA_CANDIDAT';
  end if;

  insert into public.notifications (user_id, type, title, body, metadata)
  values (
    p_candidate_user_id,
    'job_post_match',
    'Un cabinet vous invite à candidater',
    coalesce(v_cabinet.name, 'Un cabinet') || ' vous propose de candidater à « '
      || v_post.title || ' » (' || coalesce(v_post.city, '') || ').',
    jsonb_build_object('job_post_id', p_job_post_id, 'cabinet_id', v_post.cabinet_id)
  );

  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata)
  values (
    auth.uid(), 'candidate_invited', 'job_post', p_job_post_id,
    jsonb_build_object('candidate_user_id', p_candidate_user_id)
  );
end;
$$;

revoke execute on function public.invite_candidate(uuid, uuid) from anon, public;
