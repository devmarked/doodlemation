# Data Directory

This directory contains example JSON files for testing and reference.

## Files

### `generations.json`

Example generations data structure. You can import this file using the "Import JSON" button in the SavedGenerations component to populate your database with sample data.

**Usage:**

1. Open the app
2. Click "Saved Generations" button
3. Click "Import JSON"
4. Select `generations.json`
5. Sample data will be imported to the database

**Note:** This is example data for testing purposes. The actual data is now stored in the Supabase database (`public.generations` table), not in JSON files.

## Migration Note

Previously, generations were stored in browser localStorage. They are now stored in a Supabase PostgreSQL database for:

- ✅ Persistent storage (survives cache clearing)
- ✅ Cross-device access
- ✅ No storage limits
- ✅ Better scalability

See `DATABASE_MIGRATION_SUMMARY.md` for details.

