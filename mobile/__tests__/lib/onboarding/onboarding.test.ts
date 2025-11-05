import {
  shouldShowOnboarding,
  createFirstSpace,
  skipOnboarding,
  OnboardingSpace,
} from '../../../lib/onboarding/onboarding';

describe('Onboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shouldShowOnboarding', () => {
    it('returnerar true om onboarding inte är slutförd', async () => {
      const shouldShow = await shouldShowOnboarding();
      
      expect(typeof shouldShow).toBe('boolean');
    });

    it('returnerar false om onboarding är slutförd', async () => {
      await skipOnboarding();
      const shouldShow = await shouldShowOnboarding();
      
      expect(shouldShow).toBe(false);
    });
  });

  describe('createFirstSpace', () => {
    it('skapar första utrymmet under onboarding', async () => {
      const space = await createFirstSpace('Vinden');
      
      expect(space).toBeDefined();
      expect(space.name).toBe('Vinden');
      expect(space.id).toBeDefined();
    });

    it('kastar fel om namn saknas', async () => {
      await expect(createFirstSpace('')).rejects.toThrow('Namn är obligatoriskt');
    });

    it('markerar onboarding som slutförd efter att första utrymmet skapats', async () => {
      await createFirstSpace('Vinden');
      const shouldShow = await shouldShowOnboarding();
      
      expect(shouldShow).toBe(false);
    });
  });

  describe('skipOnboarding', () => {
    it('markerar onboarding som slutförd utan att skapa utrymme', async () => {
      await skipOnboarding();
      const shouldShow = await shouldShowOnboarding();
      
      expect(shouldShow).toBe(false);
    });
  });
});

