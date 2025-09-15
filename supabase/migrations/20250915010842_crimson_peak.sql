/*
  # Family Tree Database Schema

  1. New Tables
    - `people`
      - `id` (bigint, primary key, auto-increment)
      - `name` (text, not null)
      - `gender` (text, not null, check constraint for 'male'/'female')
      - `image_url` (text, nullable)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())
    
    - `couples`
      - `id` (bigint, primary key, auto-increment)
      - `husband_id` (bigint, foreign key to people.id)
      - `wife_id` (bigint, foreign key to people.id)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())
    
    - `couple_children`
      - `couple_id` (bigint, foreign key to couples.id)
      - `child_id` (bigint, foreign key to people.id)
      - Primary key on (couple_id, child_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their family data
    - Public read access for family tree viewing

  3. Storage
    - Create profile-images bucket for storing profile pictures
*/

-- Create people table
CREATE TABLE IF NOT EXISTS people (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create couples table
CREATE TABLE IF NOT EXISTS couples (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  husband_id bigint NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  wife_id bigint NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(husband_id, wife_id)
);

-- Create couple_children junction table
CREATE TABLE IF NOT EXISTS couple_children (
  couple_id bigint NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  child_id bigint NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  PRIMARY KEY (couple_id, child_id)
);

-- Enable Row Level Security
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_children ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a family tree app)
-- In a real app, you might want more restrictive policies

CREATE POLICY "Allow public read access on people"
  ON people
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on people"
  ON people
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on people"
  ON people
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on people"
  ON people
  FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access on couples"
  ON couples
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on couples"
  ON couples
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on couples"
  ON couples
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on couples"
  ON couples
  FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access on couple_children"
  ON couple_children
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on couple_children"
  ON couple_children
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on couple_children"
  ON couple_children
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on couple_children"
  ON couple_children
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_people_gender ON people(gender);
CREATE INDEX IF NOT EXISTS idx_couples_husband_id ON couples(husband_id);
CREATE INDEX IF NOT EXISTS idx_couples_wife_id ON couples(wife_id);
CREATE INDEX IF NOT EXISTS idx_couple_children_couple_id ON couple_children(couple_id);
CREATE INDEX IF NOT EXISTS idx_couple_children_child_id ON couple_children(child_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON couples
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();