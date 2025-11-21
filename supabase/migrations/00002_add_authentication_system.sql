/*
# Add Authentication System

## 1. New Tables

### profiles
- `id` (uuid, primary key, references auth.users.id)
- `username` (text, unique) - Username for login
- `phone` (text, unique) - Phone number
- `email` (text, unique) - Email address
- `role` (user_role enum, default: 'user', not null) - User role: user or admin
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

## 2. Security
- Enable RLS on profiles table
- First registered user becomes admin automatically
- Admins have full access to all profiles
- Users can view their own profile
- Users can update their own profile but cannot change their role
- Helper function to check if user is admin

## 3. Triggers
- Trigger to automatically create profile after auth.users confirmation
- First user gets admin role, subsequent users get user role
- Trigger to update updated_at timestamp

## 4. Notes
- Only profiles.id can reference auth.users(id)
- All other tables should reference profiles(id) for user relationships
- Direct insertion into profiles is prohibited - must go through auth service
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  phone text UNIQUE,
  email text UNIQUE,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- RLS Policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id AND role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Trigger function to create profile after auth confirmation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  -- Only insert into profiles after user is confirmed
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    -- Count existing users in profiles
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    -- Extract username from email (remove @miaoda.com suffix)
    IF NEW.email LIKE '%@miaoda.com' THEN
      extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
    END IF;
    
    -- Insert into profiles, first user gets admin role
    INSERT INTO profiles (id, username, phone, email, role)
    VALUES (
      NEW.id,
      extracted_username,
      NEW.phone,
      NEW.email,
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();