import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { useStore } from '../context/StoreContext';

export default function CheckoutPage() {
  const { cart, user, refreshCart, showToast } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shipping_name: user?.name || '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal: '',
    payment_method: 'card'
  });
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const shipping = cart.subtotal >= 100 || cart.subtotal === 0 ? 0 : 9.99;
  const tax = cart.subtotal * 0.08;
  const total = cart.subtotal + shipping + tax;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      await refreshCart();
      showToast('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container" style={{ padding: '28px 20px 60px' }}>
      <h1 style={{ marginBottom: 20 }}>Checkout</h1>

      {cart.items.length === 0 ? (
        <div className="panel">
          <p>Your cart is empty. Add items before checking out.</p>
        </div>
      ) : (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <form className="panel" onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: 16 }}>Shipping &amp; Payment</h2>

            <div className="form-group">
              <label>Full Name</label>
              <input
                required
                value={form.shipping_name}
                onChange={(e) => setForm({ ...form, shipping_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Street Address</label>
              <input
                required
                placeholder="123 Main St, Apt 4B"
                value={form.shipping_address}
                onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
              />
            </div>

            <div className="grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label>City</label>
                <input
                  required
                  value={form.shipping_city}
                  onChange={(e) => setForm({ ...form, shipping_city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  required
                  value={form.shipping_postal}
                  onChange={(e) => setForm({ ...form, shipping_postal: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              >
                <option value="card">Credit / Debit Card (Demo)</option>
                <option value="upi">UPI / Instant Pay (Demo)</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Placing Order...' : `Place Order ($${total.toFixed(2)})`}
            </button>
          </form>

          <div className="panel">
            <h2 style={{ marginBottom: 16 }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.94rem' }}
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              ))}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span>Estimated Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: 800
              }}
            >
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
