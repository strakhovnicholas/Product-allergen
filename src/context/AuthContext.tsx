import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('mock_token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (login: string, password: string) => {
    if (!login || !password) {
      throw new Error('Введите логин и пароль');
    }

    // 🔥 Мок — просто сохраняем токен
    await AsyncStorage.setItem('mock_token', '123');

    setIsAuthenticated(true);
  };

  const register = async (login: string, password: string) => {
    if (!login || !password) {
      throw new Error('Заполните все поля');
    }

    // 🔥 Мок регистрация
    await AsyncStorage.setItem('mock_token', '123');

    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('mock_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);