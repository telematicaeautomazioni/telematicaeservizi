
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Client } from '@/types';

interface AuthContextType {
  user: Client | null;
  login: (user: Client) => void;
  logout: () => void;
  isFirstAccess: boolean;
  setIsFirstAccess: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Client | null>(null);
  const [isFirstAccess, setIsFirstAccess] = useState(false);

  const login = (userData: Client) => {
    console.log('User logged in:', userData.nomeUtente);
    setUser(userData);
  };

  const logout = () => {
    console.log('User logged out');
    setUser(null);
    setIsFirstAccess(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isFirstAccess, setIsFirstAccess }}>
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
