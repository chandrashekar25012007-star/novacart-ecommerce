import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

function getUserCart(userId) {
  const items = db
    .prepare(
      `SELECT c.id, c.product_id, c.quantity,
              p.name, p.slug, p.price, p.image_url, p.stock, p.category
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`
    )
    .all(userId);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { items, subtotal: Number(subtotal.toFixed(2)), itemCount };
}

router.get('/', (req, res) => {
  res.json(getUserCart(req.user.id));
});

router.post('/', (req, res) => {
  const productId = Number(req.body.productId);
  const quantity = Number(req.body.quantity ?? 1);

  if (!productId || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'Valid productId and quantity >= 1 are required' });
  }

  const product = db.prepare('SELECT id, stock FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = db
    .prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, productId);

  const nextQty = (existing?.quantity || 0) + quantity;
  if (nextQty > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} unit(s) available in stock` });
  }

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(nextQty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(
      req.user.id,
      productId,
      quantity
    );
  }

  res.status(201).json(getUserCart(req.user.id));
});

router.put('/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  const quantity = Number(req.body.quantity);

  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
  }

  if (quantity === 0) {
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(
      req.user.id,
      productId
    );
    return res.json(getUserCart(req.user.id));
  }

  const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  if (quantity > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} unit(s) available in stock` });
  }

  const result = db
    .prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?')
    .run(quantity, req.user.id, productId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Item not in cart' });
  }

  res.json(getUserCart(req.user.id));
});

router.delete('/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(
    req.user.id,
    productId
  );
  res.json(getUserCart(req.user.id));
});

router.delete('/', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json(getUserCart(req.user.id));
});

export default router;
