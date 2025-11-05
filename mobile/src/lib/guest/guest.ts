// TODO: Implementera Gästvy funktionalitet
export interface GuestMode {
  enabled: boolean;
  pin?: string;
}

export function enableGuestMode(pin: string): void {
  throw new Error('Not implemented');
}

export function disableGuestMode(): void {
  throw new Error('Not implemented');
}

export function isGuestModeEnabled(): boolean {
  throw new Error('Not implemented');
}

export function validatePin(pin: string): boolean {
  throw new Error('Not implemented');
}

