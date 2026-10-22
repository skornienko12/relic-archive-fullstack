import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { Artwork } from '../components/Artwork';
import { formatPrice } from '../components/ProductCard';
import { useCart } from '../store/cart';
import styles from './Pages.module.css';

export function Cart() {
  const items = useCart((state) => state.items);
  const remove = useCart((state) => state.remove);
  const { token } = useAuth();
  const navigate = useNavigate();
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return <section className={styles.section}>
    <div className={styles.pageHeading}><p className={styles.eyebrow}>YOUR SELECTION / RELIC ARCHIVE</p><h1>THE BAG<span className={styles.muted}>.</span></h1></div>
    {!items.length ? <div className={styles.empty}><p>Your bag is empty.</p><Link className={styles.greenButton} to="/products">GO SHOPPING ↗</Link></div> : <div className={styles.cartLayout}>
      <div>{items.map(({ product, quantity }) => <div className={styles.cartRow} key={product.id}>
        <div className={styles.cartArt}><Artwork variant={product.image} /></div>
        <div><Link to={`/products/${product.id}`}><strong>{product.name}</strong></Link><p>QTY: {quantity} · {product.size}</p><button className={styles.textButton} onClick={() => remove(product.id)}>REMOVE ×</button></div>
        <strong>{formatPrice(product.price * quantity)}</strong>
      </div>)}</div>
      <aside className={styles.summary}><p>ORDER SUMMARY</p><div className={styles.spec}><span>SUBTOTAL</span><strong>{formatPrice(total)}</strong></div><div className={styles.spec}><span>SHIPPING</span><strong>FREE (DEMO)</strong></div><button className={styles.greenButton} onClick={() => navigate(token ? '/orders' : '/login', { state: token ? undefined : { from: '/orders' } })}>CONTINUE TO CHECKOUT ↗</button><small>Демонстрационный магазин. Реальная оплата не проводится.</small></aside>
    </div>}
  </section>;
}
