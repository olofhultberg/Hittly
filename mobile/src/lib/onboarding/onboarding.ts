import { getDatabase } from '../db/database';
import { completeOnboarding, isOnboardingComplete } from '../auth/auth';

export interface OnboardingSpace {
  id: number;
  name: string;
}

/**
 * Kollar om onboarding ska visas
 */
export async function shouldShowOnboarding(): Promise<boolean> {
  return !(await isOnboardingComplete());
}

/**
 * Skapar första utrymmet och slutför onboarding
 */
export async function createFirstSpace(name: string): Promise<OnboardingSpace> {
  if (!name || name.trim().length === 0) {
    throw new Error('Namn är obligatoriskt');
  }

  const db = getDatabase();

  // Skapa utrymmet
  db.runSync('INSERT INTO spaces (name) VALUES (?)', [name.trim()]);

  const result = db.getFirstSync<{
    id: number;
    name: string;
  }>('SELECT id, name FROM spaces ORDER BY id DESC LIMIT 1');

  if (!result) {
    throw new Error('Kunde inte skapa utrymme');
  }

  // Markera onboarding som slutförd
  await completeOnboarding();

  return {
    id: result.id,
    name: result.name,
  };
}

/**
 * Hoppar över onboarding utan att skapa utrymme
 */
export async function skipOnboarding(): Promise<void> {
  await completeOnboarding();
}
