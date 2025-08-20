/*
  # Setup Authentication System

  1. New Tables
    - `accounts` table linked to auth.users
      - `id` (uuid, primary key, references auth.users.id)
      - `email` (text, unique)
      - `pharmacy_name` (text)
      - `pharmacy_phone` (text)
      - `address1` (text)
      - `city` (text)
      - `state` (text)
      - `zipcode` (text)
      - `subscription_status` (text, default 'active')
      - `role` (text, default 'member')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on accounts table
    - Add policies for users to read/update their own data
    - Add policy for users to insert their own profile after signup

  3. Triggers
    - Auto-create account profile when user signs up
    - Update timestamps on profile changes
*/

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  pharmacy_name text,
  pharmacy_phone text,
  address1 text,
  city text,
  state text,
  zipcode text,
  subscription_status text DEFAULT 'active',
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own account"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own account"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own account"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO accounts (id, email, role)
  VALUES (new.id, new.email, 'member');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();