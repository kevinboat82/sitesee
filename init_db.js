// init_db.js
const db = require('./config/db');

const createTables = async () => {
  try {
    console.log('⏳ Creating tables...');

    // 1. Enable UUID extension
    await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. Create USERS Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        phone_number VARCHAR(50),
        role VARCHAR(20) DEFAULT 'CLIENT', -- CLIENT, SCOUT, ADMIN
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create PROPERTIES Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255),
        gps_location VARCHAR(100),
        description TEXT,
        caretaker_phone VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create SUBSCRIPTIONS Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        paystack_sub_code VARCHAR(100),
        paystack_email_token VARCHAR(100),
        plan_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'ACTIVE',
        current_period_end TIMESTAMP,
        auto_renew BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create VISIT REQUESTS Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS visit_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        assigned_scout_id UUID REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'PENDING',
        scheduled_date DATE,
        admin_notes TEXT,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create MEDIA Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS media (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        visit_id UUID REFERENCES visit_requests(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        media_type VARCHAR(20) DEFAULT 'IMAGE',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ All tables created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating tables:', err);
    process.exit(1);
  }
};

createTables();