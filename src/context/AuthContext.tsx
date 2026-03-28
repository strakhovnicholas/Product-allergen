import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { loginApi, logoutApi, registerApi } from '../api/authApi';

type RegisterPayload = {
  email: string;
  password: string;
  fullName?: string;
  country?: string;
  timezone?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.log('Ошибка проверки авторизации:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await loginApi({ email, password });

    await AsyncStorage.setItem('auth_token', data.accessToken);
    await AsyncStorage.setItem('refresh_token', data.refreshToken);

    setIsAuthenticated(true);
  };

  const register = async (payload: RegisterPayload) => {
    const data = await registerApi(payload);

    await AsyncStorage.setItem('auth_token', data.accessToken);
    await AsyncStorage.setItem('refresh_token', data.refreshToken);

    setIsAuthenticated(true);
  };

  const logout = async () => {
    const refreshToken = await AsyncStorage.getItem('refresh_token');

    // СНАЧАЛА мгновенно выходим локально
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('refresh_token');
    setIsAuthenticated(false);

    // ПОТОМ best-effort сообщаем серверу, но UI не блокируем
    if (refreshToken) {
      logoutApi(refreshToken).catch((error) => {
        console.log('Ошибка logout API:', error);
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }

  return context;
}