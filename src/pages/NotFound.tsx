import { Link } from 'react-router-dom';
import styles from './Pages.module.css';
export function NotFound() {
  return <div className={styles.notFound}><p>ERROR / PAGE NOT FOUND</p><h1>404<span>✳</span></h1><p>Looks like this piece is missing from the archive.</p><Link className={styles.greenButton} to="/">BACK HOME ↗</Link></div>;
}
