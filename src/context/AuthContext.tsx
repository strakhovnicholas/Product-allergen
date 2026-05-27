import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { logoutApi } from '../api/authApi';
import {
  clearAuthTokens,
  setAccessToken,
  setRefreshToken,
} from '../api/client';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('accessToken');
      const savedRefreshToken = await AsyncStorage.getItem('refreshToken');

      if (savedToken) {
        setAccessToken(savedToken);
        setRefreshToken(savedRefreshToken);
        setToken(savedToken);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.log('Auth init error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newRefreshToken?: string) => {
    try {
      setAccessToken(newToken);
      setRefreshToken(newRefreshToken ?? null);

      const entries: [string, string][] = [['accessToken', newToken]];
      if (newRefreshToken) {
        entries.push(['refreshToken', newRefreshToken]);
      }
      await AsyncStorage.multiSet(entries);

      setToken(newToken);
      setIsAuthenticated(true);
    } catch (e) {
      console.log('Login error', e);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await logoutApi(refreshToken).catch(() => undefined);
      }
      await clearAuthTokens();
    } finally {
      setToken(null);
      setIsAuthenticated(false);
      setAccessToken(null);
      setRefreshToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);