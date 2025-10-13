/*
  # Remove email column from user_profiles

  ## Changes
  - Remove the `email` column from `user_profiles` table since email is already available in `auth.users`
  - The email can be accessed via the auth relationship when needed
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles DROP COLUMN email;
  END IF;
END $$;