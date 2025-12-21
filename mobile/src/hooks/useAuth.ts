import { useState, useEffect } from 'react';
import { getUser, validatePin } from '../lib/auth/auth';
import { shouldShowOnboarding } from '../lib/onboarding/onboarding';

export type AuthState = 'checking' | 'loggedIn' | 'loggedOut' | 'onboarding';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await getUser();
      console.log('Auth check - user:', user ? 'exists' : 'not found');
      
      if (!user) {
        // Ingen användare finns - visa login för att skapa PIN
        console.log('No user found - showing login');
        setAuthState('loggedOut');
        setIsAuthenticated(false);
        return;
      }

      // Användare finns - kolla onboarding-status
      try {
        const showOnboarding = await shouldShowOnboarding();
        console.log('Onboarding needed:', showOnboarding);
        
        if (showOnboarding) {
          setAuthState('onboarding');
          setIsAuthenticated(false);
        } else {
          setAuthState('loggedIn');
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Om onboarding-check misslyckas, anta att onboarding behövs
        console.error('Onboarding check error:', error);
        setAuthState('onboarding');
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Vid fel, visa login-skärm
      console.error('Auth check error:', error);
      setAuthState('loggedOut');
      setIsAuthenticated(false);
    }
  };

  const login = () => {
    setAuthState('loggedIn');
    setIsAuthenticated(true);
  };

  const logout = () => {
    setAuthState('loggedOut');
    setIsAuthenticated(false);
  };

  const startOnboarding = () => {
    setAuthState('onboarding');
    setIsAuthenticated(false);
  };

  const completeOnboarding = () => {
    setAuthState('loggedIn');
    setIsAuthenticated(true);
  };

  return {
    authState,
    isAuthenticated,
    login,
    logout,
    startOnboarding,
    completeOnboarding,
    checkAuthStatus,
  };
}

