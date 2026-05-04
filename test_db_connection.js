const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const connection = await mysql.createConnection({
      host: 'centerbeam.proxy.rlwy.net',
      port: 11044,
      user: 'root',
      password: 'LzDEYGJIiYfVRSTnBrufpsSwRIDnZRvz',
      database: 'railway'
    });
    
    console.log('✅ Database connected successfully');
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM schedule_meetings');
    console.log('Total meetings in database:', rows[0].count);
    
    // Test upcoming meetings query
    const [upcoming] = await connection.execute('SELECT id, meeting_title, meeting_date FROM schedule_meetings WHERE meeting_date >= CURDATE() ORDER BY meeting_date ASC');
    console.log('Upcoming meetings:', upcoming.length);
    upcoming.forEach(m => console.log(`- ID: ${m.id}, Title: ${m.meeting_title}, Date: ${m.meeting_date}`));
    
    await connection.end();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testConnection();
