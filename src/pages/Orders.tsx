import { useState } from 'react';
import { authApi, errorMessage, ordersApi } from '../api/client';
import { useAuth } from '../auth';
import { formatPrice } from '../components/ProductCard';
import { RequestView } from '../components/RequestView';
import { useRequest } from '../hooks';
import { useCart } from '../store/cart';
import type { Order, RequestState } from '../types';
import styles from './Pages.module.css';

export function Orders() {
  const { token, logout } = useAuth();
  const user = useRequest(authApi.me, [token]);
  const initialOrders = useRequest(ordersApi.list, [token]);
  const [created, setCreated] = useState<Order[]>([]);
  const [submit, setSubmit] = useState<RequestState<Order>>({ status: 'idle' });
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  async function placeOrder() {
    if (!items.length) return;
    setSubmit({ status: 'loading' });
    try {
      const order = await ordersApi.create({ items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })) });
      setSubmit({ status: 'data', data: order }); setCreated((prev) => [order, ...prev]); clear();
    } catch (error: unknown) { setSubmit({ status: 'error', message: errorMessage(error) }); }
  }
  return <section className={styles.section}>
    <div className={styles.pageHeading}><p className={styles.eyebrow}>MEMBERS ONLY / ACCOUNT</p><h1>MY ORDERS<span className={styles.muted}>.</span></h1></div>
    <RequestView status={user.status} message={user.status === 'error' ? user.message : undefined}>
      {user.status === 'data' && <div className={styles.account}><span>AUTHENTICATED AS / <strong>{user.data.username}</strong></span><button onClick={logout} className={styles.textButton}>LOG OUT ↗</button></div>}
    </RequestView>
    {items.length > 0 && <div className={styles.checkout}><div><p className={styles.eyebrow}>READY TO CHECK OUT?</p><h2>{items.length} SELECTED OBJECTS</h2><p>Сумма: {formatPrice(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0))}</p></div><button className={styles.greenButton} disabled={submit.status === 'loading'} onClick={() => { void placeOrder(); }}>{submit.status === 'loading' ? 'PROCESSING…' : 'PLACE DEMO ORDER ↗'}</button></div>}
    {submit.status === 'error' && <p className={styles.error} role="alert">{submit.message}</p>}
    {submit.status === 'data' && <p className={styles.success} role="status">Заказ #{submit.data.id} создан!</p>}
    <h2 className={styles.subheading}>ORDER HISTORY /</h2>
    <RequestView status={initialOrders.status} message={initialOrders.status === 'error' ? initialOrders.message : undefined}>
      {initialOrders.status === 'data' && (created.length + initialOrders.data.length === 0 ? <p className={styles.description}>Заказов пока нет. Выбери вещи в каталоге.</p> :
        <div>{[...created, ...initialOrders.data].map((order) => <div className={styles.orderRow} key={order.id}><span>ORDER #{String(order.id).padStart(4, '0')}</span><span>{new Date(order.created_at).toLocaleDateString('ru-RU')}</span><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} PCS</span><strong>{formatPrice(order.total)}</strong></div>)}</div>)}
    </RequestView>
  </section>;
}
