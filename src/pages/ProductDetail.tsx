import { Link, useParams } from 'react-router-dom';
import { catalogApi } from '../api/client';
import { Artwork } from '../components/Artwork';
import { formatPrice } from '../components/ProductCard';
import { RequestView } from '../components/RequestView';
import { useRequest } from '../hooks';
import { useCart } from '../store/cart';
import styles from './Pages.module.css';

interface ProductParams { id: string }
export function ProductDetail() {
  const { id } = useParams<keyof ProductParams>();
  const numericId = Number(id);
  const validId = !!id && Number.isSafeInteger(numericId) && numericId > 0;
  const product = useRequest(() => validId ? catalogApi.detail(numericId) : Promise.reject(new Error('Некорректный ID товара')), [id]);
  const add = useCart((state) => state.add);
  return <section className={styles.section}>
    <Link to="/products" className={styles.back}>← BACK TO SHOP</Link>
    <RequestView status={product.status} message={product.status === 'error' ? product.message : undefined}>
      {product.status === 'data' && <div className={styles.detail}>
        <Artwork variant={product.data.image} large />
        <div className={styles.detailInfo}><p className={styles.eyebrow}>RELIC ARCHIVE / OBJECT NO. {String(product.data.id).padStart(3, '0')}</p><h1>{product.data.name}</h1>
          <p className={styles.price}>{formatPrice(product.data.price)}</p><p className={styles.description}>{product.data.description}</p>
          <div className={styles.spec}><span>CATEGORY</span><strong>{product.data.category}</strong></div><div className={styles.spec}><span>AVAILABLE SIZES</span><strong>{product.data.size}</strong></div>
          <button className={styles.greenButton} onClick={() => add(product.data)}>ADD TO BAG ↗</button>
          <p className={styles.hint}>Нажми, чтобы добавить товар в корзину. Можно добавить несколько единиц.</p>
        </div>
      </div>}
    </RequestView>
  </section>;
}
