import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';
import { useCart } from '../store/cart';
import styles from './Layout.module.css';

export function Layout() {
  const { token, logout } = useAuth();
  const itemCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  return <div className={styles.app}>
    <div className={styles.announcement}>CURATED PIECES / INDEPENDENT ARCHIVE / EST. 2026</div>
    <header className={styles.header}>
      <Link className={styles.logo} to="/">RELIC<span>®</span></Link>
      <nav aria-label="Главная навигация" className={styles.nav}>
        <NavLink to="/" end>HOME</NavLink><NavLink to="/products">SHOP</NavLink>
        <NavLink to="/cart">BAG ({itemCount})</NavLink><NavLink to="/orders">ORDERS</NavLink>
      </nav>
      {token ? <button className={styles.auth} onClick={logout}>LOG OUT ↗</button> : <Link className={styles.auth} to="/login">SIGN IN ↗</Link>}
    </header>
    <main><Outlet /></main>
    <footer className={styles.footer}><strong>RELIC ARCHIVE</strong><span>Objects of desire. Not of necessity.</span><span>© 2026 / STUDENT PROJECT</span></footer>
  </div>;
}
