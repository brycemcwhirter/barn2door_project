const { pool, redisClient } = require('../db');

exports.getProducts = async (req, res) => {
  try {
    const cached = await redisClient.get('products');
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const { rows } = await pool.query('SELECT * FROM products');
    await redisClient.set('products', JSON.stringify(rows), { EX: 3600 });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
