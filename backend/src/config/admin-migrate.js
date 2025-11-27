import pool from './database.js';

console.log('Starting admin migration...');

try {
    // Add is_admin column to users table
    await pool.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
  `);
    console.log('✅ Added is_admin column to users table');

    // Set abhijitagore2000@gmail.com as admin
    const result = await pool.query(`
    UPDATE users 
    SET is_admin = TRUE 
    WHERE email = 'abhijitagore2000@gmail.com'
    RETURNING email, is_admin;
  `);

    if (result.rows.length > 0) {
        console.log('✅ Admin user set:', result.rows[0]);
    } else {
        console.log('⚠️  Admin user email not found in database yet. Will be set on first login.');
    }

    console.log('\n✅ Admin migration completed successfully!');
    process.exit(0);
} catch (error) {
    console.error('❌ Admin migration failed:', error);
    process.exit(1);
}
