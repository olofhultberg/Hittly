import { getDatabase } from '../db/database';

export interface Space {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export async function createSpace(name: string): Promise<Space> {
  if (!name || name.trim().length === 0) {
    throw new Error('Namn är obligatoriskt');
  }

  if (name.length > 100) {
    throw new Error('Namn får inte vara längre än 100 tecken');
  }

  const db = getDatabase();
  const result = db.runSync(
    'INSERT INTO spaces (name) VALUES (?)',
    [name.trim()]
  );

  const space = await getSpace(result.lastInsertRowId);
  if (!space) {
    throw new Error('Kunde inte skapa utrymme');
  }

  return space;
}

export async function getSpace(id: number): Promise<Space | null> {
  const db = getDatabase();
  const result = db.getFirstSync<Space>(
    'SELECT * FROM spaces WHERE id = ?',
    [id]
  );

  return result || null;
}

export async function getAllSpaces(): Promise<Space[]> {
  const db = getDatabase();
  const result = db.getAllSync<Space>('SELECT * FROM spaces ORDER BY name ASC');

  return result || [];
}

export async function updateSpace(id: number, name: string): Promise<Space | null> {
  if (!name || name.trim().length === 0) {
    throw new Error('Namn är obligatoriskt');
  }

  if (name.length > 100) {
    throw new Error('Namn får inte vara längre än 100 tecken');
  }

  const existing = await getSpace(id);
  if (!existing) {
    throw new Error('Utrymme hittades inte');
  }

  const db = getDatabase();
  db.runSync(
    'UPDATE spaces SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name.trim(), id]
  );

  return await getSpace(id);
}

export async function deleteSpace(id: number): Promise<void> {
  const existing = await getSpace(id);
  if (!existing) {
    throw new Error('Utrymme hittades inte');
  }

  // Kontrollera om utrymmet har lådor
  const db = getDatabase();
  const boxes = db.getAllSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM boxes WHERE space_id = ?',
    [id]
  );

  if (boxes && boxes.length > 0 && boxes[0].count > 0) {
    throw new Error('Kan inte ta bort utrymme med lådor');
  }

  db.runSync('DELETE FROM spaces WHERE id = ?', [id]);
}
