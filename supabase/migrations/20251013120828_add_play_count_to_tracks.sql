/*
  # Add play count tracking to tracks
  
  1. Changes
    - Add `play_count` column to `tracks` table
      - `play_count` (integer, default 0) - tracks number of plays
  
  2. Purpose
    - Enable tracking of track popularity
    - Support "top tracks" feature on artist pages
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracks' AND column_name = 'play_count'
  ) THEN
    ALTER TABLE tracks ADD COLUMN play_count integer DEFAULT 0;
  END IF;
END $$;
