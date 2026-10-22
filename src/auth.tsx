import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { TOKEN_KEY } from './api/client';

interface AuthContextValue { token: string | null; setToken: (value: string) => void; logout: () => void }
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, updateToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); updateToken(null); }, []);
  const setToken = useCallback((value: string) => { localStorage.setItem(TOKEN_KEY, value); updateToken(value); }, []);
  useEffect(() => { window.addEventListener('relic:unauthorized', logout); return () => window.removeEventListener('relic:unauthorized', logout); }, [logout]);
  return <AuthContext.Provider value={{ token, setToken, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider is missing');
  return ctx;
}

export function PrivateRoute() {
  const { token } = useAuth();
  const location = useLocation();
  return token ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
