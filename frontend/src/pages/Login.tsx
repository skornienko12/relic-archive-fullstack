import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi, errorMessage } from '../api/client';
import { useAuth } from '../auth';
import type { RequestState, TokenResponse } from '../types';
import styles from './Pages.module.css';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<RequestState<TokenResponse>>({ status: 'idle' });
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/orders';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (username.trim().length < 3 || password.length < 6) {
      setResult({ status: 'error', message: 'Логин от 3 символов, пароль от 6 символов.' }); return;
    }
    setResult({ status: 'loading' });
    try {
      const data = await authApi.login({ username: username.trim(), password });
      setResult({ status: 'data', data }); setToken(data.access_token); navigate(from, { replace: true });
    } catch (error: unknown) { setResult({ status: 'error', message: errorMessage(error) }); }
  }

  return <section className={styles.formSection}><div className={styles.formFrame}>
    <p className={styles.eyebrow}>RELIC MEMBERS / PRIVATE ACCESS</p><h1>WELCOME<br />BACK<span className={styles.muted}>.</span></h1>
    <p className={styles.description}>Войди, чтобы оформить заказ и посмотреть историю покупок.</p>
    <form onSubmit={(event) => { void submit(event); }} noValidate>
      <label>USERNAME<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder="your username" minLength={3} required /></label>
      <label>PASSWORD<input value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" type="password" placeholder="••••••••" minLength={6} required /></label>
      <button className={styles.greenButton} disabled={result.status === 'loading'} type="submit">{result.status === 'loading' ? 'CONNECTING…' : 'SIGN IN ↗'}</button>
      {result.status === 'error' && <p className={styles.error} role="alert">{result.message}</p>}
      {result.status === 'data' && <p className={styles.success} role="status">Вход выполнен</p>}
    </form>
    <p className={styles.demo}>DEMO ACCESS: <strong>demo</strong> / <strong>archive123</strong></p>
    <Link className={styles.back} to="/">← RETURN HOME</Link>
  </div></section>;
}
