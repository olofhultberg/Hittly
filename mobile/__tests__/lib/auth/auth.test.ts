import {
  createUser,
  getUser,
  updateUserPin,
  validatePin,
  isOnboardingComplete,
  completeOnboarding,
} from '../../../lib/auth/auth';

describe('Auth (Användarhantering)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('skapar en ny användare med PIN', async () => {
      const user = await createUser('1234');
      
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.pin).toBeDefined();
      expect(user.created_at).toBeDefined();
    });

    it('kastar fel om PIN är för kort (mindre än 4 siffror)', async () => {
      await expect(createUser('123')).rejects.toThrow('PIN måste vara 4 siffror');
    });

    it('kastar fel om PIN är för långt (mer än 4 siffror)', async () => {
      await expect(createUser('12345')).rejects.toThrow('PIN måste vara 4 siffror');
    });

    it('kastar fel om PIN innehåller icke-numeriska tecken', async () => {
      await expect(createUser('12ab')).rejects.toThrow('PIN måste vara 4 siffror');
    });

    it('kastar fel om användare redan finns', async () => {
      await createUser('1234');
      await expect(createUser('5678')).rejects.toThrow('Användare finns redan');
    });
  });

  describe('getUser', () => {
    it('hämtar användare via id', async () => {
      const created = await createUser('1234');
      const retrieved = await getUser(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('returnerar null om användare inte finns', async () => {
      const result = await getUser(99999);
      expect(result).toBeNull();
    });

    it('hämtar första användaren om inget id anges', async () => {
      await createUser('1234');
      const user = await getUser();
      
      expect(user).toBeDefined();
      expect(user?.id).toBeDefined();
    });
  });

  describe('updateUserPin', () => {
    it('uppdaterar användarens PIN', async () => {
      const user = await createUser('1234');
      const updated = await updateUserPin(user.id, '5678');
      
      expect(updated).toBeDefined();
      expect(updated?.pin).not.toBe('1234');
    });

    it('kräver korrekt gammalt PIN för att uppdatera', async () => {
      const user = await createUser('1234');
      
      await expect(
        updateUserPin(user.id, '5678', '9999')
      ).rejects.toThrow('Felaktigt nuvarande PIN');
    });

    it('kastar fel om användare inte finns', async () => {
      await expect(updateUserPin(99999, '5678')).rejects.toThrow('Användare hittades inte');
    });
  });

  describe('validatePin', () => {
    it('validerar korrekt PIN', async () => {
      await createUser('1234');
      const isValid = await validatePin('1234');
      
      expect(isValid).toBe(true);
    });

    it('returnerar false för fel PIN', async () => {
      await createUser('1234');
      const isValid = await validatePin('0000');
      
      expect(isValid).toBe(false);
    });

    it('kastar fel om ingen användare finns', async () => {
      await expect(validatePin('1234')).rejects.toThrow('Ingen användare finns');
    });
  });

  describe('Onboarding', () => {
    it('kollar om onboarding är klar', async () => {
      const isComplete = await isOnboardingComplete();
      
      expect(typeof isComplete).toBe('boolean');
    });

    it('returnerar false när onboarding inte är klar', async () => {
      const isComplete = await isOnboardingComplete();
      expect(isComplete).toBe(false);
    });

    it('markerar onboarding som klar', async () => {
      await completeOnboarding();
      const isComplete = await isOnboardingComplete();
      
      expect(isComplete).toBe(true);
    });

    it('kräver att användare skapas innan onboarding kan slutföras', async () => {
      // TODO: När onboarding-flödet är implementerat - testa att det kräver användare
    });
  });
});

