-- DentMatch — notifications automatiques et acceptation transactionnelle

-- Notifications déclenchées par triggers -----------------------------------------

-- Nouvelle candidature → notifier le responsable du cabinet.
create or replace function public.notify_new_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cabinet_user uuid;
  v_title text;
begin
  select cp.user_id, jp.title
    into v_cabinet_user, v_title
  from public.job_posts jp
  join public.cabinet_profiles cp on cp.id = jp.cabinet_id
  where jp.id = new.job_post_id;

  if v_cabinet_user is not null then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      v_cabinet_user,
      'new_application',
      'Nouvelle candidature reçue',
      'Un remplaçant a candidaté à votre annonce « ' || coalesce(v_title, '') || ' ».',
      jsonb_build_object('job_post_id', new.job_post_id, 'application_id', new.id)
    );
  end if;
  return new;
end;
$$;

create trigger on_application_created
  after insert on public.applications
  for each row execute function public.notify_new_application();

-- Changement de statut d'une candidature → notifier le candidat.
create or replace function public.notify_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
begin
  if new.status = old.status then
    return new;
  end if;

  select jp.title into v_title
  from public.job_posts jp where jp.id = new.job_post_id;

  if new.status = 'accepted' then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.applicant_user_id,
      'application_accepted',
      'Candidature acceptée 🎉',
      'Votre candidature pour « ' || coalesce(v_title, '') || ' » a été acceptée. Une conversation est ouverte avec le cabinet.',
      jsonb_build_object('job_post_id', new.job_post_id, 'application_id', new.id)
    );
  elsif new.status = 'rejected' then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.applicant_user_id,
      'application_rejected',
      'Candidature non retenue',
      'Votre candidature pour « ' || coalesce(v_title, '') || ' » n''a pas été retenue.',
      jsonb_build_object('job_post_id', new.job_post_id, 'application_id', new.id)
    );
  elsif new.status = 'viewed' and old.status = 'submitted' then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.applicant_user_id,
      'application_viewed',
      'Candidature consultée',
      'Le cabinet a consulté votre candidature pour « ' || coalesce(v_title, '') || ' ».',
      jsonb_build_object('job_post_id', new.job_post_id, 'application_id', new.id)
    );
  end if;
  return new;
end;
$$;

create trigger on_application_status_change
  after update on public.applications
  for each row execute function public.notify_application_status_change();

-- Nouveau message → notifier les autres membres de la conversation.
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, metadata)
  select
    cm.user_id,
    'new_message',
    'Nouveau message',
    left(new.content, 120),
    jsonb_build_object('conversation_id', new.conversation_id, 'message_id', new.id)
  from public.conversation_members cm
  where cm.conversation_id = new.conversation_id
    and cm.user_id <> new.sender_id;

  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_created
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- Document vérifié ou refusé par un admin → notifier le propriétaire.
create or replace function public.notify_document_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = old.status then
    return new;
  end if;
  if new.status = 'rejected' then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.owner_user_id,
      'document_rejected',
      'Document refusé',
      coalesce('Motif : ' || new.rejection_reason, 'Un de vos documents a été refusé.'),
      jsonb_build_object('document_id', new.id, 'document_type', new.document_type)
    );
  end if;
  return new;
end;
$$;

create trigger on_document_review
  after update on public.documents
  for each row execute function public.notify_document_review();

-- Acceptation transactionnelle d'une candidature -----------------------------------
-- Vérifie les droits et l'état, accepte la candidature, crée le remplacement,
-- ouvre la conversation, journalise et notifie — le tout dans une transaction.

create or replace function public.accept_application(
  p_application_id uuid,
  p_mark_filled boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app public.applications%rowtype;
  v_post public.job_posts%rowtype;
  v_cabinet public.cabinet_profiles%rowtype;
  v_placement_id uuid;
  v_conversation_id uuid;
  v_accepted_count integer;
begin
  select * into v_app from public.applications where id = p_application_id for update;
  if not found then
    raise exception 'CANDIDATURE_INTROUVABLE';
  end if;

  select * into v_post from public.job_posts where id = v_app.job_post_id for update;
  if not found then
    raise exception 'ANNONCE_INTROUVABLE';
  end if;

  select * into v_cabinet from public.cabinet_profiles where id = v_post.cabinet_id;

  -- Seul le cabinet propriétaire de l'annonce peut accepter.
  if v_cabinet.user_id is distinct from auth.uid() then
    raise exception 'NON_AUTORISE';
  end if;

  if v_app.status not in ('submitted', 'viewed', 'shortlisted') then
    raise exception 'CANDIDATURE_NON_ACCEPTABLE';
  end if;

  if v_post.status not in ('published', 'filled') then
    raise exception 'ANNONCE_INDISPONIBLE';
  end if;

  select count(*) into v_accepted_count
  from public.applications
  where job_post_id = v_post.id and status = 'accepted';

  if v_accepted_count >= v_post.positions_count then
    raise exception 'ANNONCE_DEJA_POURVUE';
  end if;

  -- 1. Accepter la candidature.
  update public.applications
  set status = 'accepted', accepted_at = now()
  where id = p_application_id;

  -- 2. Créer le remplacement.
  insert into public.placements (
    job_post_id, application_id, cabinet_id, replacement_user_id,
    start_date, end_date
  )
  values (
    v_post.id, p_application_id, v_post.cabinet_id, v_app.applicant_user_id,
    v_post.start_date, v_post.end_date
  )
  returning id into v_placement_id;

  -- 3. Mettre à jour le compteur de postes pourvus.
  update public.job_posts
  set filled_positions_count = v_accepted_count + 1,
      status = case
        when p_mark_filled and v_accepted_count + 1 >= positions_count then 'filled'::public.job_post_status
        else status
      end
  where id = v_post.id;

  -- 4. Créer la conversation si elle n'existe pas déjà entre les deux parties.
  select c.id into v_conversation_id
  from public.conversations c
  join public.conversation_members m1 on m1.conversation_id = c.id and m1.user_id = v_cabinet.user_id
  join public.conversation_members m2 on m2.conversation_id = c.id and m2.user_id = v_app.applicant_user_id
  where c.job_post_id = v_post.id
  limit 1;

  if v_conversation_id is null then
    insert into public.conversations (job_post_id, placement_id)
    values (v_post.id, v_placement_id)
    returning id into v_conversation_id;

    insert into public.conversation_members (conversation_id, user_id)
    values
      (v_conversation_id, v_cabinet.user_id),
      (v_conversation_id, v_app.applicant_user_id);
  else
    update public.conversations set placement_id = v_placement_id where id = v_conversation_id;
  end if;

  -- 5. Journaliser.
  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    'application_accepted',
    'application',
    p_application_id,
    jsonb_build_object(
      'job_post_id', v_post.id,
      'placement_id', v_placement_id,
      'conversation_id', v_conversation_id
    )
  );

  return jsonb_build_object(
    'placement_id', v_placement_id,
    'conversation_id', v_conversation_id
  );
end;
$$;

-- Ouverture (ou récupération) d'une conversation entre le candidat et le cabinet
-- d'une candidature existante — utilisée pour « Envoyer un message ».
create or replace function public.get_or_create_application_conversation(
  p_application_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app public.applications%rowtype;
  v_post public.job_posts%rowtype;
  v_cabinet_user uuid;
  v_conversation_id uuid;
begin
  select * into v_app from public.applications where id = p_application_id;
  if not found then
    raise exception 'CANDIDATURE_INTROUVABLE';
  end if;

  select * into v_post from public.job_posts where id = v_app.job_post_id;
  select user_id into v_cabinet_user from public.cabinet_profiles where id = v_post.cabinet_id;

  -- Seules les deux parties de la candidature peuvent ouvrir la conversation.
  if auth.uid() is distinct from v_cabinet_user
     and auth.uid() is distinct from v_app.applicant_user_id then
    raise exception 'NON_AUTORISE';
  end if;

  select c.id into v_conversation_id
  from public.conversations c
  join public.conversation_members m1 on m1.conversation_id = c.id and m1.user_id = v_cabinet_user
  join public.conversation_members m2 on m2.conversation_id = c.id and m2.user_id = v_app.applicant_user_id
  where c.job_post_id = v_post.id
  limit 1;

  if v_conversation_id is null then
    insert into public.conversations (job_post_id)
    values (v_post.id)
    returning id into v_conversation_id;

    insert into public.conversation_members (conversation_id, user_id)
    values
      (v_conversation_id, v_cabinet_user),
      (v_conversation_id, v_app.applicant_user_id);
  end if;

  return v_conversation_id;
end;
$$;
