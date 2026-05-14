'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  initialized: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone: string, referralCode?: string) => Promise<boolean>;
  googleLogin: (idToken: string) => Promise<boolean>;
  updateProfile: (name: string, phone: string) => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function tokenToUser(data: { id: number; name: string; email: string; role: string; phone?: string; photoUrl?: string }): User {
  return {
    id: String(data.id),
    name: data.name,
    email: data.email,
    phone: data.phone ?? '',
    role: data.role,
    photoUrl: data.photoUrl ?? '',
    addresses: [],
    orders: [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) setUser(JSON.parse(stored));
    setInitialized(true);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await api.auth.login(email, password);
      localStorage.setItem('auth_token', data.token);
      const me = await api.auth.getMe().catch(() => null);
      const u = tokenToUser({ ...data, phone: me?.phone, photoUrl: me?.photoUrl });
      localStorage.setItem('auth_user', JSON.stringify(u));
      setUser(u);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (idToken: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await api.auth.googleLogin(idToken);
      localStorage.setItem('auth_token', data.token);
      const me = await api.auth.getMe().catch(() => null);
      const u = tokenToUser({ ...data, phone: me?.phone, photoUrl: me?.photoUrl });
      localStorage.setItem('auth_user', JSON.stringify(u));
      setUser(u);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone: string, referralCode?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await api.auth.register(name, email, password, phone, referralCode);
      localStorage.setItem('auth_token', data.token);
      const me = await api.auth.getMe().catch(() => null);
      const u = tokenToUser({ ...data, phone: me?.phone ?? phone, photoUrl: me?.photoUrl });
      localStorage.setItem('auth_user', JSON.stringify(u));
      setUser(u);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (name: string, phone: string): Promise<boolean> => {
    try {
      const data = await api.auth.updateProfile(name, phone);
      const updated = { ...user!, name: data.name, phone: data.phone, photoUrl: data.photoUrl ?? user?.photoUrl ?? '' };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      setUser(updated);
      return true;
    } catch {
      return false;
    }
  };

  const uploadPhoto = async (file: File): Promise<boolean> => {
    try {
      const data = await api.auth.uploadPhoto(file);
      const photoUrl = data.photoUrl ? `${data.photoUrl}?t=${Date.now()}` : data.photoUrl;
      const updated = { ...user!, photoUrl };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      setUser(updated);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    window.dispatchEvent(new Event('user-logout'));
  };

  return (
    <AuthContext.Provider value={{ user, initialized, isLoading, login, register, googleLogin, updateProfile, uploadPhoto, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
