import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, ShoppingCart, Package, Shield, LogOut, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Navbar({ search, onSearchChange }) {
  const { user, cart, setCartOpen, logout } = useStore();
  const navigate = useNavigate();

  function handleSearchSubmit(e) {
    e.preventDefault();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <ShoppingBag size={24} />
          <span>NovaCart</span>
        </Link>

        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <Search size={17} className="search-icon" />
          <input
            type="search"
            placeholder="Search products, categories..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </form>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/orders" className="btn btn-secondary btn-sm">
                <Package size={16} />
                <span>Orders</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-secondary btn-sm">
                  <Shield size={16} />
                  <span>Admin</span>
                </Link>
              )}
              <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-secondary btn-sm">
              <User size={16} />
              <span>Sign In</span>
            </Link>
          )}

          <button
            type="button"
            className="btn btn-primary btn-sm cart-btn"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingCart size={17} />
            <span>Cart</span>
            {cart.itemCount > 0 && <span className="badge">{cart.itemCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
