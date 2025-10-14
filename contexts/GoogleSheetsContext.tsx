
import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleSheetsService } from '@/services/googleSheetsService';

interface GoogleSheetsContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticate: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const GoogleSheetsContext = createContext<GoogleSheetsContextType | undefined>(undefined);

export function GoogleSheetsProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const authenticated = await googleSheetsService.initialize();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Errore nell\'inizializzazione dell\'autenticazione:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await googleSheetsService.authenticate();
      setIsAuthenticated(success);
      return success;
    } catch (error) {
      console.error('Errore durante l\'autenticazione:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await googleSheetsService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
    <GoogleSheetsContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        authenticate,
        logout,
      }}
    >
      {children}
    </GoogleSheetsContext.Provider>
  );
}

export function useGoogleSheets() {
  const context = useContext(GoogleSheetsContext);
  if (context === undefined) {
    throw new Error('useGoogleSheets deve essere usato all\'interno di GoogleSheetsProvider');
  }
  return context;
}
