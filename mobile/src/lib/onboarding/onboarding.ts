import { completeOnboarding, isOnboardingComplete } from '../auth/auth';
import { createSpace } from '../spaces/spaces';

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

  // Skapa utrymmet via API
  const space = await createSpace(name.trim());

  // Markera onboarding som slutförd
  await completeOnboarding();

  return {
    id: space.id,
    name: space.name,
  };
}

/**
 * Hoppar över onboarding utan att skapa utrymme
 */
export async function skipOnboarding(): Promise<void> {
  await completeOnboarding();
}
