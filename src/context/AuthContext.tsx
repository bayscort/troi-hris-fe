import { createContext, useContext, useState } from 'react';
import axios from 'axios';

interface Menu {
  name: string;
  permissions: string[];
}

interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null;
  menus: Menu[];
  estateId: number | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null,
    role: localStorage.getItem('role') || null,
    menus: JSON.parse(localStorage.getItem('menus') || '[]'),
    estateId: localStorage.getItem('estateId') ? Number(localStorage.getItem('estateId')) : null,
  });

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        // const response = await axios.post('https://bba-palm-chain-dev-latest.onrender.com/api/auth/login', {
        // const response = await axios.post('/api/auth/login', {
        username,
        password,
      });
      const { token, username: resUsername, role, menus, estateId } = response.data;
      setAuthState({ token, username: resUsername, role, menus, estateId });
      localStorage.setItem('token', token);
      localStorage.setItem('username', resUsername);
      localStorage.setItem('role', role);
      localStorage.setItem('menus', JSON.stringify(menus));
      localStorage.setItem('estateId', estateId);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({ token: null, username: null, role: null, menus: [], estateId: null });
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('menus');
    localStorage.removeItem('estateId');
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};