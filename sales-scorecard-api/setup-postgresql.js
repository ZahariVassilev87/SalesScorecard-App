#!/usr/bin/env node

/**
 * PostgreSQL Database Setup Script for Sales Scorecard
 * This script helps set up the PostgreSQL database with initial data
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🐘 Setting up PostgreSQL database for Sales Scorecard...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Check if data already exists
    console.log('2. Checking existing data...');
    const existingCategories = await prisma.behaviorCategory.count();
    const existingUsers = await prisma.user.count();
    
    if (existingCategories > 0 || existingUsers > 0) {
      console.log('⚠️  Database already contains data:');
      console.log(`   - Categories: ${existingCategories}`);
      console.log(`   - Users: ${existingUsers}`);
      console.log('   Skipping data creation to avoid duplicates.\n');
      return;
    }

    // Create default behavior categories
    console.log('3. Creating behavior categories...');
    const categories = await createBehaviorCategories();
    console.log(`✅ Created ${categories.length} behavior categories\n`);

    // Create sample organization structure
    console.log('4. Creating sample organization structure...');
    const organization = await createSampleOrganization();
    console.log(`✅ Created organization: ${organization.region.name} with ${organization.team.name} team\n`);

    // Create sample users
    console.log('5. Creating sample users...');
    const users = await createSampleUsers();
    console.log(`✅ Created ${users.length} sample users\n`);

    // Create sample salespeople
    console.log('6. Creating sample salespeople...');
    const salespeople = await createSampleSalespeople(organization.team.id);
    console.log(`✅ Created ${salespeople.length} sample salespeople\n`);

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Behavior Items: ${categories.reduce((sum, cat) => sum + cat.items.length, 0)}`);
    console.log(`   - Regions: 1 (${organization.region.name})`);
    console.log(`   - Teams: 1 (${organization.team.name})`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Salespeople: ${salespeople.length}`);

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createBehaviorCategories() {
  const categories = [
    {
      name: 'Discovery',
      order: 1,
      weight: 0.25,
      items: [
        { name: 'Asks open-ended questions', order: 1 },
        { name: 'Uncovers customer pain points', order: 2 },
        { name: 'Identifies decision makers', order: 3 },
        { name: 'Understands customer needs', order: 4 },
        { name: 'Confirms success criteria', order: 5 }
      ]
    },
    {
      name: 'Solution Positioning',
      order: 2,
      weight: 0.25,
      items: [
        { name: 'Tailors solution to customer context', order: 1 },
        { name: 'Articulates clear value proposition', order: 2 },
        { name: 'Demonstrates product knowledge', order: 3 },
        { name: 'Handles objections effectively', order: 4 },
        { name: 'Shows ROI and business impact', order: 5 }
      ]
    },
    {
      name: 'Closing & Next Steps',
      order: 3,
      weight: 0.25,
      items: [
        { name: 'Makes clear asks', order: 1 },
        { name: 'Identifies next steps', order: 2 },
        { name: 'Sets mutual commitments', order: 3 },
        { name: 'Follows up appropriately', order: 4 },
        { name: 'Manages timeline expectations', order: 5 }
      ]
    },
    {
      name: 'Professionalism',
      order: 4,
      weight: 0.25,
      items: [
        { name: 'Arrives prepared', order: 1 },
        { name: 'Manages time effectively', order: 2 },
        { name: 'Maintains professional demeanor', order: 3 },
        { name: 'Listens actively', order: 4 },
        { name: 'Communicates clearly', order: 5 }
      ]
    }
  ];

  const createdCategories = [];
  
  for (const categoryData of categories) {
    const category = await prisma.behaviorCategory.create({
      data: {
        name: categoryData.name,
        order: categoryData.order,
        weight: categoryData.weight,
        items: {
          create: categoryData.items.map(item => ({
            name: item.name,
            order: item.order,
            isActive: true
          }))
        }
      },
      include: {
        items: true
      }
    });
    
    createdCategories.push(category);
  }

  return createdCategories;
}

async function createSampleOrganization() {
  // Create region
  const region = await prisma.region.create({
    data: {
      name: 'North America'
    }
  });

  // Create team
  const team = await prisma.team.create({
    data: {
      name: 'Enterprise Sales',
      regionId: region.id
    }
  });

  return { region, team };
}

async function createSampleUsers() {
  const users = [
    {
      email: 'admin@instorm.bg',
      displayName: 'System Administrator',
      role: 'ADMIN'
    },
    {
      email: 'director@instorm.bg',
      displayName: 'Sales Director',
      role: 'SALES_DIRECTOR'
    },
    {
      email: 'manager@instorm.bg',
      displayName: 'Regional Manager',
      role: 'REGIONAL_SALES_MANAGER'
    }
  ];

  const createdUsers = [];
  
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData
    });
    createdUsers.push(user);
  }

  return createdUsers;
}

async function createSampleSalespeople(teamId) {
  const salespeople = [
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@company.com',
      teamId: teamId
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      teamId: teamId
    },
    {
      firstName: 'Mike',
      lastName: 'Davis',
      email: 'mike.davis@company.com',
      teamId: teamId
    }
  ];

  const createdSalespeople = [];
  
  for (const salespersonData of salespeople) {
    const salesperson = await prisma.salesperson.create({
      data: salespersonData
    });
    createdSalespeople.push(salesperson);
  }

  return createdSalespeople;
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
