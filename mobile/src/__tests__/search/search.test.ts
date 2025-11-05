import { searchItems } from '../../lib/search/search';
import { createSpace } from '../../lib/spaces/spaces';
import { createBox } from '../../lib/boxes/boxes';
import { createItem, addTagToItem } from '../../lib/items/items';

describe('Sökfunktionalitet', () => {
  let testSpaceId: number;
  let testBoxId: number;

  beforeEach(async () => {
    const space = await createSpace('Vinden');
    testSpaceId = space.id;
    const box = await createBox({ name: 'Låda 1', spaceId: testSpaceId });
    testBoxId = box.id;
    jest.clearAllMocks();
  });

  describe('searchItems', () => {
    it('söker efter objekt via namn', async () => {
      await createItem({
        name: 'Julpynt',
        description: 'Lådan med julgransdekorationer',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      await createItem({
        name: 'Cykeldäck',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      const results = await searchItems('Julpynt');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(r => r.name === 'Julpynt')).toBe(true);
      expect(results.some(r => r.name === 'Cykeldäck')).toBe(false);
    });

    it('söker efter objekt via beskrivning', async () => {
      await createItem({
        name: 'Objekt 1',
        description: 'Lådan med julgransdekorationer',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      const results = await searchItems('julgransdekorationer');
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(r => r.description?.includes('julgransdekorationer'))).toBe(true);
    });

    it('söker efter objekt via taggar', async () => {
      const item = await createItem({
        name: 'Julpynt',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      await addTagToItem(item.id, 'Säsong');
      
      const results = await searchItems('Säsong');
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(r => r.tags?.some(t => t.name === 'Säsong'))).toBe(true);
    });

    it('söker case-insensitive', async () => {
      await createItem({
        name: 'Julpynt',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      const results = await searchItems('julpynt');
      
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(r => r.name === 'Julpynt')).toBe(true);
    });

    it('söker efter delmatchningar', async () => {
      await createItem({
        name: 'Julpynt',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      const results = await searchItems('jul');
      
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(r => r.name.includes('Jul'))).toBe(true);
    });

    it('filtrerar på utrymme', async () => {
      const otherSpace = await createSpace('Förråd');
      const otherBox = await createBox({ name: 'Låda 1', spaceId: otherSpace.id });
      
      await createItem({
        name: 'Objekt i Vinden',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      await createItem({
        name: 'Objekt i Förråd',
        description: '',
        spaceId: otherSpace.id,
        boxId: otherBox.id,
      });
      
      const results = await searchItems('Objekt', { spaceId: testSpaceId });
      
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.every(r => r.spaceId === testSpaceId)).toBe(true);
      expect(results.some(r => r.name === 'Objekt i Förråd')).toBe(false);
    });

    it('filtrerar på låda', async () => {
      const box2 = await createBox({ name: 'Låda 2', spaceId: testSpaceId });
      
      await createItem({
        name: 'Objekt i Låda 1',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      await createItem({
        name: 'Objekt i Låda 2',
        description: '',
        spaceId: testSpaceId,
        boxId: box2.id,
      });
      
      const results = await searchItems('Objekt', { boxId: testBoxId });
      
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.every(r => r.boxId === testBoxId)).toBe(true);
      expect(results.some(r => r.name === 'Objekt i Låda 2')).toBe(false);
    });

    it('filtrerar på taggar', async () => {
      const item1 = await createItem({
        name: 'Julpynt',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      const item2 = await createItem({
        name: 'Vinterkläder',
        description: '',
        spaceId: testSpaceId,
        boxId: testBoxId,
      });
      
      await addTagToItem(item1.id, 'Säsong');
      await addTagToItem(item2.id, 'Kläder');
      
      const results = await searchItems('', { tag: 'Säsong' });
      
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(r => r.name === 'Julpynt')).toBe(true);
      expect(results.some(r => r.name === 'Vinterkläder')).toBe(false);
    });

    it('returnerar tom array om inga resultat hittas', async () => {
      const results = await searchItems('HittasEj');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });
});

