import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
});

const deleteAllData = async () => {
    try {
        console.log('🗑️ Starting to delete all data...');

        // Delete in correct order to respect foreign key constraints

        // 1. Delete all expenses
        const expensesResult = await pool.query('DELETE FROM expenses RETURNING id');
        console.log(`✅ Deleted ${expensesResult.rowCount} expenses`);

        // 2. Delete all revenue
        const revenueResult = await pool.query('DELETE FROM revenue RETURNING id');
        console.log(`✅ Deleted ${revenueResult.rowCount} revenue records`);

        // 3. Delete all crops
        const cropsResult = await pool.query('DELETE FROM crops RETURNING id');
        console.log(`✅ Deleted ${cropsResult.rowCount} crops`);

        // 4. Delete all fields
        const fieldsResult = await pool.query('DELETE FROM fields RETURNING id');
        console.log(`✅ Deleted ${fieldsResult.rowCount} fields`);

        console.log('🎉 All data deleted successfully!');
    } catch (error) {
        console.error('❌ Error deleting data:', error);
    } finally {
        console.log('🔌 Closing database connection...');
        await pool.end();
        console.log('👋 Done!');
    }
};

deleteAllData();
