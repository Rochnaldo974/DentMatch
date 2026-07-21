-- DentMatch — buckets de stockage et policies

-- Bucket public : logos, avatars, photos de cabinets.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-media',
  'public-media',
  true,
  5242880, -- 5 Mo
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Bucket privé : documents professionnels. Jamais public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'private-documents',
  'private-documents',
  false,
  10485760, -- 10 Mo
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- public-media : lecture publique, écriture dans son propre dossier ({user_id}/...).

create policy "public-media: lecture publique"
  on storage.objects for select
  using (bucket_id = 'public-media');

create policy "public-media: dépôt propriétaire"
  on storage.objects for insert
  with check (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "public-media: mise à jour propriétaire"
  on storage.objects for update
  using (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "public-media: suppression propriétaire"
  on storage.objects for delete
  using (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- private-documents : accès strictement limité au propriétaire et aux admins.

create policy "private-documents: lecture propriétaire ou admin"
  on storage.objects for select
  using (
    bucket_id = 'private-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "private-documents: dépôt propriétaire"
  on storage.objects for insert
  with check (
    bucket_id = 'private-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "private-documents: suppression propriétaire"
  on storage.objects for delete
  using (
    bucket_id = 'private-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
