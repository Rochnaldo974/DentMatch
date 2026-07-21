-- DentMatch — schéma initial
-- Types énumérés -------------------------------------------------------------

create type public.user_role as enum ('cabinet', 'replacement_dentist', 'admin');
create type public.professional_status as enum ('qualified_dentist', 'student', 'resident');
create type public.verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
create type public.document_status as enum ('missing', 'uploaded', 'pending', 'verified', 'rejected');
create type public.job_post_status as enum ('draft', 'published', 'filled', 'expired', 'archived', 'cancelled', 'suspended');
create type public.application_status as enum ('submitted', 'viewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn');
create type public.placement_status as enum ('confirmed', 'completed', 'cancelled');

-- Fonction utilitaire updated_at ---------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profils --------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'replacement_dentist',
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  onboarding_step integer not null default 0,
  verification_status public.verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Création automatique du profil à l'inscription.
-- Le rôle "admin" ne peut jamais être défini depuis les métadonnées client.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, first_name, last_name)
  values (
    new.id,
    case
      when new.raw_user_meta_data ->> 'role' = 'cabinet' then 'cabinet'::public.user_role
      else 'replacement_dentist'::public.user_role
    end,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$;

-- Préférences utilisateur ------------------------------------------------------

create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  email_notifications boolean not null default true,
  in_app_notifications boolean not null default true,
  marketing_emails boolean not null default false,
  privacy jsonb not null default '{}'::jsonb,
  search_criteria jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profils cabinet ---------------------------------------------------------------

create table public.cabinet_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  manager_role text,
  manager_email text,
  name text not null default '',
  structure_type text,
  siret text,
  finess text,
  description text,
  address_line_1 text,
  address_line_2 text,
  postal_code text,
  city text,
  department text,
  region text,
  territory text,
  latitude double precision,
  longitude double precision,
  phone text,
  email text,
  website text,
  practitioners_count integer,
  assistants_count integer,
  treatment_rooms_count integer,
  software text,
  accessibility boolean,
  parking boolean,
  public_transport text,
  languages text[] not null default '{}',
  environment_type text,
  replacement_types_sought text[] not null default '{}',
  search_radius_km integer,
  replacement_frequency text,
  profile_completion integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger cabinet_profiles_updated_at
  before update on public.cabinet_profiles
  for each row execute function public.set_updated_at();

-- Profils remplaçant -------------------------------------------------------------

create table public.replacement_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  professional_status public.professional_status,
  birth_date date,
  professional_email text,
  address_line text,
  postal_code text,
  city text,
  territory text,
  bio text,
  -- Diplômé
  rpps_number text,
  ordinal_number text,
  ordinal_department text,
  graduation_year integer,
  university text,
  current_practice_mode text,
  has_cps boolean,
  cps_last_digits text,
  rcp_insurer text,
  rcp_expiration_date date,
  -- Étudiant
  student_year text,
  fifth_year_validated boolean,
  has_csct boolean,
  csct_date date,
  hospital_status boolean,
  hospital_name text,
  license_expiration_date date,
  -- Interne
  resident_specialty text,
  internship_year text,
  attachment_institution text,
  has_exercise_authorization boolean,
  -- Compétences
  experience_years integer,
  mastered_procedures text,
  excluded_procedures text,
  software_used text[] not null default '{}',
  languages text[] not null default '{}',
  -- Mobilité
  mobility_radius_km integer,
  national_mobility boolean,
  has_vehicle boolean,
  has_driving_license boolean,
  needs_accommodation boolean,
  accepts_travel_with_accommodation boolean,
  max_travel_duration text,
  -- Préférences
  replacement_preferences text[] not null default '{}',
  availability_preferences text[] not null default '{}',
  min_compensation text,
  prefers_retrocession boolean,
  prefers_daily_rate boolean,
  min_days_count integer,
  preferred_environment text,
  desired_equipment text[] not null default '{}',
  -- Profil public (choix de visibilité)
  public_visibility jsonb not null default '{"photo": true, "city": true, "mobility": true, "skills": true, "experience": true, "availability": true, "languages": true, "bio": true}'::jsonb,
  profile_completion integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger replacement_profiles_updated_at
  before update on public.replacement_profiles
  for each row execute function public.set_updated_at();

-- Spécialités ---------------------------------------------------------------------

create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  is_specialized boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.specialties (code, label, is_specialized) values
  ('omnipratique', 'Omnipratique', false),
  ('pediatrie', 'Odontologie pédiatrique', false),
  ('endodontie', 'Endodontie', false),
  ('parodontologie', 'Parodontologie', false),
  ('chirurgie_orale', 'Chirurgie orale', true),
  ('implantologie', 'Implantologie', false),
  ('orthodontie', 'Orthodontie', true),
  ('prothese', 'Prothèse', false),
  ('esthetique', 'Esthétique', false),
  ('urgences', 'Urgences', false),
  ('sedation', 'Soins sous sédation', false),
  ('handicap', 'Patients en situation de handicap', false),
  ('medecine_bucco_dentaire', 'Médecine bucco-dentaire', true),
  ('autre', 'Autre', false);

create table public.profile_specialties (
  user_id uuid not null references public.profiles (id) on delete cascade,
  specialty_id uuid not null references public.specialties (id) on delete cascade,
  primary key (user_id, specialty_id)
);

-- Équipements et photos cabinet ------------------------------------------------

create table public.cabinet_equipment (
  cabinet_id uuid not null references public.cabinet_profiles (id) on delete cascade,
  equipment_code text not null,
  primary key (cabinet_id, equipment_code)
);

create table public.cabinet_photos (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinet_profiles (id) on delete cascade,
  photo_type text not null,
  storage_path text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Mobilité et disponibilités ------------------------------------------------------

create table public.mobility_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  area_type text not null check (area_type in ('region', 'department', 'territory')),
  area_value text not null,
  created_at timestamptz not null default now(),
  unique (user_id, area_type, area_value)
);

create table public.availabilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null default 'plage' check (type in ('ponctuel', 'plage', 'recurrent')),
  start_date date,
  end_date date,
  recurring_days text[] not null default '{}',
  available boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger availabilities_updated_at
  before update on public.availabilities
  for each row execute function public.set_updated_at();

-- Documents ------------------------------------------------------------------------

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  owner_type text not null check (owner_type in ('cabinet', 'replacement_dentist')),
  document_type text not null,
  storage_path text,
  original_name text not null default '',
  mime_type text,
  size_bytes bigint,
  status public.document_status not null default 'uploaded',
  is_simulated boolean not null default false,
  expires_at date,
  rejection_reason text,
  verified_at timestamptz,
  verified_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, document_type)
);

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- Annonces ---------------------------------------------------------------------------

create table public.job_posts (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinet_profiles (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  title text not null default '',
  description text,
  status public.job_post_status not null default 'draft',
  replaced_practitioner text,
  replacement_reason text,
  contract_type text,
  replacement_type text,
  start_date date,
  end_date date,
  working_days text[] not null default '{}',
  schedule_text text,
  full_time boolean,
  specialty_id uuid references public.specialties (id) on delete set null,
  expected_procedures text,
  experience_required text,
  compensation_type text,
  compensation_value numeric,
  compensation_details text,
  accommodation_provided boolean not null default false,
  travel_covered boolean not null default false,
  urgent boolean not null default false,
  positions_count integer not null default 1 check (positions_count >= 1),
  filled_positions_count integer not null default 0,
  application_deadline date,
  practical_info text,
  equipment text[] not null default '{}',
  software text,
  languages text[] not null default '{}',
  -- Localisation dénormalisée depuis le cabinet (pour la recherche)
  city text,
  postal_code text,
  department text,
  region text,
  territory text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger job_posts_updated_at
  before update on public.job_posts
  for each row execute function public.set_updated_at();

create table public.job_post_skills (
  job_post_id uuid not null references public.job_posts (id) on delete cascade,
  specialty_id uuid not null references public.specialties (id) on delete cascade,
  primary key (job_post_id, specialty_id)
);

-- Candidatures -------------------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_post_id uuid not null references public.job_posts (id) on delete cascade,
  applicant_user_id uuid not null references public.profiles (id) on delete cascade,
  status public.application_status not null default 'submitted',
  message text,
  confirmed_availability boolean not null default false,
  expected_compensation text,
  note text,
  submitted_at timestamptz not null default now(),
  viewed_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_post_id, applicant_user_id)
);

create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Remplacements --------------------------------------------------------------------------

create table public.placements (
  id uuid primary key default gen_random_uuid(),
  job_post_id uuid not null references public.job_posts (id) on delete cascade,
  application_id uuid not null unique references public.applications (id) on delete cascade,
  cabinet_id uuid not null references public.cabinet_profiles (id) on delete cascade,
  replacement_user_id uuid not null references public.profiles (id) on delete cascade,
  status public.placement_status not null default 'confirmed',
  start_date date,
  end_date date,
  administrative_checklist jsonb not null default '{"application_accepted": true}'::jsonb,
  confirmed_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger placements_updated_at
  before update on public.placements
  for each row execute function public.set_updated_at();

-- Messagerie -------------------------------------------------------------------------------

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  job_post_id uuid references public.job_posts (id) on delete set null,
  placement_id uuid references public.placements (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

-- Notifications ------------------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Annonces enregistrées ------------------------------------------------------------------------

create table public.saved_job_posts (
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_post_id uuid not null references public.job_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_post_id)
);

-- Audit ------------------------------------------------------------------------------------------

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Index ---------------------------------------------------------------------------------------------

create index idx_job_posts_status on public.job_posts (status);
create index idx_job_posts_start_date on public.job_posts (start_date);
create index idx_job_posts_territory on public.job_posts (territory);
create index idx_job_posts_department on public.job_posts (department);
create index idx_job_posts_specialty on public.job_posts (specialty_id);
create index idx_job_posts_cabinet on public.job_posts (cabinet_id);
create index idx_applications_job_post on public.applications (job_post_id);
create index idx_applications_applicant on public.applications (applicant_user_id);
create index idx_messages_conversation on public.messages (conversation_id, created_at);
create index idx_notifications_unread on public.notifications (user_id) where read_at is null;
create index idx_notifications_user on public.notifications (user_id, created_at desc);
create index idx_documents_owner on public.documents (owner_user_id);
create index idx_availabilities_user on public.availabilities (user_id);
create index idx_mobility_areas_user on public.mobility_areas (user_id);
create index idx_placements_cabinet on public.placements (cabinet_id);
create index idx_placements_replacement on public.placements (replacement_user_id);
create index idx_audit_events_entity on public.audit_events (entity_type, entity_id);

-- Realtime -------------------------------------------------------------------------------------------

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
