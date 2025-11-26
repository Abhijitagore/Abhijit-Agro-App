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

const seedData = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // 1. Get ALL users
        console.log('...Fetching all users to seed data for');
        const usersRes = await pool.query('SELECT id, email FROM users');
        const users = usersRes.rows;

        if (users.length === 0) {
            console.log('⚠️ No users found. Creating a default seed user.');
            const userRes = await pool.query(`
                INSERT INTO users (google_id, email, name, picture)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (google_id) DO UPDATE SET name = EXCLUDED.name
                RETURNING id, email
            `, ['seed_user_999', 'demo999@example.com', 'Demo User 999', 'https://via.placeholder.com/150']);
            users.push(userRes.rows[0]);
        }

        console.log(`✅ Found ${users.length} users to seed data for.`);

        for (const user of users) {
            const userId = user.id;
            console.log(`🌱 Seeding data for user: ${user.email} (ID: ${userId})`);

            // 2. Create Fields
            const fieldsData = [
                { name: 'North Field', location: 'North Side', area: 5.5, area_unit: 'acres', soil_type: 'Loamy' },
                { name: 'South Field', location: 'South Side', area: 3.2, area_unit: 'acres', soil_type: 'Clay' },
                { name: 'East Field', location: 'East Side', area: 4.0, area_unit: 'hectares', soil_type: 'Sandy' },
                { name: 'West Field', location: 'West Side', area: 6.1, area_unit: 'acres', soil_type: 'Silt' }
            ];

            const fieldIds = [];
            for (const field of fieldsData) {
                // Check if field already exists to avoid duplicates
                const existingField = await pool.query(
                    'SELECT id FROM fields WHERE user_id = $1 AND name = $2',
                    [userId, field.name]
                );

                if (existingField.rows.length > 0) {
                    fieldIds.push(existingField.rows[0].id);
                } else {
                    const res = await pool.query(`
                        INSERT INTO fields (user_id, name, location, area, area_unit, soil_type)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING id
                    `, [userId, field.name, field.location, field.area, field.area_unit, field.soil_type]);
                    fieldIds.push(res.rows[0].id);
                }
            }
            console.log(`   ✅ Ensured ${fieldIds.length} fields`);

            // 3. Create Crops
            const cropsData = [
                { name: 'Wheat', status: 'Growing', field_idx: 0, planted: '2024-11-01', harvest: '2025-04-15' },
                { name: 'Rice', status: 'Harvest Ready', field_idx: 2, planted: '2024-06-15', harvest: '2024-11-30' },
                { name: 'Corn', status: 'Planted', field_idx: 3, planted: '2024-11-20', harvest: '2025-03-10' },
                { name: 'Soybeans', status: 'Growing', field_idx: 1, planted: '2024-10-10', harvest: '2025-02-20' },
                { name: 'Cotton', status: 'Growing', field_idx: 0, planted: '2024-10-01', harvest: '2025-03-01' },
                { name: 'Sugarcane', status: 'Growing', field_idx: 1, planted: '2024-09-01', harvest: '2025-08-01' },
                { name: 'Barley', status: 'Planted', field_idx: 2, planted: '2024-11-25', harvest: '2025-04-20' },
                { name: 'Potatoes', status: 'Harvested', field_idx: 3, planted: '2024-08-01', harvest: '2024-11-15' },
                { name: 'Tomatoes', status: 'Growing', field_idx: 0, planted: '2024-10-15', harvest: '2025-01-15' },
                { name: 'Onions', status: 'Planted', field_idx: 1, planted: '2024-11-10', harvest: '2025-03-15' }
            ];

            const cropIds = [];
            for (const crop of cropsData) {
                const res = await pool.query(`
                INSERT INTO crops (user_id, field_id, name, status, planted_date, expected_harvest_date)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `, [userId, fieldIds[crop.field_idx], crop.name, crop.status, crop.planted, crop.harvest]);
                cropIds.push(res.rows[0].id);
            }
            console.log(`   ✅ Created ${cropIds.length} crops`);

            // 4. Create Expenses (10 records)
            const expensesData = [
                { category: 'Seeds', amount: 12000, date: '2024-11-01', desc: 'Wheat Seeds' },
                { category: 'Fertilizer', amount: 8500, date: '2024-11-05', desc: 'DAP for Wheat' },
                { category: 'Labor', amount: 5000, date: '2024-11-10', desc: 'Weeding labor' },
                { category: 'Water', amount: 3000, date: '2024-11-12', desc: 'Irrigation pump fuel' },
                { category: 'Pesticides', amount: 4500, date: '2024-11-15', desc: 'Pest control spray' },
                { category: 'Equipment', amount: 15000, date: '2024-10-25', desc: 'Tractor rental' },
                { category: 'Seeds', amount: 9000, date: '2024-11-20', desc: 'Corn Seeds' },
                { category: 'Labor', amount: 6000, date: '2024-11-22', desc: 'Sowing labor' },
                { category: 'Transport', amount: 2500, date: '2024-11-18', desc: 'Transporting harvest' },
                { category: 'Other', amount: 1000, date: '2024-11-25', desc: 'Miscellaneous tools' }
            ];

            for (let i = 0; i < expensesData.length; i++) {
                const exp = expensesData[i];
                // Assign to crops in round-robin fashion
                const cropId = cropIds[i % cropIds.length];

                await pool.query(`
                INSERT INTO expenses (user_id, category, amount, date, crop_id, description, payment_method)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [userId, exp.category, exp.amount, exp.date, cropId, exp.desc, 'Cash']);
            }
            console.log(`   ✅ Created ${expensesData.length} expenses`);

            // 5. Create Revenue (10 records)
            const revenueData = [
                { source: 'Crop Sale', amount: 45000, date: '2024-11-20', product: 'Rice', quantity: '2000 kg' },
                { source: 'Crop Sale', amount: 32000, date: '2024-11-15', product: 'Potatoes', quantity: '1500 kg' },
                { source: 'Government Subsidy', amount: 10000, date: '2024-10-01', product: 'Fertilizer Subsidy', quantity: null },
                { source: 'Crop Sale', amount: 28000, date: '2024-09-15', product: 'Soybeans', quantity: '800 kg' },
                { source: 'Insurance Claim', amount: 15000, date: '2024-08-20', product: 'Crop Damage', quantity: null },
                { source: 'Crop Sale', amount: 55000, date: '2024-06-30', product: 'Wheat', quantity: '2500 kg' },
                { source: 'Contract Farming', amount: 20000, date: '2024-11-01', product: 'Corn Advance', quantity: null },
                { source: 'Crop Sale', amount: 18000, date: '2024-07-15', product: 'Vegetables', quantity: '500 kg' },
                { source: 'Other', amount: 5000, date: '2024-11-10', product: 'Scrap Sale', quantity: null },
                { source: 'Crop Sale', amount: 42000, date: '2024-05-20', product: 'Sugarcane', quantity: '10 tons' }
            ];

            for (let i = 0; i < revenueData.length; i++) {
                const rev = revenueData[i];
                // Assign to crops in round-robin fashion if it's a crop sale
                let cropId = null;
                if (rev.source === 'Crop Sale' || rev.source === 'Contract Farming') {
                    cropId = cropIds[i % cropIds.length];
                }

                await pool.query(`
                INSERT INTO revenue (user_id, source, amount, date, product, quantity, crop_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [userId, rev.source, rev.amount, rev.date, rev.product, rev.quantity, cropId]);
            }
            console.log(`   ✅ Created ${revenueData.length} revenue records`);
        }

        console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        console.log('🔌 Closing database connection...');
        await pool.end();
        console.log('👋 Bye!');
    }
};

seedData();
