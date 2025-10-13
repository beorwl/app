/*
  # Create Storage Buckets for Images

  ## Overview
  Sets up Supabase Storage buckets for storing artist images, album covers, and other media files.

  ## 1. Storage Buckets
  
  ### `images`
  - Public bucket for artist images and album covers
  - Allows authenticated users to upload images
  - Public read access for all users

  ## 2. Security
  
  ### Storage Policies
  - Authenticated users can upload images
  - Everyone can view images (public read)
  - Users can update/delete their own uploads
*/

-- Create the images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow public read access to images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND owner::uuid = auth.uid())
WITH CHECK (bucket_id = 'images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND owner::uuid = auth.uid());