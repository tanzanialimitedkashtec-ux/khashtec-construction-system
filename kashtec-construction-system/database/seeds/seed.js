const db = require('../config/database');

async function runSeeds() {
  try {
    console.log('🌱 Running database seeds...');
    
    // Seed users
    const users = [
      {
        name: 'John Michael',
        email: 'john.michael@kashtec.co.tz',
        phone: '+255 754 123 001',
        location: 'Dar es Salaam',
        serviceType: 'Construction',
        role: 'Worker',
        department: 'Workers',
        password: 'worker123',
        status: 'Active'
      },
      {
        name: 'Mary Johnson',
        email: 'mary.johnson@kashtec.co.tz',
        phone: '+255 754 123 002',
        location: 'Dar es Salaam',
        serviceType: 'Construction',
        role: 'Worker',
        department: 'Workers',
        password: 'worker123',
        status: 'Active'
      },
      {
        name: 'Robert Kim',
        email: 'robert.kim@kashtec.co.tz',
        phone: '+255 754 123 003',
        location: 'Dar es Salaam',
        serviceType: 'Construction',
        role: 'Worker',
        department: 'Workers',
        password: 'worker123',
        status: 'Active'
      }
    ];

    for (const user of users) {
      try {
        await db.execute(
          `INSERT IGNORE INTO users (name, email, phone, location, service_type, role, department, password, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.name, user.email, user.phone, user.location, user.serviceType, user.role, user.department, user.password, user.status]
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
