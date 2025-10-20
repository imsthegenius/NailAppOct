# 🚨 URGENT: Supabase Project Setup Required

## Problem Identified
The Supabase URL `https://zxbdrhvmjuprsfocmnos.supabase.co` **does not exist**. DNS lookup fails, meaning:
- The project has been deleted
- The project never existed
- The project is suspended

## Solution: Create New Supabase Project

### Step 1: Create Supabase Project
1. Go to https://app.supabase.com
2. Sign in or create account
3. Click "New Project"
4. Enter:
   - Project name: `nailglow` (or any name)
   - Database password: (save this!)
   - Region: Choose closest to you
5. Click "Create Project"
6. Wait for project to be ready (~2 minutes)

### Step 2: Get Your Credentials
Once project is ready:
1. Go to Settings → API
2. Copy:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Anon/Public Key**: `eyJ...` (long string)

### Step 3: Update App Configuration

Create a `.env` file in the root directory:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

Or directly update `/lib/supabase.ts`:
```typescript
const supabaseUrl = 'https://[your-project-id].supabase.co';
const supabaseAnonKey = 'eyJ...your-anon-key...';
```

### Step 4: Set Up Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create saved_colors table
CREATE TABLE saved_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  color_name TEXT,
  hex_code TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create nail_transformations table
CREATE TABLE nail_transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT,
  transformed_image_url TEXT,
  color_used TEXT,
  shape_used TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE nail_transformations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own saved colors" ON saved_colors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved colors" ON saved_colors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved colors" ON saved_colors
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transformations" ON nail_transformations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transformations" ON nail_transformations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Step 5: Configure Authentication
1. Go to Authentication → Settings
2. Disable email confirmations (for easier testing):
   - Under "Email Auth" → Turn OFF "Enable email confirmations"
3. Save changes

### Step 6: Test Connection
After updating credentials:
1. Restart the app: `npm start`
2. Try signing up
3. Check console for success messages

## If You Have Access to Original Project

If you think the project still exists:
1. Log into https://app.supabase.com
2. Check if project `zxbdrhvmjuprsfocmnos` exists
3. If it exists but is paused, unpause it
4. If it's deleted, create a new one following steps above

## Current Status
The app is using **Mock Authentication** as a fallback, which works perfectly for development. Once you set up a new Supabase project, real authentication will work automatically.