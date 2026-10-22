import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, PrivateRoute } from './auth';
import { Layout } from './components/Layout';
import { Cart } from './pages/Cart';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { Orders } from './pages/Orders';
import { ProductDetail } from './pages/ProductDetail';
import { Products } from './pages/Products';
import './reset.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><AuthProvider><Routes>
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="products" element={<Products />} />
      <Route path="products/:id" element={<ProductDetail />} />
      <Route path="cart" element={<Cart />} />
      <Route path="login" element={<Login />} />
      <Route element={<PrivateRoute />}><Route path="orders" element={<Orders />} /></Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes></AuthProvider></BrowserRouter></React.StrictMode>,
);
