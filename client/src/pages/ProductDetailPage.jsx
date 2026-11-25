import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Check } from 'lucide-react';
import { apiRequest } from '../api';
import { useStore } from '../context/StoreContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart, user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiRequest(`/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="container" style={{ padding: '40px 20px' }}>
        Loading product...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container" style={{ padding: '40px 20px' }}>
        <p>Product not found.</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: 12 }}>
          Back to Store
        </Link>
      </main>
    );
  }

  async function handleAdd() {
    if (!user) {
      navigate('/auth');
      return;
    }
    await addToCart(product.id, qty);
  }

  return (
    <main className="container" style={{ padding: '28px 20px 60px' }}>
      <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={15} /> Back to Catalog
      </Link>

      <div className="panel grid-2" style={{ alignItems: 'center' }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', background: '#e2e8f0' }}>
          <img
            src={product.image_url}
            alt={product.name}
            style={{ width: '100%', maxHeight: 440, objectFit: 'cover', display: 'block' }}
          />
        </div>

        <div>
          <span className="card-cat">{product.category}</span>
          <h1 style={{ fontSize: '1.9rem', margin: '6px 0 10px' }}>{product.name}</h1>

          <div className="card-rating" style={{ marginBottom: 16 }}>
            <Star size={16} fill="#f59e0b" color="#f59e0b" />
            <span>
              {product.rating.toFixed(1)} · {product.reviews_count} reviews
            </span>
          </div>

          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              ${product.price.toFixed(2)}
            </span>
            {product.original_price && (
              <span className="old-price" style={{ fontSize: '1.05rem' }}>
                ${product.original_price.toFixed(2)}
              </span>
            )}
          </div>

          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>{product.description}</p>

          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: product.stock > 0 ? 'var(--success)' : 'var(--danger)',
              fontWeight: 600,
              marginBottom: 20
            }}
          >
            <Check size={16} />
            {product.stock > 0 ? `${product.stock} units ready to ship` : 'Currently out of stock'}
          </p>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="number"
              min={1}
              max={Math.max(1, product.stock)}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              style={{
                width: 76,
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontSize: '1rem'
              }}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={product.stock === 0}
              onClick={handleAdd}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
