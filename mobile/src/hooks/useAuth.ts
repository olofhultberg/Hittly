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
      if (!user) {
        setAuthState('loggedOut');
        setIsAuthenticated(false);
        return;
      }

      const showOnboarding = await shouldShowOnboarding();
      if (showOnboarding) {
        setAuthState('onboarding');
        setIsAuthenticated(false);
      } else {
        setAuthState('loggedIn');
        setIsAuthenticated(true);
      }
    } catch (error) {
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

