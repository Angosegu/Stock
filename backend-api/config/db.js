const dotenv = require('dotenv');
dotenv.config();

const dbType = (process.env.DB_TYPE || 'mysql').toLowerCase();

let pool;

if (dbType === 'postgresql') {
  const { Pool } = require('pg');
  pool = new Pool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'sistema_db',
    max: 10, // maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Test PostgreSQL connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Erro de ligação ao PostgreSQL:', err.message);
    } else {
      console.log('✅ Ligação estabelecida com sucesso ao PostgreSQL!');
    }
  });

} else {
  // Default to MySQL
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'sistema_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

  // Test MySQL connection
  pool.query('SELECT 1')
    .then(() => {
      console.log('✅ Ligação estabelecida com sucesso ao MySQL!');
    })
    .catch(err => {
      console.error('❌ Erro de ligação ao MySQL:', err.message);
    });
}

/**
 * Execute a query safely across both database adapters.
 * @param {string} sql - The query string (use ? for mysql, and $1, $2 for postgresql)
 * @param {Array} params - Array of parameters
 */
async function query(sql, params = []) {
  if (dbType === 'postgresql') {
    // Convert MySQL style "?" placeholders to PostgreSQL "$1", "$2" placeholders
    let pgSql = sql;
    let index = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${index}`);
      index++;
    }
    const res = await pool.query(pgSql, params);
    return res.rows;
  } else {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
}

module.exports = {
  query,
  dbType
};
