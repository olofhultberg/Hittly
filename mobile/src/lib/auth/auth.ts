import { apiClient, ApiError } from '../api/client';

export interface User {
  id: string;
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  userId: string;
}

/**
 * Validerar e-postformat
 */
function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Ogiltig e-postadress');
  }
}

/**
 * Validerar lösenord (minst 8 tecken)
 */
function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new Error('Lösenord måste vara minst 8 tecken');
  }
}

/**
 * Registrerar en ny användare
 */
export async function register(email: string, password: string): Promise<void> {
  validateEmail(email);
  validatePassword(password);

  try {
    await apiClient.post('/api/Auth/register', {
      email: email.trim(),
      password,
    } as RegisterRequest);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.errors) {
      const errorMessages = Object.values(apiError.errors).flat();
      throw new Error(errorMessages.join(', ') || apiError.message);
    }
    throw new Error(apiError.message || 'Kunde inte registrera användare');
  }
}

/**
 * Loggar in användare
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  validateEmail(email);
  
  if (!password || password.length === 0) {
    throw new Error('Lösenord är obligatoriskt');
  }

  try {
    const response = await apiClient.post<LoginResponse>('/api/Auth/login', {
      email: email.trim(),
      password,
    } as LoginRequest);
    
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.message || 'Inloggning misslyckades');
  }
}

/**
 * Loggar ut användare
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/Auth/logout');
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.message || 'Utloggning misslyckades');
  }
}

/**
 * Hämtar användare (för kompatibilitet med befintlig kod)
 * OBS: Backend har inte denna endpoint ännu, returnerar null
 */
export async function getUser(id?: string): Promise<User | null> {
  // Backend har inte en GET user endpoint ännu
  // För nu returnerar vi null och förlitar oss på login-session
  return null;
}

/**
 * Validerar PIN (för kompatibilitet med befintlig kod)
 * OBS: Backend använder e-post/lösenord, inte PIN
 * Detta är en placeholder för att inte bryta befintlig kod
 */
export async function validatePin(pin: string): Promise<boolean> {
  // PIN-validering används inte längre med backend
  // Returnera false för att tvinga användning av e-post/lösenord
  return false;
}

/**
 * Kollar om onboarding är slutförd
 * OBS: Backend har inte onboarding-endpoint ännu, använder localStorage som fallback
 */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    // För nu använder vi localStorage som fallback
    // Backend kan implementera en endpoint för detta senare
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('onboarding_complete') === 'true';
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Markerar onboarding som slutförd
 * OBS: Backend har inte onboarding-endpoint ännu, använder localStorage som fallback
 */
export async function completeOnboarding(): Promise<void> {
  // För nu använder vi localStorage som fallback
  // Backend kan implementera en endpoint för detta senare
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('onboarding_complete', 'true');
  }
}
