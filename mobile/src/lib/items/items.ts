// TODO: Implementera Items CRUD funktionalitet
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
  throw new Error('Not implemented');
}

export async function getItem(id: number): Promise<Item | null> {
  throw new Error('Not implemented');
}

export async function updateItem(id: number, input: UpdateItemInput): Promise<Item | null> {
  throw new Error('Not implemented');
}

export async function deleteItem(id: number): Promise<void> {
  throw new Error('Not implemented');
}

export async function addTagToItem(itemId: number, tagName: string): Promise<void> {
  throw new Error('Not implemented');
}

export async function removeTagFromItem(itemId: number, tagName: string): Promise<void> {
  throw new Error('Not implemented');
}

