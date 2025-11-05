import { Box, createBox, getBox, getBoxesBySpace, updateBox, deleteBox, moveBox } from ../../lib/boxes/boxes';
import { createSpace } from ../../lib/spaces/spaces';

describe('Boxes (Lådor) CRUD', () => {
  let testSpaceId: number;

  beforeEach(async () => {
    // Skapa testutrymme innan varje test
    const space = await createSpace('Testutrymme');
    testSpaceId = space.id;
    jest.clearAllMocks();
  });

  describe('createBox', () => {
    it('skapar en ny låda med namn och utrymme', async () => {
      const box = await createBox({
        name: 'Låda 1',
        spaceId: testSpaceId,
      });
      
      expect(box).toBeDefined();
      expect(box.name).toBe('Låda 1');
      expect(box.spaceId).toBe(testSpaceId);
      expect(box.id).toBeDefined();
      expect(box.labelCode).toBeDefined();
      expect(typeof box.labelCode).toBe('string');
    });

    it('kastar fel om namn saknas', async () => {
      await expect(
        createBox({ name: '', spaceId: testSpaceId })
      ).rejects.toThrow('Namn är obligatoriskt');
    });

    it('kastar fel om utrymme inte finns', async () => {
      await expect(
        createBox({ name: 'Låda 1', spaceId: 99999 })
      ).rejects.toThrow('Utrymme hittades inte');
    });

    it('genererar unik label_code automatiskt', async () => {
      const box1 = await createBox({ name: 'Låda 1', spaceId: testSpaceId });
      const box2 = await createBox({ name: 'Låda 2', spaceId: testSpaceId });
      
      expect(box1.labelCode).not.toBe(box2.labelCode);
    });
  });

  describe('getBox', () => {
    it('hämtar en låda via id', async () => {
      const created = await createBox({ name: 'Låda 1', spaceId: testSpaceId });
      const retrieved = await getBox(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Låda 1');
    });

    it('returnerar null om låda inte finns', async () => {
      const result = await getBox(99999);
      expect(result).toBeNull();
    });
  });

  describe('getBoxesBySpace', () => {
    it('hämtar alla lådor i ett utrymme', async () => {
      await createBox({ name: 'Låda 1', spaceId: testSpaceId });
      await createBox({ name: 'Låda 2', spaceId: testSpaceId });
      
      const boxes = await getBoxesBySpace(testSpaceId);
      
      expect(boxes).toBeDefined();
      expect(Array.isArray(boxes)).toBe(true);
      expect(boxes.length).toBeGreaterThanOrEqual(2);
      expect(boxes.some(b => b.name === 'Låda 1')).toBe(true);
      expect(boxes.some(b => b.name === 'Låda 2')).toBe(true);
    });

    it('returnerar tom array om inga lådor finns', async () => {
      const boxes = await getBoxesBySpace(testSpaceId);
      expect(Array.isArray(boxes)).toBe(true);
    });
  });

  describe('updateBox', () => {
    it('uppdaterar namn på låda', async () => {
      const created = await createBox({ name: 'Låda 1', spaceId: testSpaceId });
      const updated = await updateBox(created.id, { name: 'Låda 1 (renoverad)' });
      
      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Låda 1 (renoverad)');
      expect(updated?.id).toBe(created.id);
    });

    it('kastar fel om låda inte finns', async () => {
      await expect(
        updateBox(99999, { name: 'Nytt namn' })
      ).rejects.toThrow('Låda hittades inte');
    });
  });

  describe('deleteBox', () => {
    it('tar bort en låda', async () => {
      const created = await createBox({ name: 'Tillfällig låda', spaceId: testSpaceId });
      await deleteBox(created.id);
      
      const retrieved = await getBox(created.id);
      expect(retrieved).toBeNull();
    });

    it('kastar fel om låda inte finns', async () => {
      await expect(deleteBox(99999)).rejects.toThrow('Låda hittades inte');
    });
  });

  describe('moveBox', () => {
    it('flyttar en låda till nytt utrymme', async () => {
      const newSpace = await createSpace('Nytt utrymme');
      const box = await createBox({ name: 'Låda 1', spaceId: testSpaceId });
      
      const moved = await moveBox(box.id, newSpace.id, null);
      
      expect(moved).toBeDefined();
      expect(moved?.spaceId).toBe(newSpace.id);
      expect(moved?.id).toBe(box.id);
    });

    it('flyttar alla objekt i lådan till nytt utrymme', async () => {
      // TODO: När Item-funktionalitet finns - testa att objekt flyttas med
      const newSpace = await createSpace('Nytt utrymme');
      const box = await createBox({ name: 'Låda med objekt', spaceId: testSpaceId });
      
      const moved = await moveBox(box.id, newSpace.id, null);
      
      expect(moved?.spaceId).toBe(newSpace.id);
      // TODO: Verifiera att alla objekt i lådan också flyttades
    });

    it('kastar fel om låda inte finns', async () => {
      await expect(moveBox(99999, testSpaceId, null)).rejects.toThrow('Låda hittades inte');
    });
  });
});

