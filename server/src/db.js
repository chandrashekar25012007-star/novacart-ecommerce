import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'ecommerce.db');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      original_price REAL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      rating REAL NOT NULL DEFAULT 4.5,
      reviews_count INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL CHECK (total_amount >= 0),
      status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'shipped', 'delivered', 'cancelled')),
      shipping_name TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      shipping_postal TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'card',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      product_image TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
  `);

  seedData();
}

function seedData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const insertUser = db.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    );
    insertUser.run(
      'Alex Rivera',
      'customer@novacart.dev',
      bcrypt.hashSync('password123', 10),
      'customer'
    );
    insertUser.run(
      'Admin User',
      'admin@novacart.dev',
      bcrypt.hashSync('admin123', 10),
      'admin'
    );
  }

  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (productCount === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (
        name, slug, description, price, original_price,
        category, image_url, stock, rating, reviews_count, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedProducts = [
      [
        'Studio ANC Wireless Headphones',
        'studio-anc-wireless-headphones',
        'Active noise-cancelling over-ear headphones with 40-hour battery life, spatial audio, and plush memory foam ear cushions.',
        249.99,
        299.99,
        'Electronics',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        24,
        4.8,
        142,
        1
      ],
      [
        'Minimalist Mechanical Keyboard',
        'minimalist-mechanical-keyboard',
        'Hot-swappable 75% wireless mechanical keyboard with tactile switches, aluminum frame, and customizable RGB backlight.',
        159.0,
        189.0,
        'Electronics',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        18,
        4.9,
        96,
        1
      ],
      [
        'Chronos Titanium Smartwatch',
        'chronos-titanium-smartwatch',
        'AMOLED fitness & health smartwatch with GPS tracking, heart-rate monitoring, and 7-day battery endurance.',
        329.0,
        379.0,
        'Electronics',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        15,
        4.7,
        215,
        1
      ],
      [
        '4K Ultra-Sharp Webcam Pro',
        '4k-ultra-sharp-webcam-pro',
        'Crystal-clear 4K UHD streaming camera with dual beamforming microphones and auto low-light correction.',
        129.99,
        null,
        'Electronics',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        30,
        4.6,
        64,
        0
      ],
      [
        'Nordic Wool Overshirt',
        'nordic-wool-overshirt',
        'Tailored heavyweight brushed wool blend overshirt designed for effortless layering in cool weather.',
        118.0,
        145.0,
        'Fashion',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
        22,
        4.7,
        58,
        1
      ],
      [
        'CloudStride Running Sneakers',
        'cloudstride-running-sneakers',
        'Breathable knit-mesh running shoes with responsive dual-density cushioning and high-traction rubber outsole.',
        139.5,
        165.0,
        'Fashion',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        35,
        4.8,
        310,
        1
      ],
      [
        'Essential Organic Cotton Hoodie',
        'essential-organic-cotton-hoodie',
        '420gsm French terry hoodie crafted from 100% GOTS-certified organic cotton with relaxed drop-shoulder fit.',
        84.0,
        null,
        'Fashion',
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
        40,
        4.6,
        89,
        0
      ],
      [
        'Heritage Polarized Sunglasses',
        'heritage-polarized-sunglasses',
        'Handcrafted acetate frames with UV400 polarized lenses for glare-free clarity and timeless everyday style.',
        95.0,
        120.0,
        'Accessories',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
        28,
        4.5,
        47,
        0
      ],
      [
        'Everyday Commuter Backpack',
        'everyday-commuter-backpack',
        'Water-resistant 22L tech backpack featuring a padded 16-inch laptop sleeve, hidden passport pocket, and luggage pass-through.',
        149.0,
        179.0,
        'Accessories',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        19,
        4.9,
        173,
        1
      ],
      [
        'Artisan Ceramic Pour-Over Set',
        'artisan-ceramic-pour-over-set',
        'Matte stoneware coffee dripper and matching carafe engineered for clean, balanced single-origin extraction.',
        68.0,
        82.0,
        'Home & Living',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        26,
        4.8,
        112,
        0
      ],
      [
        'Ambient Architectural Desk Lamp',
        'ambient-architectural-desk-lamp',
        'Stepless dimming LED task lamp with adjustable warm-to-cool color temperature and anodized aluminum arm.',
        112.0,
        null,
        'Home & Living',
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
        14,
        4.7,
        74,
        0
      ],
      [
        'Botanical Soy Candle Trio',
        'botanical-soy-candle-trio',
        'Hand-poured natural soy wax candles infused with cedarwood, bergamot, and eucalyptus essential oils.',
        48.0,
        60.0,
        'Home & Living',
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
        50,
        4.9,
        138,
        0
      ]
    ];

    for (const product of seedProducts) {
      insertProduct.run(...product);
    }
  }
}

export default db;
