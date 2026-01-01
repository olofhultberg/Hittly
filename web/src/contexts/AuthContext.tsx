import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
import type { LoginDto, RegisterDto } from '../types/api';

// Translate common password validation errors to Swedish
function translateError(message: string): string {
  const translations: Record<string, string> = {
    "Passwords must have at least one digit ('0'-'9').": "Lösenordet måste innehålla minst en siffra (0-9).",
    "Passwords must have at least one uppercase ('A'-'Z').": "Lösenordet måste innehålla minst en stor bokstav (A-Z).",
    "Passwords must have at least one lowercase ('a'-'z').": "Lösenordet måste innehålla minst en liten bokstav (a-z).",
    "Passwords must be at least 8 characters.": "Lösenordet måste vara minst 8 tecken långt.",
    "Passwords must have at least one non alphanumeric character.": "Lösenordet måste innehålla minst ett icke-alfanumeriskt tecken.",
  };
  
  return translations[message] || message;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  errorMessages: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Check if user is already authenticated on mount
  useEffect(() => {
    // For now, we'll check localStorage or try to verify session
    // In a real app, you'd verify with the backend
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      setErrorMessages([]);
      const data: LoginDto = { email, password };
      const response = await authApi.login(data);
      
      if (response.userId) {
        setUserId(response.userId);
        setIsAuthenticated(true);
        localStorage.setItem('userId', response.userId);
      } else {
        throw new Error('Inloggning misslyckades');
      }
    } catch (err: any) {
      let errorMessage = 'Ett fel uppstod vid inloggning';
      let messages: string[] = [];
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check if ApiError has messages array
        if ((err as any).messages && Array.isArray((err as any).messages)) {
          messages = (err as any).messages.map(translateError);
        }
      }
      
      setError(errorMessage);
      setErrorMessages(messages);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      setErrorMessages([]);
      const data: RegisterDto = { email, password };
      await authApi.register(data);
      // After registration, automatically log in
      await login(email, password);
    } catch (err: any) {
      let errorMessage = 'Ett fel uppstod vid registrering';
      let messages: string[] = [];
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check if ApiError has messages array
        if ((err as any).messages && Array.isArray((err as any).messages)) {
          messages = (err as any).messages.map(translateError);
        }
      }
      
      setError(errorMessage);
      setErrorMessages(messages);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorMessages([]);
      await authApi.logout();
      setIsAuthenticated(false);
      setUserId(null);
      localStorage.removeItem('userId');
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Ett fel uppstod vid utloggning';
      setError(errorMessage);
      setErrorMessages([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        login,
        register,
        logout,
        loading,
        error,
        errorMessages,
      }}
    >
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


