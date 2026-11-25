import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { useStore } from '../context/StoreContext';

export default function OrdersPage() {
  const { user, authLoading } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    apiRequest('/orders')
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  return (
    <main className="container" style={{ padding: '28px 20px 60px' }}>
      <h1 style={{ marginBottom: 20 }}>Your Orders</h1>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="panel">
          <p style={{ color: 'var(--muted)' }}>You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => (
            <div key={order.id} className="panel">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 14
                }}
              >
                <div>
                  <strong>Order #{order.id}</strong>
                  <div style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>
                    {new Date(order.created_at).toLocaleString()} · Ship to {order.shipping_name},{' '}
                    {order.shipping_city}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  <strong style={{ fontSize: '1.1rem' }}>${order.total_amount.toFixed(2)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      paddingTop: 8,
                      borderTop: '1px solid var(--border)'
                    }}
                  >
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </div>
                    </div>
                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
