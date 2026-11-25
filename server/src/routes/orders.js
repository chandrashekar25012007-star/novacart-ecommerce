import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

function attachOrderItems(orders) {
  const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  return orders.map((order) => ({
    ...order,
    items: getItems.all(order.id)
  }));
}

router.get('/', (req, res) => {
  const orders =
    req.user.role === 'admin'
      ? db
          .prepare(
            `SELECT o.*, u.name as customer_name, u.email as customer_email
             FROM orders o
             JOIN users u ON u.id = o.user_id
             ORDER BY o.created_at DESC`
          )
          .all()
      : db
          .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
          .all(req.user.id);

  res.json({ orders: attachOrderItems(orders) });
});

router.post('/', (req, res) => {
  const { shipping_name, shipping_address, shipping_city, shipping_postal, payment_method = 'card' } =
    req.body;

  if (
    !shipping_name?.trim() ||
    !shipping_address?.trim() ||
    !shipping_city?.trim() ||
    !shipping_postal?.trim()
  ) {
    return res.status(400).json({ error: 'All shipping fields are required' });
  }

  const cartItems = db
    .prepare(
      `SELECT c.product_id, c.quantity, p.name, p.price, p.image_url, p.stock
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?`
    )
    .all(req.user.id);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty' });
  }

  for (const item of cartItems) {
    if (item.quantity > item.stock) {
      return res.status(400).json({
        error: `Insufficient stock for ${item.name} (${item.stock} available)`
      });
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const totalAmount = Number((subtotal + shipping + tax).toFixed(2));

  let orderId;
  db.exec('BEGIN');
  try {
    const orderResult = db
      .prepare(
        `INSERT INTO orders (user_id, total_amount, status, shipping_name, shipping_address, shipping_city, shipping_postal, payment_method)
         VALUES (?, ?, 'processing', ?, ?, ?, ?, ?)`
      )
      .run(
        req.user.id,
        totalAmount,
        shipping_name.trim(),
        shipping_address.trim(),
        shipping_city.trim(),
        shipping_postal.trim(),
        payment_method
      );

    orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const deductStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.name, item.image_url, item.price, item.quantity);
      deductStock.run(item.quantity, item.product_id);
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    return res.status(500).json({ error: 'Failed to place order', details: err.message });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const [hydrated] = attachOrderItems([order]);
  res.status(201).json({ order: hydrated });
});

router.patch('/:id/status', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const allowed = ['processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  }

  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  const [hydrated] = attachOrderItems([order]);
  res.json({ order: hydrated });
});

export default router;
