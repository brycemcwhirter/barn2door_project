require('dotenv').config();
const { Pool } = require('pg');
const { createClient } = require('redis');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

module.exports = { pool, redisClient };
