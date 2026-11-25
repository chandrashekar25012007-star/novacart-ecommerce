import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateCartQty, removeFromCart, user } = useStore();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  function goToCheckout() {
    setCartOpen(false);
    navigate(user ? '/checkout' : '/auth');
  }

  return (
    <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={20} /> Your Cart ({cart.itemCount})
          </h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setCartOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body">
          {!user ? (
            <p style={{ color: 'var(--muted)' }}>
              Sign in to save items to your cart and place orders.
            </p>
          ) : cart.items.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Your cart is empty. Start exploring products!</p>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image_url} alt={item.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 8 }}>
                    ${item.price.toFixed(2)} each
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => updateCartQty(item.product_id, item.quantity - 1)}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => updateCartQty(item.product_id, item.quantity + 1)}
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => removeFromCart(item.product_id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Subtotal</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            {cart.subtotal >= 100
              ? 'Free shipping unlocked!'
              : 'Free shipping on orders over $100.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={user && cart.items.length === 0}
            onClick={goToCheckout}
          >
            {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
          </button>
        </div>
      </aside>
    </div>
  );
}
