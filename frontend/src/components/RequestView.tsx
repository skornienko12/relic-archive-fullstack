import type { PropsWithChildren } from 'react';
import styles from './RequestView.module.css';

type RequestViewProps = PropsWithChildren<{ status: 'loading' | 'error' | 'data' | 'idle'; message?: string }>;
export function RequestView({ status, message, children }: RequestViewProps) {
  if (status === 'loading' || status === 'idle') return <div className={styles.box} role="status">ЗАГРУЗКА ДАННЫХ<span className={styles.dots}>...</span></div>;
  if (status === 'error') return <div className={styles.box} role="alert">⚠ {message ?? 'Ошибка загрузки'}</div>;
  return <>{children}</>;
}
