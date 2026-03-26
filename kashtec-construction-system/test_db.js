const db = require('./database/config/database');

async function checkWorkTypeColumn() {
  try {
    console.log('Checking projects_work table structure...');
    
    // Get table structure
    const result = await db.execute('DESCRIBE projects_work');
    console.log('Table structure result type:', typeof result);
    console.log('Table structure result:', result);
    
    // Try different approaches to get the data
    const rows = result[0];
    console.log('Rows type:', typeof rows);
    console.log('Rows:', rows);
    
    // Also check the actual ENUM values using a simpler query
    try {
      const [enumResult] = await db.execute('SHOW COLUMNS FROM projects_work WHERE Field = "work_type"');
      console.log('ENUM column info:', enumResult);
    } catch (enumError) {
      console.error('Error getting ENUM info:', enumError);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkWorkTypeColumn();
