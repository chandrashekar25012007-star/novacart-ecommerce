import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, PlusCircle } from 'lucide-react';
import { apiRequest } from '../api';
import { useStore } from '../context/StoreContext';

export default function AdminPage() {
  const { user, authLoading, showToast } = useStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    image_url: '',
    stock: '15'
  });

  async function loadData() {
    const [prodData, orderData] = await Promise.all([
      apiRequest('/products'),
      apiRequest('/orders')
    ]);
    setProducts(prodData.products);
    setOrders(orderData.orders);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData().catch((err) => showToast(err.message, 'error'));
  }, [user, authLoading, navigate, showToast]);

  async function handleCreateProduct(e) {
    e.preventDefault();
    try {
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock)
        })
      });
      setForm({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        image_url: '',
        stock: '15'
      });
      showToast('Product created');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleDeleteProduct(id) {
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      showToast('Product deleted');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      showToast(`Order #${orderId} updated to ${status}`);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <main className="container" style={{ padding: '28px 20px 60px' }}>
      <h1 style={{ marginBottom: 20 }}>Admin Dashboard</h1>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: 32 }}>
        <form className="panel" onSubmit={handleCreateProduct}>
          <h2 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusCircle size={20} /> Add New Product
          </h2>
          <div className="form-group">
            <label>Product Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Accessories</option>
              <option>Home &amp; Living</option>
            </select>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Image URL (optional)</label>
            <input
              placeholder="https://..."
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Create Product
          </button>
        </form>

        <div className="panel">
          <h2 style={{ marginBottom: 16 }}>Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No orders placed yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: 12,
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10
                  }}
                >
                  <div>
                    <strong>Order #{order.id}</strong> — ${order.total_amount.toFixed(2)}
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {order.customer_name || order.shipping_name} ({order.items.length} items)
                    </div>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="sort-select"
                  >
                    <option value="processing">processing</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <h2 style={{ marginBottom: 16 }}>Catalog Inventory ({products.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div>
                <strong>{p.name}</strong>{' '}
                <span style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>
                  ({p.category}) · ${p.price.toFixed(2)} · {p.stock} in stock
                </span>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteProduct(p.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
