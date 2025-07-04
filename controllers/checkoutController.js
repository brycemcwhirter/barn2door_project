const { pool } = require('../db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.startCheckout = async (req, res) => {
  const { items } = req.body; // [{ product_id, quantity }]
  try {
    const productIds = items.map(i => i.product_id);
    const { rows: products } = await pool.query(
      'SELECT id, name, price_cents FROM products WHERE id = ANY($1::int[])',
      [productIds]
    );
    const line_items = items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: product.name },
          unit_amount: product.price_cents
        },
        quantity: item.quantity
      };
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start checkout' });
  }
};
