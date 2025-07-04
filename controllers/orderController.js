const { pool } = require('../db');

exports.getOrders = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.id, o.total_cents, c.email, o.created_at
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
