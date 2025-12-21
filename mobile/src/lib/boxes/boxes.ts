import { getDatabase } from '../db/database';
import { getSpace } from '../spaces/spaces';

export interface Box {
  id: number;
  name: string;
  spaceId: number;
  zoneId?: number | null;
  labelCode: string;
  imageUri?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBoxInput {
  name: string;
  spaceId: number;
  zoneId?: number | null;
  imageUri?: string | null;
}

export interface UpdateBoxInput {
  name?: string;
  spaceId?: number;
  zoneId?: number | null;
}

function generateLabelCode(): string {
  // Generera unik kod (t.ex. "BOX-ABC123")
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BOX-${randomPart}`;
}

export async function createBox(input: CreateBoxInput): Promise<Box> {
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('Namn är obligatoriskt');
  }

  // Kontrollera att utrymmet finns
  const space = await getSpace(input.spaceId);
  if (!space) {
    throw new Error('Utrymme hittades inte');
  }

  const db = getDatabase();
  let labelCode = generateLabelCode();

  // Se till att label_code är unik
  let attempts = 0;
  while (attempts < 10) {
    const existing = db.getFirstSync<{ id: number }>(
      'SELECT id FROM boxes WHERE label_code = ?',
      [labelCode]
    );
    if (!existing) {
      break;
    }
    labelCode = generateLabelCode();
    attempts++;
  }

  const result = db.runSync(
    'INSERT INTO boxes (name, space_id, zone_id, label_code) VALUES (?, ?, ?, ?)',
    [input.name.trim(), input.spaceId, input.zoneId || null, labelCode]
  );

  const boxId = result.lastInsertRowId;

  // Spara bild om den finns
  if (input.imageUri) {
    db.runSync(
      'INSERT INTO box_images (box_id, uri) VALUES (?, ?)',
      [boxId, input.imageUri]
    );
  }

  const box = await getBox(boxId);
  if (!box) {
    throw new Error('Kunde inte skapa låda');
  }

  return box;
}

export async function getBox(id: number): Promise<Box | null> {
  const db = getDatabase();
  const result = db.getFirstSync<{
    id: number;
    name: string;
    space_id: number;
    zone_id: number | null;
    label_code: string;
    created_at?: string;
    updated_at?: string;
  }>('SELECT * FROM boxes WHERE id = ?', [id]);

  if (!result) {
    return null;
  }

  // Hämta bild-URI om den finns
  const imageResult = db.getFirstSync<{ uri: string }>(
    'SELECT uri FROM box_images WHERE box_id = ? ORDER BY created_at DESC LIMIT 1',
    [id]
  );

  return {
    id: result.id,
    name: result.name,
    spaceId: result.space_id,
    zoneId: result.zone_id,
    labelCode: result.label_code,
    imageUri: imageResult?.uri || null,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
}

export async function getBoxesBySpace(spaceId: number): Promise<Box[]> {
  const db = getDatabase();
  const results = db.getAllSync<{
    id: number;
    name: string;
    space_id: number;
    zone_id: number | null;
    label_code: string;
    created_at?: string;
    updated_at?: string;
  }>('SELECT * FROM boxes WHERE space_id = ? ORDER BY name ASC', [spaceId]);

  // Hämta bilder för alla lådor
  const boxes = await Promise.all(
    (results || []).map(async (r) => {
      const imageResult = db.getFirstSync<{ uri: string }>(
        'SELECT uri FROM box_images WHERE box_id = ? ORDER BY created_at DESC LIMIT 1',
        [r.id]
      );

      return {
        id: r.id,
        name: r.name,
        spaceId: r.space_id,
        zoneId: r.zone_id,
        labelCode: r.label_code,
        imageUri: imageResult?.uri || null,
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    })
  );

  return boxes;
}

export async function updateBox(id: number, input: UpdateBoxInput): Promise<Box | null> {
  const existing = await getBox(id);
  if (!existing) {
    throw new Error('Låda hittades inte');
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

  if (input.spaceId !== undefined) {
    const space = await getSpace(input.spaceId);
    if (!space) {
      throw new Error('Utrymme hittades inte');
    }
    updates.push('space_id = ?');
    values.push(input.spaceId);
  }

  if (input.zoneId !== undefined) {
    updates.push('zone_id = ?');
    values.push(input.zoneId || null);
  }

  if (updates.length === 0) {
    return existing;
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  db.runSync(
    `UPDATE boxes SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return await getBox(id);
}

export async function deleteBox(id: number): Promise<void> {
  const existing = await getBox(id);
  if (!existing) {
    throw new Error('Låda hittades inte');
  }

  const db = getDatabase();
  db.runSync('DELETE FROM boxes WHERE id = ?', [id]);
}

export async function moveBox(
  boxId: number,
  newSpaceId: number,
  newZoneId: number | null
): Promise<Box | null> {
  const box = await getBox(boxId);
  if (!box) {
    throw new Error('Låda hittades inte');
  }

  const space = await getSpace(newSpaceId);
  if (!space) {
    throw new Error('Utrymme hittades inte');
  }

  const db = getDatabase();
  
  // Flytta lådan
  db.runSync(
    'UPDATE boxes SET space_id = ?, zone_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [newSpaceId, newZoneId, boxId]
  );

  // Flytta alla objekt i lådan
  db.runSync(
    'UPDATE items SET space_id = ?, zone_id = ?, updated_at = CURRENT_TIMESTAMP WHERE box_id = ?',
    [newSpaceId, newZoneId, boxId]
  );

  return await getBox(boxId);
}
