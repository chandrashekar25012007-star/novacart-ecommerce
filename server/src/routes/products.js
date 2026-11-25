import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

router.get('/', (req, res) => {
  const { category, search, sort, featured } = req.query;
  const conditions = [];
  const params = [];

  if (category && category !== 'All') {
    conditions.push('category = ?');
    params.push(category);
  }

  if (featured === 'true' || featured === '1') {
    conditions.push('featured = 1');
  }

  if (search && search.trim()) {
    conditions.push('(name LIKE ? OR description LIKE ? OR category LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  let orderBy = 'id DESC';
  switch (sort) {
    case 'price_asc':
      orderBy = 'price ASC';
      break;
    case 'price_desc':
      orderBy = 'price DESC';
      break;
    case 'rating':
      orderBy = 'rating DESC, reviews_count DESC';
      break;
    default:
      orderBy = 'featured DESC, id ASC';
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const products = db
    .prepare(`SELECT * FROM products ${whereClause} ORDER BY ${orderBy}`)
    .all(...params);

  const categories = db
    .prepare('SELECT DISTINCT category FROM products ORDER BY category ASC')
    .all()
    .map((row) => row.category);

  res.json({ products, categories });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const product = Number.isInteger(Number(id))
    ? db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id))
    : db.prepare('SELECT * FROM products WHERE slug = ?').get(id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

router.post('/', authenticate, requireAdmin, (req, res) => {
  const { name, description, price, original_price, category, image_url, stock, featured } =
    req.body;

  if (!name?.trim() || !description?.trim() || price == null || !category?.trim()) {
    return res.status(400).json({ error: 'Name, description, price, and category are required' });
  }

  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const fallbackImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const result = db
    .prepare(
      `INSERT INTO products (name, slug, description, price, original_price, category, image_url, stock, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      name.trim(),
      slug,
      description.trim(),
      Number(price),
      original_price ? Number(original_price) : null,
      category.trim(),
      image_url?.trim() || fallbackImage,
      Number(stock ?? 10),
      featured ? 1 : 0
    );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ product });
});

router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const {
    name = existing.name,
    description = existing.description,
    price = existing.price,
    original_price = existing.original_price,
    category = existing.category,
    image_url = existing.image_url,
    stock = existing.stock,
    featured = existing.featured
  } = req.body;

  db.prepare(
    `UPDATE products
     SET name = ?, description = ?, price = ?, original_price = ?, category = ?, image_url = ?, stock = ?, featured = ?
     WHERE id = ?`
  ).run(
    String(name).trim(),
    String(description).trim(),
    Number(price),
    original_price != null && original_price !== '' ? Number(original_price) : null,
    String(category).trim(),
    String(image_url).trim(),
    Number(stock),
    featured ? 1 : 0,
    id
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json({ product });
});

router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ message: 'Product deleted' });
});

export default router;
