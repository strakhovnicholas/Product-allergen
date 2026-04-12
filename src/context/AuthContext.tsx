import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { loginApi, registerApi } from '../api/authApi';

type RegisterPayload = {
  email: string;
  password: string;
  fullName?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractAccessToken(data: {
  accessToken?: string;
  token?: string;
}) {
  return data.accessToken || data.token || '';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      setIsAuthenticated(Boolean(token));
    } catch (error) {
      console.log('Ошибка проверки авторизации:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await loginApi({
        email: email.trim(),
        password,
      });

      const accessToken = extractAccessToken(data);

      if (!accessToken) {
        throw new Error('Сервер не вернул токен авторизации');
      }

      await AsyncStorage.setItem('auth_token', accessToken);

      if (data.refreshToken) {
        await AsyncStorage.setItem('refresh_token', data.refreshToken);
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.log('Ошибка входа:', error);
      throw error;
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const data = await registerApi({
        email: payload.email.trim(),
        password: payload.password,
        fullName: payload.fullName?.trim() || undefined,
      });

      const accessToken = extractAccessToken(data);

      if (!accessToken) {
        throw new Error('Сервер не вернул токен после регистрации');
      }

      await AsyncStorage.setItem('auth_token', accessToken);

      if (data.refreshToken) {
        await AsyncStorage.setItem('refresh_token', data.refreshToken);
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.log('Ошибка регистрации:', error);
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
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