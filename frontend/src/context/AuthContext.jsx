import { createContext, useContext, useState } from 'react';
import { me } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user] = useState(() => ({ id: 'offline', username: 'Lokaler Operator', role: 'offline', xp: 0, rank: 'Script-Kiddie' }));
  async function refresh() { return me(); }
  return <AuthContext.Provider value={{ user, loading: false, login: refresh, register: refresh, logout: () => {} }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
