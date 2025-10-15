
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Client } from '@/types';

interface AuthContextType {
  user: Client | null;
  login: (user: Client) => void;
  logout: () => void;
  isFirstAccess: boolean;
  setIsFirstAccess: (value: boolean) => void;
  canMakeDecisions: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Client | null>(null);
  const [isFirstAccess, setIsFirstAccess] = useState(false);

  const login = (userData: Client) => {
    console.log('User logged in:', userData.nomeUtente, 'Type:', userData.tipoUtente);
    setUser(userData);
  };

  const logout = () => {
    console.log('User logged out');
    setUser(null);
    setIsFirstAccess(false);
  };

  const canMakeDecisions = () => {
    return user?.tipoUtente === 'decide';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isFirstAccess, 
      setIsFirstAccess,
      canMakeDecisions 
    }}>
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
