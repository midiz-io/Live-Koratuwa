#!/usr/bin/env node

/**
 * Database Verification Script
 * 
 * This script verifies that the Supabase boxes table has all required columns
 * and that boxes have proper data for the admin panel to display them correctly.
 * 
 * Usage: node verify-boxes-table.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyBoxesTable() {
  console.log('🔍 Verifying Supabase boxes table...\n');

  try {
    // 1. Check if table exists by fetching one row
    console.log('1️⃣  Checking if boxes table exists...');
    const { data, error } = await supabase
      .from('boxes')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.error('❌ boxes table does not exist!');
        console.error('   Action: Create the table in Supabase dashboard first');
        process.exit(1);
      }
      throw error;
    }
    console.log('✅ boxes table exists\n');

    // 2. Get table schema by selecting all columns
    console.log('2️⃣  Checking table columns...');
    const { data: allData, error: schemaError } = await supabase
      .from('boxes')
      .select('*')
      .limit(1);

    if (allData && allData.length > 0) {
      const columns = Object.keys(allData[0]);
      console.log('   Found columns:', columns.join(', '));

      const requiredColumns = ['id', 'number', 'name', 'description', 'mainImage'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));

      if (missingColumns.length > 0) {
        console.error('❌ Missing required columns:', missingColumns.join(', '));
        console.error('   Action: Run fix-supabase-boxes-table.sql in Supabase SQL Editor');
        process.exit(1);
      }
      console.log('✅ All required columns present\n');
    } else {
      console.log('⚠️  No boxes in table yet (this is ok for new databases)\n');
    }

    // 3. Check for boxes with empty name or description
    console.log('3️⃣  Checking existing boxes...');
    const { data: boxes, error: boxError } = await supabase
      .from('boxes')
      .select('id, number, name, description, mainImage')
      .order('number', { ascending: true });

    if (boxError) {
      throw boxError;
    }

    if (!boxes || boxes.length === 0) {
      console.log('✅ No boxes to verify (start by creating your first box)\n');
    } else {
      console.log(`   Found ${boxes.length} box(es):`);
      
      let hasIssues = false;
      boxes.forEach((box, index) => {
        const issues = [];
        if (!box.name || box.name === '') issues.push('empty name');
        if (!box.description || box.description === '') issues.push('empty description');
        if (!box.mainImage || box.mainImage === '') issues.push('no main image');

        if (issues.length > 0) {
          console.log(`   ❌ Box #${box.number}: ${issues.join(', ')}`);
          hasIssues = true;
        } else {
          console.log(`   ✅ Box #${box.number}: "${box.name}" (OK)`);
        }
      });

      if (hasIssues) {
        console.log('\n⚠️  Some boxes have missing data!');
        console.log('   Action: Edit these boxes in the admin panel and fill in the missing fields');
      } else {
        console.log('\n✅ All boxes have required data\n');
      }
    }

    // 4. Final summary
    console.log('\n✨ Verification complete!');
    console.log('   Next steps:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Open admin panel: http://localhost:5173/admin');
    console.log('   3. Try editing or creating a box');
    console.log('   4. Verify the name and description fields are visible and working');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    if (error.details) {
      console.error('   Details:', error.details);
    }
    process.exit(1);
  }
}

// Run verification
verifyBoxesTable();
