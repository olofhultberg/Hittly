import { getDatabase } from '../db/database';
import { Item } from '../items/items';

export interface SearchFilters {
  spaceId?: number;
  zoneId?: number;
  boxId?: number;
  tag?: string;
}

export async function searchItems(query: string, filters?: SearchFilters): Promise<Item[]> {
  const db = getDatabase();
  const searchQuery = query.trim().toLowerCase();

  // Bygg SQL-fråga
  let sql = `
    SELECT DISTINCT i.*
    FROM items i
    LEFT JOIN item_tags it ON i.id = it.item_id
    LEFT JOIN tags t ON it.tag_id = t.id
    WHERE 1=1
  `;
  const params: any[] = [];

  // Sök i namn, beskrivning eller taggar
  if (searchQuery) {
    sql += ` AND (
      LOWER(i.name) LIKE ? OR
      LOWER(i.description) LIKE ? OR
      LOWER(t.name) LIKE ?
    )`;
    const searchPattern = `%${searchQuery}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  // Filtrera på utrymme
  if (filters?.spaceId) {
    sql += ` AND i.space_id = ?`;
    params.push(filters.spaceId);
  }

  // Filtrera på zon
  if (filters?.zoneId) {
    sql += ` AND i.zone_id = ?`;
    params.push(filters.zoneId);
  }

  // Filtrera på låda
  if (filters?.boxId) {
    sql += ` AND i.box_id = ?`;
    params.push(filters.boxId);
  }

  // Filtrera på tagg
  if (filters?.tag) {
    sql += ` AND LOWER(t.name) = ?`;
    params.push(filters.tag.toLowerCase());
  }

  sql += ` ORDER BY i.name ASC`;

  const results = db.getAllSync<{
    id: number;
    name: string;
    description: string;
    space_id: number;
    zone_id: number | null;
    box_id: number;
    created_at?: string;
    updated_at?: string;
  }>(sql, params);

  // Hämta taggar och bilder för alla objekt
  const items = await Promise.all(
    (results || []).map(async (r) => {
      const tags = db.getAllSync<{ id: number; name: string }>(
        `SELECT t.id, t.name FROM tags t
         INNER JOIN item_tags it ON t.id = it.tag_id
         WHERE it.item_id = ?`,
        [r.id]
      );

      const imageResult = db.getFirstSync<{ uri: string }>(
        'SELECT uri FROM item_images WHERE item_id = ? ORDER BY created_at DESC LIMIT 1',
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
        imageUri: imageResult?.uri || null,
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    })
  );

  return items;
}

