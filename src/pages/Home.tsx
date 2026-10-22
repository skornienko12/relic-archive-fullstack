import { Link } from 'react-router-dom';
import { catalogApi } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { RequestView } from '../components/RequestView';
import { useRequest } from '../hooks';
import styles from './Pages.module.css';

export function Home() {
  const products = useRequest(catalogApi.list, []);
  return <>
    <section className={styles.hero}>
      <div className={styles.heroTop}><span>[ INDEPENDENT ARCHIVE STORE ]</span><span>DROP 001 — 2026</span></div>
      <p className={styles.eyebrow}>NOT MADE TO FIT IN.</p>
      <h1>WEAR YOUR<br /><em>OWN</em> HISTORY<span className={styles.star}>✳</span></h1>
      <div className={styles.heroBottom}><p>Selected archive pieces.<br />Distressed. Oversized. Unapologetic.</p><Link className={styles.greenButton} to="/products">EXPLORE THE DROP ↗</Link></div>
      <span className={styles.heroIndex}>RA—001 / ORIGINALS ONLY</span>
    </section>
    <section className={styles.section}>
      <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>01 / CURATED</p><h2>FEATURED OBJECTS<span className={styles.muted}>™</span></h2></div><Link to="/products">VIEW ALL ↗</Link></div>
      <RequestView status={products.status} message={products.status === 'error' ? products.message : undefined}>
        {products.status === 'data' && <div className={styles.grid}>{products.data.filter((p) => p.featured).map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </RequestView>
    </section>
    <section className={styles.manifesto}><span>THE MANIFESTO / 001</span><p>Clothes are memories<br />you can <em>wear.</em></p><Link to="/products">FIND YOUR PIECE ↗</Link></section>
  </>;
}
