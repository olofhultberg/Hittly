import { getDatabase } from '../db/database';
import { getBox } from '../boxes/boxes';

export interface Tag {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  spaceId: number;
  zoneId?: number | null;
  boxId: number;
  tags?: Tag[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateItemInput {
  name: string;
  description: string;
  spaceId: number;
  zoneId?: number | null;
  boxId: number;
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  spaceId?: number;
  zoneId?: number | null;
  boxId?: number;
}

export async function createItem(input: CreateItemInput): Promise<Item> {
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('Namn är obligatoriskt');
  }

  // Kontrollera att lådan finns
  const box = await getBox(input.boxId);
  if (!box) {
    throw new Error('Låda hittades inte');
  }

  const db = getDatabase();
  const result = db.runSync(
    'INSERT INTO items (name, description, space_id, zone_id, box_id) VALUES (?, ?, ?, ?, ?)',
    [
      input.name.trim(),
      input.description || '',
      input.spaceId,
      input.zoneId || null,
      input.boxId,
    ]
  );

  const item = await getItem(result.lastInsertRowId);
  if (!item) {
    throw new Error('Kunde inte skapa objekt');
  }

  return item;
}

export async function getItem(id: number): Promise<Item | null> {
  const db = getDatabase();
  const result = db.getFirstSync<{
    id: number;
    name: string;
    description: string;
    space_id: number;
    zone_id: number | null;
    box_id: number;
    created_at?: string;
    updated_at?: string;
  }>('SELECT * FROM items WHERE id = ?', [id]);

  if (!result) {
    return null;
  }

  // Hämta taggar
  const tags = db.getAllSync<{ id: number; name: string }>(
    `SELECT t.id, t.name FROM tags t
     INNER JOIN item_tags it ON t.id = it.tag_id
     WHERE it.item_id = ?`,
    [id]
  );

  return {
    id: result.id,
    name: result.name,
    description: result.description,
    spaceId: result.space_id,
    zoneId: result.zone_id,
    boxId: result.box_id,
    tags: (tags || []).map((t) => ({ id: t.id, name: t.name })),
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
}

export async function getItemsByBox(boxId: number): Promise<Item[]> {
  const db = getDatabase();
  const results = db.getAllSync<{
    id: number;
    name: string;
    description: string;
    space_id: number;
    zone_id: number | null;
    box_id: number;
    created_at?: string;
    updated_at?: string;
  }>('SELECT * FROM items WHERE box_id = ? ORDER BY name ASC', [boxId]);

  // Hämta taggar för alla objekt
  const items = await Promise.all(
    (results || []).map(async (r) => {
      const tags = db.getAllSync<{ id: number; name: string }>(
        `SELECT t.id, t.name FROM tags t
         INNER JOIN item_tags it ON t.id = it.tag_id
         WHERE it.item_id = ?`,
        [r.id]
      );

      return {
        id: r.id,
        name: r.name,
        description: r.description,
        spaceId: r.space_id,
        zoneId: r.zone_id,
        boxId: r.box_id,
        tags: (tags || []).map((t) => ({ id: t.id, name: t.name })),
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    })
  );

  return items;
}

export async function updateItem(id: number, input: UpdateItemInput): Promise<Item | null> {
  const existing = await getItem(id);
  if (!existing) {
    throw new Error('Objekt hittades inte');
  }

  const db = getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Namn är obligatoriskt');
    }
    updates.push('name = ?');
    values.push(input.name.trim());
  }

  if (input.description !== undefined) {
    updates.push('description = ?');
    values.push(input.description || '');
  }

  if (input.spaceId !== undefined) {
    updates.push('space_id = ?');
    values.push(input.spaceId);
  }

  if (input.zoneId !== undefined) {
    updates.push('zone_id = ?');
    values.push(input.zoneId || null);
  }

  if (input.boxId !== undefined) {
    const box = await getBox(input.boxId);
    if (!box) {
      throw new Error('Låda hittades inte');
    }
    updates.push('box_id = ?');
    values.push(input.boxId);
  }

  if (updates.length === 0) {
    return existing;
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  db.runSync(`UPDATE items SET ${updates.join(', ')} WHERE id = ?`, values);

  return await getItem(id);
}

export async function deleteItem(id: number): Promise<void> {
  const existing = await getItem(id);
  if (!existing) {
    throw new Error('Objekt hittades inte');
  }

  const db = getDatabase();
  db.runSync('DELETE FROM items WHERE id = ?', [id]);
}

export async function addTagToItem(itemId: number, tagName: string): Promise<void> {
  const item = await getItem(itemId);
  if (!item) {
    throw new Error('Objekt hittades inte');
  }

  if (!tagName || tagName.trim().length === 0) {
    throw new Error('Tagg-namn är obligatoriskt');
  }

  const db = getDatabase();
  const normalizedTagName = tagName.trim().toLowerCase();

  // Hitta eller skapa tagg
  let tag = db.getFirstSync<{ id: number }>(
    'SELECT id FROM tags WHERE LOWER(name) = ?',
    [normalizedTagName]
  );

  if (!tag) {
    const result = db.runSync('INSERT INTO tags (name) VALUES (?)', [normalizedTagName]);
    tag = { id: result.lastInsertRowId };
  }

  // Lägg till tagg till objekt om den inte redan finns
  const existing = db.getFirstSync<{ item_id: number }>(
    'SELECT item_id FROM item_tags WHERE item_id = ? AND tag_id = ?',
    [itemId, tag.id]
  );

  if (!existing) {
    db.runSync('INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)', [itemId, tag.id]);
  }
}

export async function removeTagFromItem(itemId: number, tagName: string): Promise<void> {
  const item = await getItem(itemId);
  if (!item) {
    throw new Error('Objekt hittades inte');
  }

  const db = getDatabase();
  const normalizedTagName = tagName.trim().toLowerCase();

  const tag = db.getFirstSync<{ id: number }>(
    'SELECT id FROM tags WHERE LOWER(name) = ?',
    [normalizedTagName]
  );

  if (tag) {
    db.runSync('DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?', [itemId, tag.id]);
  }
}

