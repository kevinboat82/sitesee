const db = require('./config/db');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        const email = 'admin@sitesee.com';
        const password = 'admin'; // Simple password for now

        // Check if exists
        const check = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            console.log('Admin user already exists.');
            // Update role just in case
            await db.query("UPDATE users SET role = 'ADMIN' WHERE email = $1", [email]);
            console.log('Ensured role is ADMIN.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await db.query(
            `INSERT INTO users (email, password_hash, full_name, role) 
       VALUES ($1, $2, 'SiteSee Admin', 'ADMIN')`,
            [email, hash]
        );

        console.log(`✅ Admin Created! \nEmail: ${email} \nPassword: ${password}`);
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
