import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../api';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 3200);
  }, []);

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem('novacart_token');
    if (!token) {
      setCart({ items: [], subtotal: 0, itemCount: 0 });
      return;
    }
    try {
      const data = await apiRequest('/cart');
      setCart(data);
    } catch {
      setCart({ items: [], subtotal: 0, itemCount: 0 });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('novacart_token');
    if (!token) {
      setAuthLoading(false);
      return;
    }
    apiRequest('/auth/me')
      .then((data) => {
        setUser(data.user);
        return refreshCart();
      })
      .catch(() => {
        localStorage.removeItem('novacart_token');
        setUser(null);
      })
      .finally(() => setAuthLoading(false));
  }, [refreshCart]);

  async function login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('novacart_token', data.token);
    setUser(data.user);
    await refreshCart();
    showToast(`Welcome back, ${data.user.name}!`);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    localStorage.setItem('novacart_token', data.token);
    setUser(data.user);
    await refreshCart();
    showToast(`Account created! Welcome, ${data.user.name}`);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('novacart_token');
    setUser(null);
    setCart({ items: [], subtotal: 0, itemCount: 0 });
    showToast('Signed out');
  }

  async function addToCart(productId, quantity = 1) {
    if (!user) {
      showToast('Please sign in to add items to your cart', 'error');
      return false;
    }
    try {
      const data = await apiRequest('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      setCart(data);
      setCartOpen(true);
      showToast('Added to cart');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  }

  async function updateCartQty(productId, quantity) {
    try {
      const data = await apiRequest(`/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });
      setCart(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function removeFromCart(productId) {
    try {
      const data = await apiRequest(`/cart/${productId}`, { method: 'DELETE' });
      setCart(data);
      showToast('Removed from cart');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <StoreContext.Provider
      value={{
        user,
        authLoading,
        cart,
        cartOpen,
        setCartOpen,
        toast,
        showToast,
        login,
        register,
        logout,
        addToCart,
        updateCartQty,
        removeFromCart,
        refreshCart
      }}
    >
      {children}
      {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.message}</div>}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
