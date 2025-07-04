const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { pool } = require('../db');

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const customerResult = await client.query(
        'INSERT INTO customers(email) VALUES($1) ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING id',
        [session.customer_details.email]
      );
      const customerId = customerResult.rows[0].id;
      const orderResult = await client.query(
        'INSERT INTO orders(customer_id, stripe_session_id, total_cents) VALUES($1,$2,$3) RETURNING id',
        [customerId, session.id, session.amount_total]
      );
      const orderId = orderResult.rows[0].id;
      for (const item of lineItems.data) {
        await client.query(
          'INSERT INTO order_items(order_id, product_name, quantity, price_cents) VALUES($1,$2,$3,$4)',
          [orderId, item.description, item.quantity, item.amount_total / item.quantity]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
    } finally {
      client.release();
    }
  }

  res.json({ received: true });
};
