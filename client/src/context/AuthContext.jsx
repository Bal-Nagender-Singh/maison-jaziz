import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => { api.get('/auth/me').then(({data}) => setUser(data.user)).catch(() => setUser(null)).finally(() => setInitialized(true)); }, []);
  const requestOtp = async (email, phone) => { setLoading(true); try { return (await api.post('/auth/request-otp', { email, phone })).data; } finally { setLoading(false); } };
  const verifyOtp = async (email, otp, phone) => { setLoading(true); try { const { data } = await api.post('/auth/verify-otp', { email, otp, phone }); setUser(data.user); return data.user; } finally { setLoading(false); } };
  const adminLogin = async (email, password) => { setLoading(true); try { const { data } = await api.post('/auth/admin-login', { email, password }); setUser(data.user); return data.user; } finally { setLoading(false); } };
  const logout = async () => { try { await api.post('/auth/logout'); } finally { setUser(null); } };
  const updateUser = (data) => setUser(data);
  return <AuthContext.Provider value={{ user, loading, initialized, requestOtp, verifyOtp, adminLogin, logout, updateUser }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
