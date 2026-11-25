import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [search, setSearch] = useState('');

  return (
    <BrowserRouter>
      <StoreProvider>
        <Navbar search={search} onSearchChange={setSearch} />
        <CartDrawer />
        <Routes>
          <Route path="/" element={<HomePage search={search} />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  );
}
