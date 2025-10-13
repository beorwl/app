/*
  # Replace play count with playtime tracking

  1. Changes
    - Remove `play_count` column from `tracks` table
    - Add `total_playtime_seconds` column to `tracks` table
      - `total_playtime_seconds` (integer, default 0) - total seconds the track has been played by all users

  2. Purpose
    - Track cumulative playtime in seconds instead of simple play counts
    - Provides better insights into actual listening behavior
*/

DO $$
BEGIN
  -- Remove play_count column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracks' AND column_name = 'play_count'
  ) THEN
    ALTER TABLE tracks DROP COLUMN play_count;
  END IF;
  
  -- Add total_playtime_seconds column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracks' AND column_name = 'total_playtime_seconds'
  ) THEN
    ALTER TABLE tracks ADD COLUMN total_playtime_seconds integer DEFAULT 0;
  END IF;
END $$;
