const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Determine Railway DB vars or fallbacks
const dbHost = process.env['MySQL.MYSQLHOST'] || process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
const dbUser = process.env['MySQL.MYSQLUSER'] || process.env.MYSQLUSER || process.env.DB_USER || 'root';
const dbPassword = process.env['MySQL.MYSQLPASSWORD'] || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '';
const dbName = process.env['MySQL.MYSQLDATABASE'] || process.env.MYSQLDATABASE || process.env.DB_NAME || 'kashtec_db';
const dbPort = process.env['MySQL.MYSQLPORT'] || process.env.MYSQLPORT || process.env.DB_PORT || 3306;

const db = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  ssl: {
      rejectUnauthorized: false
  }
});

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('✅ Src Database connected successfully to', dbName);
    connection.release();
  })
  .catch(error => {
    console.error('❌ Src Database connection failed:', error.message);
  });

module.exports = db;
