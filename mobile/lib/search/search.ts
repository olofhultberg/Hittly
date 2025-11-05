// TODO: Implementera sökfunktionalitet
import { Item } from '../items/items';

export interface SearchFilters {
  spaceId?: number;
  zoneId?: number;
  boxId?: number;
  tag?: string;
}

export async function searchItems(query: string, filters?: SearchFilters): Promise<Item[]> {
  throw new Error('Not implemented');
}

