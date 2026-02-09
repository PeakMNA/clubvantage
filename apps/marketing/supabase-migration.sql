-- Marketing Site Tables
-- Run this against your Supabase database

-- Waitlist signups
CREATE TABLE IF NOT EXISTS waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  club_name text,
  role text,
  position serial,
  created_at timestamptz DEFAULT now()
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  club_name text,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  source text DEFAULT 'footer',
  subscribed_at timestamptz DEFAULT now()
);

-- Feature votes (email-gated)
CREATE TABLE IF NOT EXISTS feature_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  feature_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(email, feature_id)
);

-- Feature suggestions
CREATE TABLE IF NOT EXISTS feature_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_suggestions ENABLE ROW LEVEL SECURITY;

-- Policies: Allow service role full access (server actions use service role key)
-- Anon users can insert into waitlist, contact, newsletter, votes, suggestions
CREATE POLICY "Allow anon insert waitlist" ON waitlist_signups FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon insert contact" ON contact_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon insert newsletter" ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon insert votes" ON feature_votes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon delete own votes" ON feature_votes FOR DELETE TO anon USING (true);
CREATE POLICY "Allow anon read votes" ON feature_votes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert suggestions" ON feature_suggestions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon read waitlist count" ON waitlist_signups FOR SELECT TO anon USING (true);
