# Admin Panel Box Edit - Debug & Fix Guide

## Issue Description
When updating garden boxes in the admin panel, the box name and description fields are not showing or loading properly.

## Root Cause
The Supabase `boxes` table is missing critical columns (`name`, `description`, `funFact`, `mainImage`, `images`, `audioUrl`) that are required by the API and admin interface.

## Solution

### Step 1: Fix Supabase Database Schema

1. **Open Supabase Dashboard**:
   - Go to [https://supabase.com](https://supabase.com)
   - Select your LiveKaratuwa project
   - Navigate to SQL Editor

2. **Run the Database Fix Script**:
   - Copy the SQL from `server/utils/fix-supabase-boxes-table.sql`
   - Paste it into the Supabase SQL Editor
   - Click "RUN"

3. **Verify the Changes**:
   - Go to Database > Tables > boxes
   - Confirm you see these columns:
     - `id`
     - `number`
     - `name`
     - `description`
     - `funFact`
     - `mainImage`
     - `images`
     - `audioUrl`
     - `createdAt`
     - `updatedAt`

### Step 2: Verify Existing Boxes Have Data

If you already have boxes in the database, check if they have name and description values:

```sql
SELECT id, number, name, description FROM boxes LIMIT 5;
```

If the result shows NULL or empty values for `name` and `description`, you may need to update them:

```sql
UPDATE boxes 
SET name = 'Box ' || number, 
    description = 'Garden box ' || number
WHERE name IS NULL OR name = '';
```

### Step 3: Test Locally

1. **Start the development server**:
   ```bash
   npm install
   npm run server:dev
   ```

2. **Open admin panel**:
   - Go to [http://localhost:5173/admin](http://localhost:5173/admin)
   - Login with admin credentials

3. **Edit a box**:
   - Click on any box to edit it
   - The name and description fields should now be visible and populated
   - You should be able to update these fields

4. **Create a new box**:
   - Click "Add Box"
   - Fill in the box number, name, and description
   - Upload a main image
   - Click "Create Box"
   - Verify the new box appears in the list with the name visible

### Step 4: Troubleshooting

**Box fields still empty?**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart the development server
- Check browser console for errors (F12)
- Verify the Supabase table has the correct column names with exact casing

**Images not loading?**
- Verify `mainImage` column exists
- Check that image upload paths are correct
- Ensure Supabase storage bucket is configured

**Database migration errors?**
- Make sure the `boxes` table exists before running the migration
- If table doesn't exist, create it manually in Supabase with the schema
- Run one migration statement at a time to identify any errors

## Files Updated

- `supabase/migrations/002_add_box_fields.sql` - Migration file for the schema changes
- `server/utils/fix-supabase-boxes-table.sql` - Direct SQL script to fix the database

## Next Steps

1. Apply the SQL fix to your Supabase database
2. Test locally to ensure boxes load with names and descriptions
3. Try creating a new box and verify the form works correctly
4. Test editing an existing box

## For Future Database Issues

Always ensure new tables have:
- Proper column definitions in schema files
- Migration files for version control
- Indexes on frequently queried columns
- Proper timestamp fields (`createdAt`, `updatedAt`)
