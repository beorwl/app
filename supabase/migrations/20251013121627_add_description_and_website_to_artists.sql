/*
  # Add description and website to artists
  
  1. Changes
    - Add `description` column to `artists` table
      - `description` (text, nullable) - short description of the artist
    - Add `website` column to `artists` table
      - `website` (text, nullable) - artist's website URL
  
  2. Purpose
    - Enable artists to provide detailed information about themselves
    - Allow artists to link to their external websites
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artists' AND column_name = 'description'
  ) THEN
    ALTER TABLE artists ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artists' AND column_name = 'website'
  ) THEN
    ALTER TABLE artists ADD COLUMN website text;
  END IF;
END $$;
