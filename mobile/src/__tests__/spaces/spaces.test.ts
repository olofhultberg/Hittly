import { Space, createSpace, getSpace, getAllSpaces, updateSpace, deleteSpace } from '../../lib/spaces/spaces';

describe('Spaces (Utrymmen) CRUD', () => {
  beforeEach(() => {
    // Rensa mock-data innan varje test
    jest.clearAllMocks();
  });

  describe('createSpace', () => {
    it('skapar ett nytt utrymme med namn', async () => {
      const space = await createSpace('Vinden');
      
      expect(space).toBeDefined();
      expect(space.name).toBe('Vinden');
      expect(space.id).toBeDefined();
      expect(typeof space.id).toBe('number');
    });

    it('kastar fel om namn saknas', async () => {
      await expect(createSpace('')).rejects.toThrow('Namn är obligatoriskt');
    });

    it('kastar fel om namn är för långt (>100 tecken)', async () => {
      const longName = 'a'.repeat(101);
      await expect(createSpace(longName)).rejects.toThrow('Namn får inte vara längre än 100 tecken');
    });
  });

  describe('getSpace', () => {
    it('hämtar ett utrymme via id', async () => {
      const created = await createSpace('Förråd');
      const retrieved = await getSpace(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Förråd');
    });

    it('returnerar null om utrymme inte finns', async () => {
      const result = await getSpace(99999);
      expect(result).toBeNull();
    });
  });

  describe('getAllSpaces', () => {
    it('hämtar alla utrymmen', async () => {
      await createSpace('Vinden');
      await createSpace('Förråd');
      await createSpace('Källare');
      
      const spaces = await getAllSpaces();
      
      expect(spaces).toBeDefined();
      expect(Array.isArray(spaces)).toBe(true);
      expect(spaces.length).toBeGreaterThanOrEqual(3);
      expect(spaces.some(s => s.name === 'Vinden')).toBe(true);
      expect(spaces.some(s => s.name === 'Förråd')).toBe(true);
      expect(spaces.some(s => s.name === 'Källare')).toBe(true);
    });

    it('returnerar tom array om inga utrymmen finns', async () => {
      const spaces = await getAllSpaces();
      expect(Array.isArray(spaces)).toBe(true);
    });
  });

  describe('updateSpace', () => {
    it('uppdaterar namn på utrymme', async () => {
      const created = await createSpace('Vinden');
      const updated = await updateSpace(created.id, 'Vinden (renoverad)');
      
      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Vinden (renoverad)');
      expect(updated?.id).toBe(created.id);
    });

    it('kastar fel om utrymme inte finns', async () => {
      await expect(updateSpace(99999, 'Nytt namn')).rejects.toThrow('Utrymme hittades inte');
    });
  });

  describe('deleteSpace', () => {
    it('tar bort ett utrymme', async () => {
      const created = await createSpace('Tillfälligt utrymme');
      await deleteSpace(created.id);
      
      const retrieved = await getSpace(created.id);
      expect(retrieved).toBeNull();
    });

    it('kastar fel om utrymme inte finns', async () => {
      await expect(deleteSpace(99999)).rejects.toThrow('Utrymme hittades inte');
    });

    it('hindrar borttagning om utrymme har lådor', async () => {
      const space = await createSpace('Vinden');
      // TODO: När Box-funktionalitet finns - skapa låda i utrymmet
      // await expect(deleteSpace(space.id)).rejects.toThrow('Kan inte ta bort utrymme med lådor');
    });
  });
});

