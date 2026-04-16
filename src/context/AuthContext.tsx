import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginApi, registerApi } from '../api/authApi';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractToken(data: any) {
  return data?.accessToken || data?.token || '';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('auth_token');
    setIsAuthenticated(Boolean(token));
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const data = await loginApi({ email, password });
    const token = extractToken(data);
    if (!token) throw new Error('Нет токена');
    await AsyncStorage.setItem('auth_token', token);
    if (data.refreshToken) {
      await AsyncStorage.setItem('refresh_token', data.refreshToken);
    }
    setIsAuthenticated(true);
  };

  const register = async (email: string, password: string) => {
    const data = await registerApi({ email, password });
    const token = extractToken(data);
    if (!token) throw new Error('Нет токена');
    await AsyncStorage.setItem('auth_token', token);
    if (data.refreshToken) {
      await AsyncStorage.setItem('refresh_token', data.refreshToken);
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext');
  return context;
}