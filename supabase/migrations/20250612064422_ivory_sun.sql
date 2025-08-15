/*
  # Create sessions table for pointing poker

  1. New Tables
    - `sessions`
      - `id` (text, primary key) - Unique session identifier
      - `room_code` (text, unique) - 6-character room code for joining
      - `moderator_id` (text) - ID of the session moderator
      - `participants` (jsonb) - Array of participant objects
      - `current_story` (text) - Current story being estimated
      - `voting_scale` (jsonb) - Voting scale configuration
      - `votes_visible` (boolean) - Whether votes are currently visible
      - `is_active` (boolean) - Whether session is active
      - `created_at` (timestamptz) - When session was created
      - `updated_at` (timestamptz) - When session was last updated

  2. Security
    - Enable RLS on `sessions` table
    - Add policies for public read/write access (no auth required)
    - Add indexes for performance

  3. Real-time
    - Enable real-time updates for the sessions table
*/

-- Create the sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY,
  room_code text UNIQUE NOT NULL,
  moderator_id text NOT NULL,
  participants jsonb DEFAULT '[]'::jsonb,
  current_story text DEFAULT '',
  voting_scale jsonb NOT NULL,
  votes_visible boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public read access to sessions"
  ON sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to sessions"
  ON sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to sessions"
  ON sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to sessions"
  ON sessions
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_room_code ON sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- Enable real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();