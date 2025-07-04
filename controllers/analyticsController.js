const { pool } = require('../db');

exports.getAnalytics = async (req, res) => {
  try {
    const revenueResult = await pool.query('SELECT COALESCE(SUM(total_cents),0) AS revenue FROM orders');
    const topProductsResult = await pool.query(
      `SELECT product_name, SUM(quantity) AS total_quantity
       FROM order_items
       GROUP BY product_name
       ORDER BY total_quantity DESC
       LIMIT 5`
    );
    res.json({
      total_revenue_cents: parseInt(revenueResult.rows[0].revenue, 10),
      top_products: topProductsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
