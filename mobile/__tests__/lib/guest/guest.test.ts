import { GuestMode, enableGuestMode, disableGuestMode, isGuestModeEnabled, validatePin } from '../../../lib/guest/guest';

describe('Gästvy (Guest Mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Rensa gästläge innan varje test
    disableGuestMode();
  });

  describe('enableGuestMode', () => {
    it('aktiverar gästläge med PIN', () => {
      enableGuestMode('1234');
      
      expect(isGuestModeEnabled()).toBe(true);
    });

    it('kastar fel om PIN är för kort (mindre än 4 siffror)', () => {
      expect(() => enableGuestMode('123')).toThrow('PIN måste vara 4 siffror');
    });

    it('kastar fel om PIN är för långt (mer än 4 siffror)', () => {
      expect(() => enableGuestMode('12345')).toThrow('PIN måste vara 4 siffror');
    });

    it('kastar fel om PIN innehåller icke-numeriska tecken', () => {
      expect(() => enableGuestMode('12ab')).toThrow('PIN måste vara 4 siffror');
      expect(() => enableGuestMode('12 4')).toThrow('PIN måste vara 4 siffror');
    });
  });

  describe('disableGuestMode', () => {
    it('inaktiverar gästläge', () => {
      enableGuestMode('1234');
      expect(isGuestModeEnabled()).toBe(true);
      
      disableGuestMode();
      
      expect(isGuestModeEnabled()).toBe(false);
    });
  });

  describe('isGuestModeEnabled', () => {
    it('returnerar false när gästläge inte är aktiverat', () => {
      expect(isGuestModeEnabled()).toBe(false);
    });

    it('returnerar true när gästläge är aktiverat', () => {
      enableGuestMode('1234');
      expect(isGuestModeEnabled()).toBe(true);
    });
  });

  describe('validatePin', () => {
    it('validerar korrekt PIN', () => {
      enableGuestMode('1234');
      
      expect(validatePin('1234')).toBe(true);
    });

    it('returnerar false för fel PIN', () => {
      enableGuestMode('1234');
      
      expect(validatePin('0000')).toBe(false);
      expect(validatePin('5678')).toBe(false);
    });

    it('kastar fel om gästläge inte är aktiverat', () => {
      expect(() => validatePin('1234')).toThrow('Gästläge är inte aktiverat');
    });
  });

  describe('Read-only begränsningar', () => {
    it('hindrar skapande av objekt i gästläge', async () => {
      enableGuestMode('1234');
      
      // TODO: När Item-funktionalitet finns - testa att createItem kastar fel i gästläge
      // await expect(createItem(...)).rejects.toThrow('Gästläge: endast läsning tillåten');
    });

    it('hindrar uppdatering av objekt i gästläge', async () => {
      enableGuestMode('1234');
      
      // TODO: När Item-funktionalitet finns - testa att updateItem kastar fel i gästläge
      // await expect(updateItem(...)).rejects.toThrow('Gästläge: endast läsning tillåten');
    });

    it('hindrar borttagning av objekt i gästläge', async () => {
      enableGuestMode('1234');
      
      // TODO: När Item-funktionalitet finns - testa att deleteItem kastar fel i gästläge
      // await expect(deleteItem(...)).rejects.toThrow('Gästläge: endast läsning tillåten');
    });

    it('tillåter sökning i gästläge', async () => {
      enableGuestMode('1234');
      
      // TODO: När sökfunktionalitet finns - testa att searchItems fungerar i gästläge
      // const results = await searchItems('test');
      // expect(results).toBeDefined();
    });

    it('tillåter läsning av objekt i gästläge', async () => {
      enableGuestMode('1234');
      
      // TODO: När Item-funktionalitet finns - testa att getItem fungerar i gästläge
      // const item = await getItem(id);
      // expect(item).toBeDefined();
    });
  });
});

