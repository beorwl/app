/*
  # Fix Artist Creation RLS Policy

  ## Changes
  
  1. Drop and recreate the INSERT policy for artists table
     - The previous policy was checking both account_type AND owner_id in WITH CHECK
     - Simplify to only check account_type in the subquery and owner_id separately
     - This ensures artist accounts can create artists when owner_id matches auth.uid()

  ## Policy Details
  
  - Policy checks that user has account_type = 'artist' in user_profiles
  - Policy ensures the owner_id being inserted matches the authenticated user's ID
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Artist accounts can create artists" ON artists;

-- Create a new, simpler INSERT policy
CREATE POLICY "Artist accounts can create artists"
  ON artists
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.account_type = 'artist'
    )
    AND owner_id = auth.uid()
  );