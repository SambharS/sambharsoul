-- Migration: Add FCM tokens table for push notifications
-- Date: 2025-11-08
-- Description: Creates table to store Firebase Cloud Messaging tokens for push notifications

-- Create FCM tokens table
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
  fcm_token TEXT NOT NULL,
  device_info TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, fcm_token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_role ON fcm_tokens(role);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON fcm_tokens(fcm_token);

-- Enable Row Level Security
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fcm_tokens
CREATE POLICY "Users can view own tokens" ON fcm_tokens FOR SELECT USING (
  auth.uid()::text IN (SELECT firebase_uid::text FROM users WHERE id = user_id)
);

CREATE POLICY "Users can insert own tokens" ON fcm_tokens FOR INSERT WITH CHECK (
  auth.uid()::text IN (SELECT firebase_uid::text FROM users WHERE id = user_id)
);

CREATE POLICY "Users can update own tokens" ON fcm_tokens FOR UPDATE USING (
  auth.uid()::text IN (SELECT firebase_uid::text FROM users WHERE id = user_id)
);

CREATE POLICY "Users can delete own tokens" ON fcm_tokens FOR DELETE USING (
  auth.uid()::text IN (SELECT firebase_uid::text FROM users WHERE id = user_id)
);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_fcm_tokens_updated_at 
  BEFORE UPDATE ON fcm_tokens
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE fcm_tokens IS 'Stores Firebase Cloud Messaging tokens for push notifications';
COMMENT ON COLUMN fcm_tokens.role IS 'User role: user or admin';
COMMENT ON COLUMN fcm_tokens.fcm_token IS 'Firebase Cloud Messaging device token';
COMMENT ON COLUMN fcm_tokens.device_info IS 'Optional device/browser information';
