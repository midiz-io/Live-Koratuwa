-- Migration: Add missing fields to boxes table
-- This adds the name, description, funFact, mainImage, images, and audioUrl columns
-- that are referenced in the Prisma schema

-- Add columns to boxes table
ALTER TABLE boxes
ADD COLUMN IF NOT EXISTS number INTEGER UNIQUE NOT NULL,
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Untitled Box',
ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "funFact" TEXT,
ADD COLUMN IF NOT EXISTS "mainImage" TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS images JSONB,
ADD COLUMN IF NOT EXISTS "audioUrl" TEXT,
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_boxes_number ON boxes(number);
CREATE INDEX IF NOT EXISTS idx_boxes_created_at ON boxes("createdAt");
