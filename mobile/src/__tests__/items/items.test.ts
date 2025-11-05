import { Item, createItem, getItem, updateItem, deleteItem, addTagToItem, removeTagFromItem } from ../../lib/items/items';
import { createSpace } from ../../lib/spaces/spaces';
import { createBox } from ../../lib/boxes/boxes';

describe('Items (Saker) CRUD', () => {
  let testSpaceId: number;
  let testBoxId: number;

  beforeEach(async () => {
    const space = await createSpace('Testutrymme');
    testSpaceId = space.id;
    const box = await createBox({ name: 'Testlåda', spaceId: testSpaceId });
    testBoxId = box.id;
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('skapar ett nytt objekt med namn, beskrivning och plats', async () => {
      const item = await createItem({
        name: 'Julpynt',
        description: 'Lådan med julgransdekorationer',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      expect(item).toBeDefined();
      expect(item.name).toBe('Julpynt');
      expect(item.description).toBe('Lådan med julgransdekorationer');
      expect(item.spaceId).toBe(testSpaceId);
      expect(item.boxId).toBe(testBoxId);
      expect(item.id).toBeDefined();
    });

    it('kastar fel om namn saknas', async () => {
      await expect(
        createItem({
          name: '',
          description: 'Beskrivning',
          spaceId: testSpaceId,
          boxId: testBoxId,
        })
      ).rejects.toThrow('Namn är obligatoriskt');
    });

    it('kastar fel om låda inte finns', async () => {
      await expect(
        createItem({
          name: 'Objekt',
          description: 'Beskrivning',
          spaceId: testSpaceId,
          boxId: 99999,
        })
      ).rejects.toThrow('Låda hittades inte');
    });

    it('tillåter objekt utan beskrivning', async () => {
      const item = await createItem({
        name: 'Objekt utan beskrivning',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      expect(item).toBeDefined();
      expect(item.description).toBe('');
    });
  });

  describe('getItem', () => {
    it('hämtar ett objekt via id', async () => {
      const created = await createItem({
        name: 'Testobjekt',
        description: 'Beskrivning',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      const retrieved = await getItem(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Testobjekt');
    });

    it('returnerar null om objekt inte finns', async () => {
      const result = await getItem(99999);
      expect(result).toBeNull();
    });
  });

  describe('updateItem', () => {
    it('uppdaterar namn och beskrivning på objekt', async () => {
      const created = await createItem({
        name: 'Gammalt namn',
        description: 'Gammal beskrivning',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      const updated = await updateItem(created.id, {
        name: 'Nytt namn',
        description: 'Ny beskrivning',
      });
      
      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Nytt namn');
      expect(updated?.description).toBe('Ny beskrivning');
    });

    it('kastar fel om objekt inte finns', async () => {
      await expect(
        updateItem(99999, { name: 'Nytt namn' })
      ).rejects.toThrow('Objekt hittades inte');
    });
  });

  describe('deleteItem', () => {
    it('tar bort ett objekt', async () => {
      const created = await createItem({
        name: 'Tillfälligt objekt',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      await deleteItem(created.id);
      
      const retrieved = await getItem(created.id);
      expect(retrieved).toBeNull();
    });

    it('kastar fel om objekt inte finns', async () => {
      await expect(deleteItem(99999)).rejects.toThrow('Objekt hittades inte');
    });
  });

  describe('Taggar', () => {
    it('lägger till tagg till objekt', async () => {
      const item = await createItem({
        name: 'Julpynt',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      await addTagToItem(item.id, 'Säsong');
      
      const retrieved = await getItem(item.id);
      expect(retrieved?.tags).toBeDefined();
      expect(Array.isArray(retrieved?.tags)).toBe(true);
      expect(retrieved?.tags?.some(t => t.name === 'Säsong')).toBe(true);
    });

    it('tar bort tagg från objekt', async () => {
      const item = await createItem({
        name: 'Julpynt',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      await addTagToItem(item.id, 'Säsong');
      await removeTagFromItem(item.id, 'Säsong');
      
      const retrieved = await getItem(item.id);
      expect(retrieved?.tags?.some(t => t.name === 'Säsong')).toBe(false);
    });

    it('hindrar dubbletter av taggar', async () => {
      const item = await createItem({
        name: 'Objekt',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      await addTagToItem(item.id, 'Säsong');
      await addTagToItem(item.id, 'Säsong');
      
      const retrieved = await getItem(item.id);
      const sasongTags = retrieved?.tags?.filter(t => t.name === 'Säsong') || [];
      expect(sasongTags.length).toBe(1);
    });
  });
});

