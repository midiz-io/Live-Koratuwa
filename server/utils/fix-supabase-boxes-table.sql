-- Direct SQL fix for Supabase boxes table
-- Run this script in your Supabase SQL editor to add missing columns

-- Step 1: Add missing columns to boxes table (if they don't exist)
ALTER TABLE IF EXISTS boxes
ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'Untitled Box',
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "funFact" TEXT,
ADD COLUMN IF NOT EXISTS "mainImage" VARCHAR(500) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS images JSON,
ADD COLUMN IF NOT EXISTS "audioUrl" VARCHAR(500);

-- Step 2: Ensure id, number, createdAt, updatedAt exist
ALTER TABLE IF EXISTS boxes
ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY,
ADD COLUMN IF NOT EXISTS number INTEGER UNIQUE,
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_boxes_number ON boxes(number DESC);
CREATE INDEX IF NOT EXISTS idx_boxes_created_at ON boxes("createdAt" DESC);

-- Step 4: Set up update trigger for updatedAt field (optional but recommended)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_boxes_updated_at ON boxes;
CREATE TRIGGER update_boxes_updated_at
  BEFORE UPDATE ON boxes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Done
COMMIT;
