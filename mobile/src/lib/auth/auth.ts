import { getDatabase } from '../db/database';
import * as Crypto from 'expo-crypto';

export interface User {
  id: number;
  pin: string; // OBS: Returneras inte i produktion, endast för test
  pin_hash: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Hashat PIN för säker lagring
 */
async function hashPin(pin: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
  return digest;
}

/**
 * Validerar PIN-format (exakt 4 siffror)
 */
function validatePinFormat(pin: string): void {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN måste vara 4 siffror');
  }
}

/**
 * Skapar en ny användare med PIN
 */
export async function createUser(pin: string): Promise<User> {
  validatePinFormat(pin);

  const db = getDatabase();

  // Kolla om användare redan finns
  const existing = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM users'
  );
  if (existing && existing.count > 0) {
    throw new Error('Användare finns redan');
  }

  const pinHash = await hashPin(pin);

  db.runSync('INSERT INTO users (pin_hash) VALUES (?)', [pinHash]);

  const result = db.getFirstSync<{
    id: number;
    pin_hash: string;
    created_at: string;
  }>('SELECT id, pin_hash, created_at FROM users ORDER BY id DESC LIMIT 1');

  if (!result) {
    throw new Error('Kunde inte skapa användare');
  }

  return {
    id: result.id,
    pin, // Endast för test, ska inte exponeras i produktion
    pin_hash: result.pin_hash,
    created_at: result.created_at,
  };
}

/**
 * Hämtar användare via id, eller första användaren om inget id anges
 */
export async function getUser(id?: number): Promise<User | null> {
  const db = getDatabase();

  let result;
  if (id) {
    result = db.getFirstSync<{
      id: number;
      pin_hash: string;
      created_at: string;
      updated_at?: string;
    }>('SELECT id, pin_hash, created_at, updated_at FROM users WHERE id = ?', [id]);
  } else {
    result = db.getFirstSync<{
      id: number;
      pin_hash: string;
      created_at: string;
      updated_at?: string;
    }>('SELECT id, pin_hash, created_at, updated_at FROM users ORDER BY id ASC LIMIT 1');
  }

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    pin: '', // PIN returneras inte
    pin_hash: result.pin_hash,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
}

/**
 * Uppdaterar användarens PIN
 */
export async function updateUserPin(
  userId: number,
  newPin: string,
  currentPin?: string
): Promise<User | null> {
  validatePinFormat(newPin);

  const db = getDatabase();
  const user = await getUser(userId);

  if (!user) {
    throw new Error('Användare hittades inte');
  }

  // Om currentPin anges, validera det först
  if (currentPin) {
    const currentPinHash = await hashPin(currentPin);
    if (currentPinHash !== user.pin_hash) {
      throw new Error('Felaktigt nuvarande PIN');
    }
  }

  const newPinHash = await hashPin(newPin);

  db.runSync(
    'UPDATE users SET pin_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [newPinHash, userId]
  );

  return await getUser(userId);
}

/**
 * Validerar PIN mot användarens lagrade PIN
 */
export async function validatePin(pin: string): Promise<boolean> {
  validatePinFormat(pin);

  const user = await getUser();
  if (!user) {
    throw new Error('Ingen användare finns');
  }

  const pinHash = await hashPin(pin);
  return pinHash === user.pin_hash;
}

/**
 * Kollar om onboarding är slutförd
 */
export async function isOnboardingComplete(): Promise<boolean> {
  const db = getDatabase();
  const result = db.getFirstSync<{ is_complete: number }>(
    'SELECT is_complete FROM onboarding_status WHERE id = 1'
  );

  return result ? result.is_complete === 1 : false;
}

/**
 * Markerar onboarding som slutförd
 */
export async function completeOnboarding(): Promise<void> {
  const db = getDatabase();

  // Skapa eller uppdatera onboarding-status
  db.runSync(`
    INSERT OR REPLACE INTO onboarding_status (id, is_complete, updated_at)
    VALUES (1, 1, CURRENT_TIMESTAMP)
  `);
}
