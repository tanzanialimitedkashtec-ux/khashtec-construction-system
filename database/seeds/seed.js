const db = require('../config/database');

// Seed data for KASHTEC system - Department-specific credentials
const seedData = {
  users: [
    {
      id: 1,
      email: 'admin@kashtec.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: admin
      role: 'admin',
      name: 'System Administrator',
      department: 'Administration',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      email: 'hr@manager0501',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: hr0501
      role: 'hr',
      name: 'HR Manager 0501',
      department: 'Human Resources',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      email: 'hr@manager0502',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: hr0502
      role: 'hr',
      name: 'HR Manager 0502',
      department: 'Human Resources',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      email: 'hr@manager0503',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: hr0503
      role: 'hr',
      name: 'HR Manager 0503',
      department: 'Human Resources',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      email: 'pm@manager0501',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: pm0501
      role: 'project_manager',
      name: 'Project Manager 0501',
      department: 'Project Management',
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      email: 'pm@manager0502',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: pm0502
      role: 'project_manager',
      name: 'Project Manager 0502',
      department: 'Project Management',
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      email: 'pm@manager0503',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: pm0503
      role: 'project_manager',
      name: 'Project Manager 0503',
      department: 'Project Management',
      created_at: new Date().toISOString()
    },
    {
      id: 8,
      email: 'finance@manager0501',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: finance0501
      role: 'finance',
      name: 'Finance Manager 0501',
      department: 'Finance',
      created_at: new Date().toISOString()
    },
    {
      id: 9,
      email: 'finance@manager0502',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: finance0502
      role: 'finance',
      name: 'Finance Manager 0502',
      department: 'Finance',
      created_at: new Date().toISOString()
    },
    {
      id: 10,
      email: 'finance@manager0503',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: finance0503
      role: 'finance',
      name: 'Finance Manager 0503',
      department: 'Finance',
      created_at: new Date().toISOString()
    },
    {
      id: 11,
      email: 'operations@manager0501',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: operations0501
      role: 'operations',
      name: 'Operations Manager 0501',
      department: 'Operations',
      created_at: new Date().toISOString()
    },
    {
      id: 12,
      email: 'operations@manager0502',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: operations0502
      role: 'operations',
      name: 'Operations Manager 0502',
      department: 'Operations',
      created_at: new Date().toISOString()
    },
    {
      id: 13,
      email: 'operations@manager0503',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: operations0503
      role: 'operations',
      name: 'Operations Manager 0503',
      department: 'Operations',
      created_at: new Date().toISOString()
    }
  ]
};

async function runSeeds() {
  try {
    console.log('🌱 Running database seeds...');

    // Seed users
    for (const user of seedData.users) {
      try {
        await db.execute(
          `INSERT IGNORE INTO users (id, email, password, role, name, department, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [user.id, user.email, user.password, user.role, user.name, user.department, user.created_at]
        );
        console.log(`✅ Seeded user: ${user.name}`);
      } catch (error) {
        console.error(`❌ Failed to seed user ${user.name}:`, error.message);
      }
    }

    // Seed sample properties
    const properties = [
      {
        title: 'Modern Apartment - Masaki',
        description: '3-bedroom luxury apartment with sea view',
        location: 'Masaki, Dar es Salaam',
        type: 'Residential',
        price: 85000000,
        size_sqm: 120,
        bedrooms: 3,
        bathrooms: 2,
        parking_spaces: 1,
        status: 'Available'
      },
      {
        title: 'Commercial Space - City Center',
        description: 'Prime commercial space in business district',
        location: 'City Center, Dar es Salaam',
        type: 'Commercial',
        price: 150000000,
        size_sqm: 250,
        bedrooms: 0,
        bathrooms: 2,
        parking_spaces: 5,
        status: 'Available'
      }
    ];

    for (const property of properties) {
      try {
        await db.execute(
          `INSERT IGNORE INTO properties (title, description, location, type, price, size_sqm, bedrooms, bathrooms, parking_spaces, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [property.title, property.description, property.location, property.type, property.price, property.size_sqm, property.bedrooms, property.bathrooms, property.parking_spaces, property.status]
        );
        console.log(`✅ Seeded property: ${property.title}`);
      } catch (error) {
        console.error(`❌ Failed to seed property ${property.title}:`, error.message);
      }
    }

    console.log('✅ All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}

module.exports = { runSeeds };
