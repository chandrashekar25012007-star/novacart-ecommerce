import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product }) {
  const { addToCart, user } = useStore();
  const navigate = useNavigate();

  async function handleAdd() {
    if (!user) {
      navigate('/auth');
      return;
    }
    await addToCart(product.id, 1);
  }

  return (
    <article className="card">
      <Link to={`/products/${product.id}`} className="card-img-wrap">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {product.featured === 1 && <span className="card-badge">Featured</span>}
      </Link>

      <div className="card-body">
        <span className="card-cat">{product.category}</span>
        <Link to={`/products/${product.id}`} className="card-title">
          {product.name}
        </Link>
        <div className="card-rating">
          <Star size={15} fill="#f59e0b" color="#f59e0b" />
          <span>
            {product.rating.toFixed(1)} ({product.reviews_count})
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem' }}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <div className="card-footer">
          <div>
            <span className="price">${product.price.toFixed(2)}</span>
            {product.original_price && (
              <span className="old-price">${product.original_price.toFixed(2)}</span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={product.stock === 0}
            onClick={handleAdd}
          >
            <ShoppingCart size={15} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
