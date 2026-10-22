import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { Artwork } from './Artwork';
import styles from './ProductCard.module.css';

export const formatPrice = (value: number): string => `${value.toLocaleString('ru-RU')} ₽`;

export function ProductCard({ product }: { product: Product }) {
  return <Link className={styles.card} to={`/products/${product.id}`}>
    <div className={styles.visual}><Artwork variant={product.image} /><span className={styles.tag}>ARCHIVE / 0{product.id}</span></div>
    <div className={styles.top}><h3>{product.name}</h3><span>{formatPrice(product.price)}</span></div>
    <p>{product.category} · {product.size}</p>
  </Link>;
}
