-- DentMatch — Row Level Security et fonctions métier

-- Fonctions utilitaires --------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Le cabinet de l'utilisateur courant (null sinon).
create or replace function public.current_cabinet_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.cabinet_profiles where user_id = auth.uid();
$$;

-- L'utilisateur courant est-il membre de la conversation ?
create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = p_conversation_id and user_id = auth.uid()
  );
$$;

-- Les deux utilisateurs partagent-ils une candidature (cabinet <-> candidat) ?
create or replace function public.shares_application_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    -- Je suis le cabinet, p_user_id a candidaté chez moi
    select 1
    from public.applications a
    join public.job_posts jp on jp.id = a.job_post_id
    join public.cabinet_profiles cp on cp.id = jp.cabinet_id
    where a.applicant_user_id = p_user_id and cp.user_id = auth.uid()
    union all
    -- Je suis le candidat, p_user_id est le responsable du cabinet
    select 1
    from public.applications a
    join public.job_posts jp on jp.id = a.job_post_id
    join public.cabinet_profiles cp on cp.id = jp.cabinet_id
    where a.applicant_user_id = auth.uid() and cp.user_id = p_user_id
  );
$$;

-- Les deux utilisateurs partagent-ils une conversation ?
create or replace function public.shares_conversation_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members m1
    join public.conversation_members m2 on m1.conversation_id = m2.conversation_id
    where m1.user_id = auth.uid() and m2.user_id = p_user_id
  );
$$;

-- Activation RLS ------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.cabinet_profiles enable row level security;
alter table public.replacement_profiles enable row level security;
alter table public.specialties enable row level security;
alter table public.profile_specialties enable row level security;
alter table public.cabinet_equipment enable row level security;
alter table public.cabinet_photos enable row level security;
alter table public.mobility_areas enable row level security;
alter table public.availabilities enable row level security;
alter table public.documents enable row level security;
alter table public.job_posts enable row level security;
alter table public.job_post_skills enable row level security;
alter table public.applications enable row level security;
alter table public.placements enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.saved_job_posts enable row level security;
alter table public.audit_events enable row level security;

-- profiles -------------------------------------------------------------------------

create policy "profiles: lecture" on public.profiles
  for select using (
    id = auth.uid()
    or public.is_admin()
    or public.shares_application_with(id)
    or public.shares_conversation_with(id)
  );

create policy "profiles: mise à jour" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- user_preferences -----------------------------------------------------------------

create policy "user_preferences: propriétaire" on public.user_preferences
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- cabinet_profiles -----------------------------------------------------------------
-- Les informations du cabinet sont visibles par tout utilisateur authentifié
-- (elles alimentent les annonces publiées) ; l'écriture est réservée au propriétaire.

create policy "cabinet_profiles: lecture authentifiée" on public.cabinet_profiles
  for select using (auth.uid() is not null);

create policy "cabinet_profiles: insertion propriétaire" on public.cabinet_profiles
  for insert with check (user_id = auth.uid());

create policy "cabinet_profiles: mise à jour propriétaire" on public.cabinet_profiles
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "cabinet_profiles: suppression propriétaire" on public.cabinet_profiles
  for delete using (user_id = auth.uid() or public.is_admin());

-- replacement_profiles ----------------------------------------------------------------
-- Données sensibles : lisibles par le propriétaire, l'admin, les cabinets ayant reçu
-- une candidature de l'intéressé et les co-membres d'une conversation.

create policy "replacement_profiles: lecture restreinte" on public.replacement_profiles
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or public.shares_application_with(user_id)
    or public.shares_conversation_with(user_id)
  );

create policy "replacement_profiles: insertion propriétaire" on public.replacement_profiles
  for insert with check (user_id = auth.uid());

create policy "replacement_profiles: mise à jour propriétaire" on public.replacement_profiles
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- specialties ---------------------------------------------------------------------------

create policy "specialties: lecture authentifiée" on public.specialties
  for select using (auth.uid() is not null);

-- profile_specialties ---------------------------------------------------------------------

create policy "profile_specialties: lecture authentifiée" on public.profile_specialties
  for select using (auth.uid() is not null);

create policy "profile_specialties: écriture propriétaire" on public.profile_specialties
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- cabinet_equipment / cabinet_photos ---------------------------------------------------------

create policy "cabinet_equipment: lecture authentifiée" on public.cabinet_equipment
  for select using (auth.uid() is not null);

create policy "cabinet_equipment: écriture propriétaire" on public.cabinet_equipment
  for all using (cabinet_id = public.current_cabinet_id())
  with check (cabinet_id = public.current_cabinet_id());

create policy "cabinet_photos: lecture authentifiée" on public.cabinet_photos
  for select using (auth.uid() is not null);

create policy "cabinet_photos: écriture propriétaire" on public.cabinet_photos
  for all using (cabinet_id = public.current_cabinet_id())
  with check (cabinet_id = public.current_cabinet_id());

-- mobility_areas / availabilities --------------------------------------------------------------

create policy "mobility_areas: lecture authentifiée" on public.mobility_areas
  for select using (auth.uid() is not null);

create policy "mobility_areas: écriture propriétaire" on public.mobility_areas
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "availabilities: lecture authentifiée" on public.availabilities
  for select using (auth.uid() is not null);

create policy "availabilities: écriture propriétaire" on public.availabilities
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- documents -----------------------------------------------------------------------------------
-- Uniquement le propriétaire et les administrateurs. Jamais l'autre partie.

create policy "documents: lecture propriétaire ou admin" on public.documents
  for select using (owner_user_id = auth.uid() or public.is_admin());

create policy "documents: insertion propriétaire" on public.documents
  for insert with check (owner_user_id = auth.uid());

create policy "documents: mise à jour propriétaire ou admin" on public.documents
  for update using (owner_user_id = auth.uid() or public.is_admin())
  with check (owner_user_id = auth.uid() or public.is_admin());

create policy "documents: suppression propriétaire" on public.documents
  for delete using (owner_user_id = auth.uid() or public.is_admin());

-- job_posts --------------------------------------------------------------------------------------
-- Les annonces publiées/pourvues sont visibles par les utilisateurs authentifiés ;
-- les brouillons et autres statuts uniquement par le cabinet propriétaire.

create policy "job_posts: lecture" on public.job_posts
  for select using (
    (status in ('published', 'filled') and auth.uid() is not null)
    or cabinet_id = public.current_cabinet_id()
    or public.is_admin()
  );

create policy "job_posts: insertion cabinet" on public.job_posts
  for insert with check (
    cabinet_id = public.current_cabinet_id() and created_by = auth.uid()
  );

create policy "job_posts: mise à jour cabinet" on public.job_posts
  for update using (cabinet_id = public.current_cabinet_id() or public.is_admin())
  with check (cabinet_id = public.current_cabinet_id() or public.is_admin());

create policy "job_posts: suppression cabinet" on public.job_posts
  for delete using (cabinet_id = public.current_cabinet_id() or public.is_admin());

-- job_post_skills -----------------------------------------------------------------------------------

create policy "job_post_skills: lecture authentifiée" on public.job_post_skills
  for select using (auth.uid() is not null);

create policy "job_post_skills: écriture cabinet" on public.job_post_skills
  for all using (
    exists (
      select 1 from public.job_posts jp
      where jp.id = job_post_id and jp.cabinet_id = public.current_cabinet_id()
    )
  )
  with check (
    exists (
      select 1 from public.job_posts jp
      where jp.id = job_post_id and jp.cabinet_id = public.current_cabinet_id()
    )
  );

-- applications ----------------------------------------------------------------------------------------

create policy "applications: lecture parties concernées" on public.applications
  for select using (
    applicant_user_id = auth.uid()
    or exists (
      select 1 from public.job_posts jp
      where jp.id = job_post_id and jp.cabinet_id = public.current_cabinet_id()
    )
    or public.is_admin()
  );

create policy "applications: insertion candidat" on public.applications
  for insert with check (
    applicant_user_id = auth.uid()
    and exists (
      select 1 from public.job_posts jp
      where jp.id = job_post_id and jp.status = 'published'
    )
  );

create policy "applications: mise à jour parties concernées" on public.applications
  for update using (
    applicant_user_id = auth.uid()
    or exists (
      select 1 from public.job_posts jp
      where jp.id = job_post_id and jp.cabinet_id = public.current_cabinet_id()
    )
    or public.is_admin()
  );

-- placements --------------------------------------------------------------------------------------------

create policy "placements: lecture parties concernées" on public.placements
  for select using (
    replacement_user_id = auth.uid()
    or cabinet_id = public.current_cabinet_id()
    or public.is_admin()
  );

create policy "placements: mise à jour parties concernées" on public.placements
  for update using (
    replacement_user_id = auth.uid()
    or cabinet_id = public.current_cabinet_id()
    or public.is_admin()
  )
  with check (
    replacement_user_id = auth.uid()
    or cabinet_id = public.current_cabinet_id()
    or public.is_admin()
  );

-- conversations -------------------------------------------------------------------------------------------

create policy "conversations: lecture membre" on public.conversations
  for select using (public.is_conversation_member(id) or public.is_admin());

create policy "conversation_members: lecture membre" on public.conversation_members
  for select using (
    user_id = auth.uid()
    or public.is_conversation_member(conversation_id)
    or public.is_admin()
  );

create policy "conversation_members: mise à jour lecture" on public.conversation_members
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- messages ------------------------------------------------------------------------------------------------

create policy "messages: lecture membre" on public.messages
  for select using (public.is_conversation_member(conversation_id) or public.is_admin());

create policy "messages: envoi membre" on public.messages
  for insert with check (
    sender_id = auth.uid() and public.is_conversation_member(conversation_id)
  );

create policy "messages: édition expéditeur" on public.messages
  for update using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

-- notifications ----------------------------------------------------------------------------------------------

create policy "notifications: lecture propriétaire" on public.notifications
  for select using (user_id = auth.uid());

create policy "notifications: mise à jour propriétaire" on public.notifications
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- saved_job_posts ----------------------------------------------------------------------------------------------

create policy "saved_job_posts: propriétaire" on public.saved_job_posts
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- audit_events ---------------------------------------------------------------------------------------------------

create policy "audit_events: lecture admin" on public.audit_events
  for select using (public.is_admin());

-- Vue publique des candidats -----------------------------------------------------------------------------------
-- N'expose que les champs autorisés du profil public (jamais les identifiants
-- sensibles, la date de naissance ni l'adresse complète).

create or replace view public.public_candidate_profiles
with (security_invoker = off) as
select
  rp.user_id,
  p.first_name,
  left(p.last_name, 1) || '.' as last_name_initial,
  case when coalesce((rp.public_visibility ->> 'photo')::boolean, true)
    then p.avatar_url end as avatar_url,
  p.verification_status,
  rp.professional_status,
  case when coalesce((rp.public_visibility ->> 'city')::boolean, true)
    then rp.city end as city,
  rp.territory,
  case when coalesce((rp.public_visibility ->> 'experience')::boolean, true)
    then rp.experience_years end as experience_years,
  case when coalesce((rp.public_visibility ->> 'languages')::boolean, true)
    then rp.languages end as languages,
  case when coalesce((rp.public_visibility ->> 'bio')::boolean, true)
    then rp.bio end as bio,
  rp.national_mobility,
  rp.mobility_radius_km
from public.replacement_profiles rp
join public.profiles p on p.id = rp.user_id
where p.onboarding_completed = true;

revoke all on public.public_candidate_profiles from anon;
grant select on public.public_candidate_profiles to authenticated;

-- Journalisation d'audit (fonction utilisable côté serveur) ------------------------------------------------------

create or replace function public.log_audit_event(
  p_event_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata)
  values (auth.uid(), p_event_type, p_entity_type, p_entity_id, p_metadata);
end;
$$;
