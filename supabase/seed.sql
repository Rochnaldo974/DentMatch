-- DentMatch — données de démonstration (environnement local / test uniquement)
-- Identités fictives. Les mots de passe sont des mots de passe de DÉMONSTRATION,
-- documentés dans le README — ne jamais utiliser en production.
--
-- Comptes créés (email / mot de passe) :
--   demo.cabinet@dentmatch.example        / DemoCabinet2026!      (cabinet, Lyon)
--   cabinet.paris@dentmatch.example       / DemoCabinet2026!      (cabinet, Paris)
--   cabinet.reunion@dentmatch.example     / DemoCabinet2026!      (cabinet, La Réunion)
--   cabinet.guadeloupe@dentmatch.example  / DemoCabinet2026!      (cabinet, Guadeloupe)
--   cabinet.martinique@dentmatch.example  / DemoCabinet2026!      (cabinet, Martinique)
--   demo.remplacant@dentmatch.example     / DemoRemplacant2026!   (remplaçant diplômé, Bordeaux)
--   remplacant.etudiant@dentmatch.example / DemoRemplacant2026!   (étudiant autorisé)
--   remplacant.interne@dentmatch.example  / DemoRemplacant2026!   (interne ODF)
--   remplacant.marseille@dentmatch.example/ DemoRemplacant2026!   (remplaçant diplômé, Marseille)
--   admin@dentmatch.example               / AdminDemo2026!        (administrateur)

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Utilisateurs auth (le trigger handle_new_user crée profils et préférences)
-- ---------------------------------------------------------------------------

do $$
declare
  users constant jsonb := '[
    {"id":"11111111-1111-4111-8111-111111111101","email":"demo.cabinet@dentmatch.example","pw":"DemoCabinet2026!","first":"Claire","last":"Fontaine","role":"cabinet"},
    {"id":"11111111-1111-4111-8111-111111111102","email":"cabinet.paris@dentmatch.example","pw":"DemoCabinet2026!","first":"Marc","last":"Lemoine","role":"cabinet"},
    {"id":"11111111-1111-4111-8111-111111111103","email":"cabinet.reunion@dentmatch.example","pw":"DemoCabinet2026!","first":"Nadia","last":"Hoarau","role":"cabinet"},
    {"id":"11111111-1111-4111-8111-111111111104","email":"cabinet.guadeloupe@dentmatch.example","pw":"DemoCabinet2026!","first":"Patrick","last":"Solvet","role":"cabinet"},
    {"id":"11111111-1111-4111-8111-111111111105","email":"cabinet.martinique@dentmatch.example","pw":"DemoCabinet2026!","first":"Aline","last":"Marie-Sainte","role":"cabinet"},
    {"id":"22222222-2222-4222-8222-222222222201","email":"demo.remplacant@dentmatch.example","pw":"DemoRemplacant2026!","first":"Camille","last":"Marchand","role":"replacement_dentist"},
    {"id":"22222222-2222-4222-8222-222222222202","email":"remplacant.etudiant@dentmatch.example","pw":"DemoRemplacant2026!","first":"Théo","last":"Lambert","role":"replacement_dentist"},
    {"id":"22222222-2222-4222-8222-222222222203","email":"remplacant.interne@dentmatch.example","pw":"DemoRemplacant2026!","first":"Inès","last":"Rakoto","role":"replacement_dentist"},
    {"id":"22222222-2222-4222-8222-222222222204","email":"remplacant.marseille@dentmatch.example","pw":"DemoRemplacant2026!","first":"Julien","last":"Costa","role":"replacement_dentist"},
    {"id":"33333333-3333-4333-8333-333333333301","email":"admin@dentmatch.example","pw":"AdminDemo2026!","first":"Alex","last":"Admin","role":"replacement_dentist"}
  ]'::jsonb;
  u jsonb;
begin
  for u in select * from jsonb_array_elements(users) loop
    if not exists (select 1 from auth.users where id = (u->>'id')::uuid) then
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, recovery_token,
        email_change, email_change_token_new, email_change_token_current
      ) values (
        '00000000-0000-0000-0000-000000000000',
        (u->>'id')::uuid,
        'authenticated',
        'authenticated',
        u->>'email',
        crypt(u->>'pw', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('first_name', u->>'first', 'last_name', u->>'last', 'role', u->>'role'),
        now(), now(), '', '', '', '', ''
      );
      insert into auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(),
        (u->>'id')::uuid,
        jsonb_build_object('sub', u->>'id', 'email', u->>'email', 'email_verified', true, 'phone_verified', false),
        'email',
        u->>'id',
        now(), now(), now()
      );
    end if;
  end loop;
end $$;

-- Rôle admin (jamais définissable via les métadonnées client)
update public.profiles set role = 'admin', onboarding_completed = true
where id = '33333333-3333-4333-8333-333333333301';

-- Profils prêts à l'emploi
update public.profiles set onboarding_completed = true, verification_status = 'verified', phone = '06 12 34 56 78'
where id in (
  '11111111-1111-4111-8111-111111111101','11111111-1111-4111-8111-111111111102',
  '11111111-1111-4111-8111-111111111103','11111111-1111-4111-8111-111111111104',
  '11111111-1111-4111-8111-111111111105','22222222-2222-4222-8222-222222222201',
  '22222222-2222-4222-8222-222222222202','22222222-2222-4222-8222-222222222203',
  '22222222-2222-4222-8222-222222222204'
);

-- ---------------------------------------------------------------------------
-- Cabinets
-- ---------------------------------------------------------------------------

insert into public.cabinet_profiles (
  id, user_id, manager_role, manager_email, name, structure_type, siret, description,
  address_line_1, postal_code, city, department, region, territory, phone, email,
  practitioners_count, assistants_count, treatment_rooms_count, software,
  accessibility, parking, languages, environment_type, profile_completion
) values
  ('aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111101',
   'titulaire', 'demo.cabinet@dentmatch.example', 'Cabinet dentaire du Parc', 'cabinet_groupe',
   '12345678900011', 'Cabinet de groupe moderne situé face au parc de la Tête d''Or. Plateau technique complet, patientèle fidèle et équipe stable de trois praticiens.',
   '12 avenue des Belges', '69006', 'Lyon', 'Rhône', 'Auvergne-Rhône-Alpes', 'France métropolitaine',
   '04 78 00 00 01', 'demo.cabinet@dentmatch.example', 3, 4, 4, 'Logos', true, true,
   array['Français','Anglais'], 'urbain', 95),
  ('aaaaaaaa-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111102',
   'associe', 'cabinet.paris@dentmatch.example', 'Cabinet Haussmann', 'societe_exercice',
   '98765432100022', 'Cabinet parisien orienté omnipratique et esthétique, à deux pas de la gare Saint-Lazare.',
   '45 boulevard Haussmann', '75009', 'Paris', 'Paris', 'Île-de-France', 'France métropolitaine',
   '01 42 00 00 02', 'cabinet.paris@dentmatch.example', 2, 2, 3, 'Julie', true, false,
   array['Français','Anglais','Espagnol'], 'urbain', 90),
  ('aaaaaaaa-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111103',
   'titulaire', 'cabinet.reunion@dentmatch.example', 'Cabinet de l''Océan Indien', 'cabinet_individuel',
   '45678912300033', 'Cabinet lumineux au centre de Saint-Denis, patientèle familiale, ambiance conviviale. Idéal pour découvrir l''exercice à La Réunion.',
   '8 rue de Paris', '97400', 'Saint-Denis', 'La Réunion', 'La Réunion', 'La Réunion',
   '02 62 00 00 03', 'cabinet.reunion@dentmatch.example', 1, 2, 2, 'Veasy', true, true,
   array['Français','Créole'], 'urbain', 92),
  ('aaaaaaaa-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111104',
   'responsable_centre', 'cabinet.guadeloupe@dentmatch.example', 'Centre dentaire des Antilles', 'centre_sante',
   '78912345600044', 'Centre de santé dentaire à Pointe-à-Pitre, équipe pluridisciplinaire, forte activité.',
   '23 rue Frébault', '97110', 'Pointe-à-Pitre', 'Guadeloupe', 'Guadeloupe', 'Guadeloupe',
   '05 90 00 00 04', 'cabinet.guadeloupe@dentmatch.example', 4, 6, 6, 'Desmos', true, true,
   array['Français','Créole'], 'urbain', 88),
  ('aaaaaaaa-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111105',
   'titulaire', 'cabinet.martinique@dentmatch.example', 'Cabinet Madinina', 'cabinet_groupe',
   '32165498700055', 'Cabinet de groupe à Fort-de-France, plateau récent (cone beam, CFAO), stationnement facile.',
   '15 avenue des Caraïbes', '97200', 'Fort-de-France', 'Martinique', 'Martinique', 'Martinique',
   '05 96 00 00 05', 'cabinet.martinique@dentmatch.example', 2, 3, 3, 'Logos', false, true,
   array['Français','Créole'], 'urbain', 85)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Remplaçants
-- ---------------------------------------------------------------------------

insert into public.replacement_profiles (
  id, user_id, professional_status, birth_date, professional_email, address_line,
  postal_code, city, territory, bio, rpps_number, ordinal_department, graduation_year,
  university, current_practice_mode, has_cps, rcp_insurer, rcp_expiration_date,
  student_year, fifth_year_validated, has_csct, csct_date, hospital_status,
  license_expiration_date, resident_specialty, internship_year, attachment_institution,
  has_exercise_authorization, experience_years, languages, mobility_radius_km,
  national_mobility, has_vehicle, has_driving_license, needs_accommodation,
  replacement_preferences, availability_preferences, profile_completion
) values
  ('bbbbbbbb-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222201',
   'qualified_dentist', '1992-04-17', 'demo.remplacant@dentmatch.example', '4 rue Sainte-Catherine',
   '33000', 'Bordeaux', 'France métropolitaine',
   'Chirurgienne-dentiste diplômée de Bordeaux, 6 ans d''expérience en omnipratique. Rigoureuse, autonome et à l''écoute des patients. Disponible pour des remplacements courts ou longs, partout en France et en outre-mer.',
   '10012345678', 'Gironde', 2020, 'Université de Bordeaux', 'Remplacements uniquement', true,
   'MACSF', '2027-06-30', null, null, null, null, null, null, null, null, null, null,
   6, array['Français','Anglais'], 200, true, true, true, false,
   array['liberal','ponctuel','longue_duree','outre_mer'], array['immediate','temps_plein','remplacements_longs'], 96),
  ('bbbbbbbb-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222202',
   'student', '2001-09-02', 'remplacant.etudiant@dentmatch.example', '18 cours de la Marne',
   '33800', 'Bordeaux', 'France métropolitaine',
   'Étudiant en 6e année à Bordeaux, 5e année validée et CSCT obtenu. Motivé, sérieux, à la recherche de remplacements pour l''été.',
   null, null, null, 'Université de Bordeaux', null, null, null, null,
   '6e année', true, true, '2026-05-15', true, '2026-12-31', null, null, null, null,
   1, array['Français'], 100, false, false, true, true,
   array['liberal','ponctuel','temps_partiel'], array['week_ends','remplacements_courts'], 90),
  ('bbbbbbbb-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222203',
   'resident', '1998-12-11', 'remplacant.interne@dentmatch.example', '2 rue du Faubourg',
   '34000', 'Montpellier', 'France métropolitaine',
   'Interne en orthopédie dento-faciale (2e année) au CHU de Montpellier. Disponible ponctuellement pour des remplacements en orthodontie.',
   null, null, null, 'Université de Montpellier', null, null, null, null,
   null, true, true, '2024-06-20', null, '2027-10-31', 'orthodontie', '2e année',
   'CHU de Montpellier', true, 2, array['Français','Anglais'], 150, false, true, true, false,
   array['liberal','recurrent'], array['temps_partiel'], 88),
  ('bbbbbbbb-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222204',
   'qualified_dentist', '1988-07-25', 'remplacant.marseille@dentmatch.example', '30 rue Paradis',
   '13001', 'Marseille', 'France métropolitaine',
   'Omnipraticien expérimenté (10 ans), à l''aise sur la chirurgie et l''implantologie. Recherche remplacements longue durée.',
   '10087654321', 'Bouches-du-Rhône', 2016, 'Aix-Marseille Université', 'Mixte', true,
   'AXA', '2026-12-31', null, null, null, null, null, null, null, null, null, null,
   10, array['Français','Italien'], 100, true, true, true, false,
   array['liberal','longue_duree','temps_plein'], array['temps_plein'], 94),
  ('bbbbbbbb-0000-4000-8000-000000000010', '33333333-3333-4333-8333-333333333301',
   null, null, null, null, null, null, null, null, null, null, null, null, null, null,
   null, null, null, null, null, null, null, null, null, null, null, null,
   null, '{}', null, null, null, null, null, '{}', '{}', 0)
on conflict (id) do nothing;

-- Spécialités des remplaçants
insert into public.profile_specialties (user_id, specialty_id)
select '22222222-2222-4222-8222-222222222201'::uuid, id from public.specialties where code in ('omnipratique','endodontie','prothese','urgences')
union all
select '22222222-2222-4222-8222-222222222202'::uuid, id from public.specialties where code in ('omnipratique','urgences')
union all
select '22222222-2222-4222-8222-222222222203'::uuid, id from public.specialties where code in ('orthodontie')
union all
select '22222222-2222-4222-8222-222222222204'::uuid, id from public.specialties where code in ('omnipratique','implantologie','chirurgie_orale')
on conflict do nothing;

-- Zones de mobilité
insert into public.mobility_areas (user_id, area_type, area_value) values
  ('22222222-2222-4222-8222-222222222201', 'region', 'Nouvelle-Aquitaine'),
  ('22222222-2222-4222-8222-222222222201', 'region', 'Occitanie'),
  ('22222222-2222-4222-8222-222222222201', 'territory', 'La Réunion'),
  ('22222222-2222-4222-8222-222222222201', 'territory', 'Guadeloupe'),
  ('22222222-2222-4222-8222-222222222202', 'region', 'Nouvelle-Aquitaine'),
  ('22222222-2222-4222-8222-222222222203', 'region', 'Occitanie'),
  ('22222222-2222-4222-8222-222222222204', 'region', 'Provence-Alpes-Côte d''Azur')
on conflict do nothing;

-- Disponibilités
insert into public.availabilities (user_id, type, start_date, end_date, recurring_days, notes) values
  ('22222222-2222-4222-8222-222222222201', 'plage', current_date + 7, current_date + 45, '{}', 'Disponible immédiatement, mobile partout en France.'),
  ('22222222-2222-4222-8222-222222222201', 'plage', current_date + 90, current_date + 120, '{}', null),
  ('22222222-2222-4222-8222-222222222202', 'recurrent', null, null, array['samedi'], 'Disponible les samedis pendant l''année universitaire.'),
  ('22222222-2222-4222-8222-222222222202', 'plage', current_date + 14, current_date + 60, '{}', 'Vacances universitaires.'),
  ('22222222-2222-4222-8222-222222222203', 'recurrent', null, null, array['mercredi','vendredi'], null),
  ('22222222-2222-4222-8222-222222222204', 'plage', current_date + 3, current_date + 180, '{}', 'Longue durée possible.');

-- Documents simulés (badge « Document simulé » visible partout)
insert into public.documents (owner_user_id, owner_type, document_type, original_name, mime_type, size_bytes, status, is_simulated, verified_at) values
  ('11111111-1111-4111-8111-111111111101', 'cabinet', 'identity', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('11111111-1111-4111-8111-111111111101', 'cabinet', 'siret', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('11111111-1111-4111-8111-111111111101', 'cabinet', 'ordre_registration', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('11111111-1111-4111-8111-111111111101', 'cabinet', 'rcp_insurance', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('22222222-2222-4222-8222-222222222201', 'replacement_dentist', 'identity', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('22222222-2222-4222-8222-222222222201', 'replacement_dentist', 'ordre_registration', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('22222222-2222-4222-8222-222222222201', 'replacement_dentist', 'rpps', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('22222222-2222-4222-8222-222222222201', 'replacement_dentist', 'rcp_insurance', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('22222222-2222-4222-8222-222222222201', 'replacement_dentist', 'cps', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('22222222-2222-4222-8222-222222222202', 'replacement_dentist', 'identity', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('22222222-2222-4222-8222-222222222202', 'replacement_dentist', 'year_validation', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('22222222-2222-4222-8222-222222222202', 'replacement_dentist', 'csct', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('22222222-2222-4222-8222-222222222202', 'replacement_dentist', 'replacement_license', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now()),
  ('22222222-2222-4222-8222-222222222202', 'replacement_dentist', 'criminal_record', 'document-demo.pdf', 'application/pdf', 0, 'verified', true, now())
on conflict (owner_user_id, document_type) do nothing;

-- ---------------------------------------------------------------------------
-- Annonces
-- ---------------------------------------------------------------------------

insert into public.job_posts (
  id, cabinet_id, created_by, title, description, status, replacement_reason,
  contract_type, replacement_type, start_date, end_date, working_days, full_time,
  specialty_id, experience_required, compensation_type, compensation_value,
  accommodation_provided, travel_covered, urgent, positions_count,
  application_deadline, city, postal_code, department, region, territory, published_at
) values
  ('cccccccc-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001',
   '11111111-1111-4111-8111-111111111101', 'Remplacement omnipratique — Lyon 6e',
   'Remplacement de notre associée pendant son congé maternité. Patientèle agréable et fidèle, assistante dédiée au fauteuil, planning rempli. Omnipratique complète : soins conservateurs, prothèse, urgences.',
   'published', 'maternite', 'liberal', 'longue_duree',
   current_date + 21, current_date + 111, array['lundi','mardi','jeudi','vendredi'], true,
   (select id from public.specialties where code = 'omnipratique'), '1_3_ans', 'retrocession', 55,
   false, false, false, 1, current_date + 14,
   'Lyon', '69006', 'Rhône', 'Auvergne-Rhône-Alpes', 'France métropolitaine', now() - interval '6 days'),
  ('cccccccc-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000002',
   '11111111-1111-4111-8111-111111111102', 'Remplacement urgent — Paris 9e',
   'Arrêt maladie imprévu : nous cherchons un remplaçant dès que possible pour 3 semaines. Cabinet organisé, secrétariat sur place, logiciel Julie.',
   'published', 'maladie', 'liberal', 'urgence',
   current_date + 3, current_date + 24, array['lundi','mardi','mercredi','jeudi','vendredi'], true,
   (select id from public.specialties where code = 'omnipratique'), 'debutant_accepte', 'retrocession', 50,
   false, false, true, 1, current_date + 2,
   'Paris', '75009', 'Paris', 'Île-de-France', 'France métropolitaine', now() - interval '1 day'),
  ('cccccccc-0000-4000-8000-000000000003', 'aaaaaaaa-0000-4000-8000-000000000003',
   '11111111-1111-4111-8111-111111111103', 'Remplacement 2 mois — Saint-Denis, La Réunion',
   'Remplacement pendant congés annuels. Cabinet individuel au centre-ville de Saint-Denis, assistante expérimentée, patientèle familiale. Aide à l''installation sur place, logement de fonction proposé.',
   'published', 'conges', 'liberal', 'ponctuel',
   current_date + 30, current_date + 90, array['lundi','mardi','mercredi','jeudi','vendredi'], true,
   (select id from public.specialties where code = 'omnipratique'), 'debutant_accepte', 'retrocession', 50,
   true, true, false, 1, current_date + 20,
   'Saint-Denis', '97400', 'La Réunion', 'La Réunion', 'La Réunion', now() - interval '3 days'),
  ('cccccccc-0000-4000-8000-000000000004', 'aaaaaaaa-0000-4000-8000-000000000004',
   '11111111-1111-4111-8111-111111111104', 'Collaboration temporaire — Pointe-à-Pitre',
   'Renfort pour notre centre de santé pendant une formation longue d''un praticien. Salariat, plateau technique complet, équipe soudée.',
   'published', 'formation', 'salarie', 'longue_duree',
   current_date + 15, current_date + 195, array['lundi','mardi','jeudi','vendredi'], false,
   (select id from public.specialties where code = 'omnipratique'), '3_5_ans', 'salaire', 6500,
   true, false, false, 1, null,
   'Pointe-à-Pitre', '97110', 'Guadeloupe', 'Guadeloupe', 'Guadeloupe', now() - interval '10 days'),
  ('cccccccc-0000-4000-8000-000000000005', 'aaaaaaaa-0000-4000-8000-000000000005',
   '11111111-1111-4111-8111-111111111105', 'Remplacement orthodontie — Fort-de-France',
   'Remplacement de notre orthodontiste un mercredi sur deux. Réservé aux praticiens qualifiés en ODF ou internes de la spécialité.',
   'published', 'absence_ponctuelle', 'liberal', 'recurrent',
   current_date + 10, current_date + 130, array['mercredi'], false,
   (select id from public.specialties where code = 'orthodontie'), '1_3_ans', 'forfait_journalier', 600,
   false, false, false, 1, null,
   'Fort-de-France', '97200', 'Martinique', 'Martinique', 'Martinique', now() - interval '2 days'),
  ('cccccccc-0000-4000-8000-000000000006', 'aaaaaaaa-0000-4000-8000-000000000001',
   '11111111-1111-4111-8111-111111111101', 'Remplacement d''été — Lyon (brouillon)',
   'Brouillon de l''annonce pour les congés d''été. À compléter avant publication.',
   'draft', 'conges', 'liberal', 'ponctuel',
   current_date + 150, current_date + 180, '{}', true,
   null, null, 'a_discuter', null, false, false, false, 1, null,
   'Lyon', '69006', 'Rhône', 'Auvergne-Rhône-Alpes', 'France métropolitaine', null)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Candidatures (une acceptée → remplacement + conversation)
-- ---------------------------------------------------------------------------

insert into public.applications (
  id, job_post_id, applicant_user_id, status, message, confirmed_availability,
  submitted_at, viewed_at, accepted_at
) values
  -- Acceptée : Camille → Cabinet du Parc (Lyon)
  ('dddddddd-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001',
   '22222222-2222-4222-8222-222222222201', 'accepted',
   'Bonjour, votre annonce correspond exactement à ce que je recherche : je suis disponible sur toute la période et j''ai l''habitude des cabinets de groupe. Six ans d''omnipratique, à l''aise sur Logos. Au plaisir d''échanger !',
   true, now() - interval '5 days', now() - interval '4 days', now() - interval '3 days'),
  -- En attente : Julien → Lyon
  ('dddddddd-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000001',
   '22222222-2222-4222-8222-222222222204', 'viewed',
   'Bonjour, omnipraticien avec 10 ans d''expérience, je peux me libérer sur la période. Habitué aux fortes activités.',
   true, now() - interval '4 days', now() - interval '3 days', null),
  -- Envoyée : Camille → La Réunion
  ('dddddddd-0000-4000-8000-000000000003', 'cccccccc-0000-4000-8000-000000000003',
   '22222222-2222-4222-8222-222222222201', 'submitted',
   'Bonjour, je serais ravie de découvrir l''exercice à La Réunion. Je suis mobile et autonome, et la période me convient parfaitement.',
   true, now() - interval '2 days', null, null),
  -- Envoyée : Théo (étudiant) → Paris urgent
  ('dddddddd-0000-4000-8000-000000000004', 'cccccccc-0000-4000-8000-000000000002',
   '22222222-2222-4222-8222-222222222202', 'submitted',
   'Bonjour, étudiant en 6e année (5e année validée, CSCT obtenu, licence de remplacement en cours de validité), je suis disponible immédiatement sur Paris.',
   true, now() - interval '12 hours', null, null),
  -- Refusée : Julien → Guadeloupe
  ('dddddddd-0000-4000-8000-000000000005', 'cccccccc-0000-4000-8000-000000000004',
   '22222222-2222-4222-8222-222222222204', 'rejected',
   'Bonjour, très intéressé par une longue mission aux Antilles.',
   true, now() - interval '8 days', now() - interval '7 days', null)
on conflict (id) do nothing;

update public.applications set rejected_at = now() - interval '6 days'
where id = 'dddddddd-0000-4000-8000-000000000005';

-- Remplacement issu de la candidature acceptée
insert into public.placements (
  id, job_post_id, application_id, cabinet_id, replacement_user_id, status,
  start_date, end_date, administrative_checklist, confirmed_at
) values (
  'eeeeeeee-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001',
  'dddddddd-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001',
  '22222222-2222-4222-8222-222222222201', 'confirmed',
  current_date + 21, current_date + 111,
  '{"application_accepted": true, "contact_exchanged": true, "contract_to_prepare": true}'::jsonb,
  now() - interval '3 days'
)
on conflict (id) do nothing;

-- L'annonce est pourvue
update public.job_posts
set status = 'filled', filled_positions_count = 1
where id = 'cccccccc-0000-4000-8000-000000000001';

-- Conversation entre le cabinet et la remplaçante acceptée
insert into public.conversations (id, job_post_id, placement_id) values
  ('ffffffff-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001',
   'eeeeeeee-0000-4000-8000-000000000001')
on conflict (id) do nothing;

insert into public.conversation_members (conversation_id, user_id, last_read_at) values
  ('ffffffff-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111101', now() - interval '1 day'),
  ('ffffffff-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222201', now() - interval '2 hours')
on conflict do nothing;

insert into public.messages (conversation_id, sender_id, content, created_at) values
  ('ffffffff-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111101',
   'Bonjour Camille, ravie de vous compter parmi nous pour ce remplacement ! Souhaitez-vous passer au cabinet la semaine prochaine pour une visite ?', now() - interval '3 days'),
  ('ffffffff-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222201',
   'Bonjour, avec grand plaisir ! Je peux passer mardi ou mercredi en fin de journée, comme cela vous arrange.', now() - interval '2 days 20 hours'),
  ('ffffffff-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111101',
   'Parfait pour mardi 18 h. Je vous enverrai les informations pratiques (accès, logiciel, planning) d''ici là. À mardi !', now() - interval '2 days 18 hours');

-- Notifications complémentaires (les triggers n'ont pas joué sur ces inserts directs)
insert into public.notifications (user_id, type, title, body, metadata, read_at, created_at) values
  ('22222222-2222-4222-8222-222222222201', 'application_accepted', 'Candidature acceptée',
   'Votre candidature pour « Remplacement omnipratique — Lyon 6e » a été acceptée. Une conversation est ouverte avec le cabinet.',
   '{"job_post_id":"cccccccc-0000-4000-8000-000000000001"}'::jsonb, null, now() - interval '3 days'),
  ('11111111-1111-4111-8111-111111111101', 'new_application', 'Nouvelle candidature reçue',
   'Un remplaçant a candidaté à votre annonce « Remplacement omnipratique — Lyon 6e ».',
   '{"job_post_id":"cccccccc-0000-4000-8000-000000000001"}'::jsonb, now() - interval '3 days', now() - interval '4 days'),
  ('11111111-1111-4111-8111-111111111103', 'new_application', 'Nouvelle candidature reçue',
   'Un remplaçant a candidaté à votre annonce « Remplacement 2 mois — Saint-Denis, La Réunion ».',
   '{"job_post_id":"cccccccc-0000-4000-8000-000000000003"}'::jsonb, null, now() - interval '2 days'),
  ('22222222-2222-4222-8222-222222222201', 'profile_verified', 'Profil test vérifié',
   'Tous vos documents obligatoires sont fournis. Votre profil de test est vérifié.',
   '{}'::jsonb, now() - interval '5 days', now() - interval '6 days');

-- Événements d'audit de démonstration
insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata) values
  ('11111111-1111-4111-8111-111111111101', 'job_post_published', 'job_post', 'cccccccc-0000-4000-8000-000000000001', '{}'::jsonb),
  ('22222222-2222-4222-8222-222222222201', 'application_submitted', 'job_post', 'cccccccc-0000-4000-8000-000000000001', '{}'::jsonb),
  ('11111111-1111-4111-8111-111111111101', 'application_accepted', 'application', 'dddddddd-0000-4000-8000-000000000001',
   '{"placement_id":"eeeeeeee-0000-4000-8000-000000000001"}'::jsonb);
