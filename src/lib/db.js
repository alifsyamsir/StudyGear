import { Pool } from 'pg';

let pool;

if (!global._pgPool) {
  global._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

pool = global._pgPool;

/**
 * Execute a parameterized SQL query safely
 * @param {string} text - SQL query string with placeholders $1, $2, etc.
 * @param {Array} params - Array of parameters
 */
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', {
      text,
      params,
      error: error.message,
    });
    throw error;
  }
}

export default pool;
