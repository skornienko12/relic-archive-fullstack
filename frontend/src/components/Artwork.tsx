import styles from './Artwork.module.css';

interface ArtworkProps { variant: string; large?: boolean }
export function Artwork({ variant, large = false }: ArtworkProps) {
  return <div className={`${styles.artwork} ${styles[variant] ?? styles.tee} ${large ? styles.large : ''}`} aria-label="Иллюстрация товара" role="img">
    <div className={styles.halo} /><div className={styles.garment} /><span className={styles.stamp}>RA / 026</span>
  </div>;
}
