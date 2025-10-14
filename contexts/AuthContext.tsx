
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client } from '@/types';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: Client | null;
  login: (user: Client) => Promise<void>;
  logout: () => Promise<void>;
  isFirstAccess: boolean;
  setIsFirstAccess: (value: boolean) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'user_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Client | null>(null);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session on app start
  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      console.log('Loading user session from secure store...');
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      
      if (userJson) {
        const userData = JSON.parse(userJson);
        console.log('User session found:', userData.nomeUtente);
        setUser(userData);
      } else {
        console.log('No user session found');
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: Client) => {
    try {
      console.log('User logged in:', userData.nomeUtente);
      setUser(userData);
      
      // Save user session to secure store
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
      console.log('User session saved to secure store');
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  };

  const logout = async () => {
    try {
      console.log('User logged out');
      setUser(null);
      setIsFirstAccess(false);
      
      // Remove user session from secure store
      await SecureStore.deleteItemAsync(USER_KEY);
      console.log('User session removed from secure store');
    } catch (error) {
      console.error('Error removing user session:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isFirstAccess, setIsFirstAccess, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
