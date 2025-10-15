
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Client } from '@/types';
import { supabaseService } from '@/services/supabaseService';

interface AuthContextType {
  user: Client | null;
  login: (user: Client) => Promise<void>;
  logout: () => Promise<void>;
  isFirstAccess: boolean;
  setIsFirstAccess: (value: boolean) => void;
  canMakeDecisions: () => boolean;
  isLoading: boolean;
  checkStoredSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'user_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Client | null>(null);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored session on mount
  useEffect(() => {
    checkStoredSession();
  }, []);

  const checkStoredSession = async (): Promise<boolean> => {
    try {
      console.log('Checking for stored session...');
      setIsLoading(true);
      
      const storedSession = await SecureStore.getItemAsync(USER_SESSION_KEY);
      
      if (storedSession) {
        console.log('Found stored session, parsing...');
        const userData: Client = JSON.parse(storedSession);
        
        // Verify the session is still valid by fetching the user from the database
        const currentUser = await supabaseService.getClientById(userData.idCliente);
        
        if (currentUser) {
          console.log('Session is valid, auto-logging in user:', currentUser.nomeUtente);
          setUser(currentUser);
          setIsLoading(false);
          return true;
        } else {
          console.log('Session is invalid, clearing stored data');
          await SecureStore.deleteItemAsync(USER_SESSION_KEY);
        }
      } else {
        console.log('No stored session found');
      }
    } catch (error) {
      console.error('Error checking stored session:', error);
      // If there's an error, clear the stored session
      try {
        await SecureStore.deleteItemAsync(USER_SESSION_KEY);
      } catch (deleteError) {
        console.error('Error clearing invalid session:', deleteError);
      }
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  const login = async (userData: Client) => {
    try {
      console.log('User logged in:', userData.nomeUtente, 'Type:', userData.tipoUtente);
      setUser(userData);
      
      // Store the session securely
      console.log('Storing session securely...');
      await SecureStore.setItemAsync(USER_SESSION_KEY, JSON.stringify(userData));
      console.log('Session stored successfully');
    } catch (error) {
      console.error('Error storing session:', error);
      // Even if storage fails, keep the user logged in for this session
      setUser(userData);
    }
  };

  const logout = async () => {
    try {
      console.log('User logged out');
      setUser(null);
      setIsFirstAccess(false);
      
      // Clear the stored session
      console.log('Clearing stored session...');
      await SecureStore.deleteItemAsync(USER_SESSION_KEY);
      console.log('Session cleared successfully');
    } catch (error) {
      console.error('Error clearing session:', error);
      // Even if clearing fails, log the user out
      setUser(null);
      setIsFirstAccess(false);
    }
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
      canMakeDecisions,
      isLoading,
      checkStoredSession
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
