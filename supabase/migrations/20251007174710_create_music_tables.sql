/*
  # Music App Database Schema

  1. New Tables
    - `artists`
      - `id` (uuid, primary key)
      - `name` (text, artist name)
      - `image_url` (text, artist image)
      - `genre` (text, music genre)
      - `created_at` (timestamptz)
    
    - `songs`
      - `id` (uuid, primary key)
      - `title` (text, song title)
      - `artist_id` (uuid, foreign key to artists)
      - `duration` (integer, duration in seconds)
      - `audio_url` (text, URL to audio file)
      - `cover_url` (text, song cover image)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add public read access policies (music browsing app)
*/

CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  genre text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  duration integer DEFAULT 0,
  audio_url text NOT NULL,
  cover_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artists"
  ON artists
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view songs"
  ON songs
  FOR SELECT
  TO public
  USING (true);