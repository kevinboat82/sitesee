// migrate_job_timer.js - Add job claim timer functionality
const db = require('./config/db');

const runMigration = async () => {
    try {
        console.log('⏳ Adding job claim timer columns...\n');

        // Add claimed_at timestamp to track when a scout claimed the job
        await db.query(`
      ALTER TABLE visit_requests 
      ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS claim_expires_at TIMESTAMP;
    `);

        console.log('✅ Job claim timer columns added successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
};

runMigration();
