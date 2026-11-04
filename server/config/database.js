const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required Supabase environment variables!');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client for public/anon operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase admin client for service-level operations (bypasses RLS)
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

console.log('✅ Supabase client initialized');
console.log(`📍 Project: ${supabaseUrl}`);

// Legacy: Construct DATABASE_URL for Prisma (still needed)
const DATABASE_URL = process.env.DATABASE_URL;

module.exports = {
  supabase,
  supabaseAdmin,
  DATABASE_URL
};
