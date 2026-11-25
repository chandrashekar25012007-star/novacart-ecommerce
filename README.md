# NovaCart — Full-Stack E-Commerce Platform

A complete full-stack e-commerce web application built for a Full-Stack Development course, featuring a **React + Vite** frontend, **Node.js + Express** REST API backend, **JWT** authentication, and a **SQLite** relational database (`node:sqlite`).

## Architecture

- **Frontend (`/client`)**: React 18, React Router, Context API, Lucide icons, Vite dev proxy (`/api` → `http://localhost:5000`).
- **Backend (`/server`)**: Express.js REST API with JWT authentication (`jsonwebtoken`), password hashing (`bcryptjs`), and role-based access control (`customer` / `admin`).
- **Database (`server/ecommerce.db`)**: Relational SQLite database with `users`, `products`, `cart_items`, `orders`, and `order_items` tables, automatically initialized and seeded on first run.

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run in Development
Start the backend API (port `5000`):
```bash
npm run dev:server
```
In a second terminal, start the frontend (port `5173`):
```bash
npm run dev:client
```

### 3. Production Build (Single Server)
```bash
npm run build
npm start
```

## Demo Credentials

- **Customer**: `customer@novacart.dev` / `password123`
- **Admin**: `admin@novacart.dev` / `admin123`

## REST API Endpoints

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Health check | Public |
| `POST` | `/api/auth/register` | Register a new customer | Public |
| `POST` | `/api/auth/login` | Sign in and receive JWT | Public |
| `GET` | `/api/auth/me` | Get current user profile | Bearer |
| `GET` | `/api/products` | List/filter/search/sort products | Public |
| `GET` | `/api/products/:id` | Get product details | Public |
| `POST` | `/api/products` | Create a product | Admin |
| `PUT` | `/api/products/:id` | Update a product | Admin |
| `DELETE` | `/api/products/:id` | Delete a product | Admin |
| `GET` | `/api/cart` | Get user's cart | Bearer |
| `POST` | `/api/cart` | Add item to cart | Bearer |
| `PUT` | `/api/cart/:productId` | Update item quantity | Bearer |
| `DELETE` | `/api/cart/:productId` | Remove item from cart | Bearer |
| `GET` | `/api/orders` | List user orders (or all for admin) | Bearer |
| `POST` | `/api/orders` | Place order (transactional) | Bearer |
| `PATCH` | `/api/orders/:id/status` | Update order status | Admin |
