import pool from './database.js';

console.log('Starting migration: Add image to fields...');

try {
    // Check if column exists
    const checkResult = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='fields' AND column_name='image';
  `);

    if (checkResult.rows.length === 0) {
        console.log('Adding image column to fields table...');
        await pool.query(`
      ALTER TABLE fields 
      ADD COLUMN image TEXT;
    `);
        console.log('✅ Image column added successfully');
    } else {
        console.log('ℹ️ Image column already exists');
    }

    // Also check for notes column just in case
    const checkNotes = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='fields' AND column_name='notes';
  `);

    if (checkNotes.rows.length === 0) {
        console.log('Adding notes column to fields table...');
        await pool.query(`
      ALTER TABLE fields 
      ADD COLUMN notes TEXT;
    `);
        console.log('✅ Notes column added successfully');
    } else {
        console.log('ℹ️ Notes column already exists');
    }

} catch (error) {
    console.error('❌ Migration failed:', error);
} finally {
    // Don't close pool as it might be used by other processes or just let script exit
    process.exit(0);
}
