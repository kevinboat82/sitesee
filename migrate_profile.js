// migrate_profile.js - Add profile columns to users table
const db = require('./config/db');

const runMigration = async () => {
    try {
        console.log('⏳ Adding profile columns to users table...\n');

        await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS profile_image TEXT;
    `);

        console.log('✅ Profile columns added successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
};

runMigration();
