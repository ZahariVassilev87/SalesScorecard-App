const { Client } = require('pg');

async function testDatabaseConnection() {
  const client = new Client({
    host: 'sales-scorecard-db.cvmwi48oaptu.eu-north-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: 'SalesScorecard2024!',
    database: 'postgres',
  });

  try {
    console.log('🔍 Testing database connection...');
    await client.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT version();');
    console.log('📊 Database version:', result.rows[0].version);
    
    await client.end();
    console.log('✅ Database connection test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testDatabaseConnection();
