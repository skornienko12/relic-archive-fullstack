import { useState } from 'react';
import { catalogApi } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { RequestView } from '../components/RequestView';
import { useRequest } from '../hooks';
import styles from './Pages.module.css';

export function Products() {
  const [category, setCategory] = useState('All');
  const products = useRequest(catalogApi.list, []);
  const categories = ['All', 'Outerwear', 'Denim', 'Tops', 'Bottoms'];
  return <section className={styles.section}>
    <div className={styles.pageHeading}><p className={styles.eyebrow}>RELIC ARCHIVE / COLLECTION 001</p><h1>THE SHOP<span className={styles.muted}>.</span></h1><p>Pieces with past lives. Built for yours.</p></div>
    <div className={styles.filters} role="group" aria-label="Категории товаров">{categories.map((name) => <button key={name} className={category === name ? styles.activeFilter : ''} onClick={() => setCategory(name)}>{name.toUpperCase()}</button>)}</div>
    <RequestView status={products.status} message={products.status === 'error' ? products.message : undefined}>
      {products.status === 'data' && <><p className={styles.count}>{products.data.filter((p) => category === 'All' || p.category === category).length} OBJECTS FOUND</p><div className={styles.grid}>{products.data.filter((p) => category === 'All' || p.category === category).map((p) => <ProductCard key={p.id} product={p} />)}</div></>}
    </RequestView>
  </section>;
}
