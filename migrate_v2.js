// migrate_v2.js - Dashboard Enhancement Schema Updates
// Adds tables for scout earnings, ratings, achievements, and notes

const db = require('./config/db');

const runMigration = async () => {
    try {
        console.log('⏳ Running Dashboard Enhancement Migration...\n');

        // 1. Add new columns to visit_requests table
        console.log('📝 Adding columns to visit_requests...');
        await db.query(`
      ALTER TABLE visit_requests 
      ADD COLUMN IF NOT EXISTS scout_notes TEXT,
      ADD COLUMN IF NOT EXISTS client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
      ADD COLUMN IF NOT EXISTS client_comment TEXT,
      ADD COLUMN IF NOT EXISTS instructions TEXT,
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
    `);
        console.log('   ✓ visit_requests updated');

        // 2. Create Scout Earnings Table
        console.log('📝 Creating scout_earnings table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS scout_earnings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        scout_id UUID REFERENCES users(id) ON DELETE CASCADE,
        visit_id UUID REFERENCES visit_requests(id) ON DELETE SET NULL,
        amount DECIMAL(10, 2) NOT NULL DEFAULT 25.00,
        status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, PAID
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP
      );
    `);
        console.log('   ✓ scout_earnings created');

        // 3. Create Achievements Table
        console.log('📝 Creating achievements table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),  -- emoji or icon class
        requirement_type VARCHAR(50),  -- JOBS_COMPLETED, RATING_AVG, STREAK, etc.
        requirement_value INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('   ✓ achievements created');

        // 4. Create Scout Achievements Junction Table
        console.log('📝 Creating scout_achievements table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS scout_achievements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        scout_id UUID REFERENCES users(id) ON DELETE CASCADE,
        achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(scout_id, achievement_id)
      );
    `);
        console.log('   ✓ scout_achievements created');

        // 5. Create Activity Feed Table
        console.log('📝 Creating activity_feed table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS activity_feed (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL,  -- VISIT_SCHEDULED, VISIT_COMPLETED, PHOTO_UPLOADED, etc.
        title VARCHAR(255),
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('   ✓ activity_feed created');

        // 6. Add new columns to properties for health scoring
        console.log('📝 Adding health tracking columns to properties...');
        await db.query(`
      ALTER TABLE properties
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS google_maps_link TEXT,
      ADD COLUMN IF NOT EXISTS last_visit_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
    `);
        console.log('   ✓ properties updated');

        // 7. Seed default achievements
        console.log('📝 Seeding default achievements...');
        await db.query(`
      INSERT INTO achievements (name, description, icon, requirement_type, requirement_value)
      VALUES 
        ('First Steps', 'Complete your first job', '🎯', 'JOBS_COMPLETED', 1),
        ('Rising Star', 'Complete 5 jobs', '⭐', 'JOBS_COMPLETED', 5),
        ('Pro Scout', 'Complete 25 jobs', '🏆', 'JOBS_COMPLETED', 25),
        ('Elite Scout', 'Complete 100 jobs', '👑', 'JOBS_COMPLETED', 100),
        ('Five Star', 'Maintain a 5-star average rating', '🌟', 'RATING_AVG', 5),
        ('Speed Demon', 'Complete 3 jobs in one day', '⚡', 'DAILY_JOBS', 3),
        ('Reliable', 'Complete 10 jobs on time', '🎖️', 'ON_TIME', 10)
      ON CONFLICT DO NOTHING;
    `);
        console.log('   ✓ achievements seeded');

        // 8. Create index for performance
        console.log('📝 Creating indexes...');
        await db.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_feed_property ON activity_feed(property_id);
      CREATE INDEX IF NOT EXISTS idx_scout_earnings_scout ON scout_earnings(scout_id);
      CREATE INDEX IF NOT EXISTS idx_visit_requests_status ON visit_requests(status);
    `);
        console.log('   ✓ indexes created');

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        console.error(err);
        process.exit(1);
    }
};

runMigration();
