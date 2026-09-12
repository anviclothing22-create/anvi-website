-- ANVI Clothing — Storage buckets + policies v1

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images','product-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('hero-banners','hero-banners', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('ambience-gallery','ambience-gallery', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('blog-images','blog-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('instagram-cache','instagram-cache', true, 3145728, array['image/jpeg','image/png','image/webp']),
  ('avatars','avatars', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read product-images" on storage.objects;
create policy "public read product-images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
drop policy if exists "public read hero-banners" on storage.objects;
create policy "public read hero-banners" on storage.objects
  for select to anon, authenticated using (bucket_id = 'hero-banners');
drop policy if exists "public read ambience-gallery" on storage.objects;
create policy "public read ambience-gallery" on storage.objects
  for select to anon, authenticated using (bucket_id = 'ambience-gallery');
drop policy if exists "public read blog-images" on storage.objects;
create policy "public read blog-images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'blog-images');
drop policy if exists "public read instagram-cache" on storage.objects;
create policy "public read instagram-cache" on storage.objects
  for select to anon, authenticated using (bucket_id = 'instagram-cache');

drop policy if exists "admin insert public media" on storage.objects;
create policy "admin insert public media" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and public.is_admin()
  );
drop policy if exists "admin update public media" on storage.objects;
create policy "admin update public media" on storage.objects
  for update to authenticated using (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and public.is_admin()
  ) with check (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and public.is_admin()
  );
drop policy if exists "admin delete public media" on storage.objects;
create policy "admin delete public media" on storage.objects
  for delete to authenticated using (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and public.is_admin()
  );

drop policy if exists "avatar select own" on storage.objects;
create policy "avatar select own" on storage.objects
  for select to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "avatar insert own" on storage.objects;
create policy "avatar insert own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "avatar update own" on storage.objects;
create policy "avatar update own" on storage.objects
  for update to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "avatar delete own" on storage.objects;
create policy "avatar delete own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "admin manage avatars" on storage.objects;
create policy "admin manage avatars" on storage.objects
  for all to authenticated using (bucket_id = 'avatars' and public.is_admin())
  with check (bucket_id = 'avatars' and public.is_admin());
