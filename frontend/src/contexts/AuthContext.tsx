import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginPayload, RegisterPayload } from '../types';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('shamzy_token');
    const stored = localStorage.getItem('shamzy_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
        authService.getMe().then((u) => {
          setUser(u);
          localStorage.setItem('shamzy_user', JSON.stringify(u));
        }).catch(() => {
          localStorage.removeItem('shamzy_token');
          localStorage.removeItem('shamzy_user');
          setUser(null);
        }).finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    const { token, user } = await authService.login(payload);
    localStorage.setItem('shamzy_token', token);
    localStorage.setItem('shamzy_user', JSON.stringify(user));
    setUser(user);
    toast.success(`Welcome back, ${user.name}!`);
  };

  const register = async (payload: RegisterPayload) => {
    const { token, user } = await authService.register(payload);
    localStorage.setItem('shamzy_token', token);
    localStorage.setItem('shamzy_user', JSON.stringify(user));
    setUser(user);
    toast.success(`Welcome to SHAMZY COUTURE, ${user.name}!`);
  };

  const logout = () => {
    localStorage.removeItem('shamzy_token');
    localStorage.removeItem('shamzy_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
