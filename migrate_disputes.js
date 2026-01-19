// migrate_disputes.js - Add disputes table
const db = require('./config/db');

const runMigration = async () => {
    try {
        console.log('⏳ Creating disputes table...\n');

        await db.query(`
      CREATE TABLE IF NOT EXISTS disputes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        visit_id UUID REFERENCES visit_requests(id),
        reporter_id UUID REFERENCES users(id),
        reporter_role VARCHAR(20),
        reason VARCHAR(100),
        description TEXT,
        status VARCHAR(20) DEFAULT 'OPEN',
        resolution TEXT,
        resolved_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );
    `);

        console.log('   ✓ disputes table created');

        // Create index for faster lookups
        await db.query(`
      CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
      CREATE INDEX IF NOT EXISTS idx_disputes_visit ON disputes(visit_id);
    `);

        console.log('   ✓ indexes created');
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
};

runMigration();
