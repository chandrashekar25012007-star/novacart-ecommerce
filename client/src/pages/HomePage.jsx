import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { apiRequest } from '../api';
import ProductCard from '../components/ProductCard';

export default function HomePage({ search }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (search.trim()) params.set('search', search.trim());
    if (sort) params.set('sort', sort);

    apiRequest(`/products?${params.toString()}`)
      .then((data) => {
        if (!active) return;
        setProducts(data.products);
        setCategories(['All', ...data.categories]);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, search, sort]);

  return (
    <main className="container">
      <section className="hero">
        <div>
          <span className="hero-tag">Full-Stack E-Commerce Platform</span>
          <h1>Curated Tech, Fashion &amp; Everyday Essentials</h1>
          <p>
            Powered by a live REST API, JWT authentication, persistent shopping cart, and SQLite
            database.
          </p>
          <a href="#catalog" className="btn btn-secondary">
            Explore Catalog <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section id="catalog">
        <div className="filters-bar">
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {loading ? (
          <p style={{ padding: '40px 0', color: 'var(--muted)' }}>Loading products...</p>
        ) : products.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
            <h3>No products found</h3>
            <p style={{ color: 'var(--muted)', marginTop: 6 }}>
              Try clearing your search or selecting another category.
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
