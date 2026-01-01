import { apiClient, ApiError } from '../api/client';

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
  imageUri?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateItemInput {
  name: string;
  description: string;
  spaceId: number;
  zoneId?: number | null;
  boxId: number;
  imageUri?: string | null;
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  spaceId?: number;
  zoneId?: number | null;
  boxId?: number;
}

interface TagDto {
  id: number;
  name: string;
}

interface ItemDto {
  id: number;
  name: string;
  description: string;
  spaceId: number;
  zoneId?: number | null;
  boxId: number;
  tags: TagDto[];
  imageUri?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateItemDto {
  name: string;
  description: string;
  spaceId: number;
  zoneId?: number | null;
  boxId: number;
  imageUri?: string | null;
}

interface UpdateItemDto {
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

  try {
    const response = await apiClient.post<ItemDto>('/api/Items', {
      name: input.name.trim(),
      description: input.description || '',
      spaceId: input.spaceId,
      zoneId: input.zoneId || null,
      boxId: input.boxId,
      imageUri: input.imageUri || null,
    } as CreateItemDto);

    return {
      id: response.id,
      name: response.name,
      description: response.description,
      spaceId: response.spaceId,
      zoneId: response.zoneId,
      boxId: response.boxId,
      tags: response.tags || [],
      imageUri: response.imageUri,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.message || 'Kunde inte skapa objekt');
  }
}

export async function getItem(id: number): Promise<Item | null> {
  try {
    const response = await apiClient.get<ItemDto>(`/api/Items/${id}`);
    return {
      id: response.id,
      name: response.name,
      description: response.description,
      spaceId: response.spaceId,
      zoneId: response.zoneId,
      boxId: response.boxId,
      tags: response.tags || [],
      imageUri: response.imageUri,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      return null;
    }
    throw new Error(apiError.message || 'Kunde inte hämta objekt');
  }
}

export async function getItemsByBox(boxId: number): Promise<Item[]> {
  try {
    const response = await apiClient.get<ItemDto[]>(`/api/Items/box/${boxId}`);
    return response.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      spaceId: i.spaceId,
      zoneId: i.zoneId,
      boxId: i.boxId,
      tags: i.tags || [],
      imageUri: i.imageUri,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.message || 'Kunde inte hämta objekt');
  }
}

export async function updateItem(id: number, input: UpdateItemInput): Promise<Item | null> {
  if (input.name !== undefined && (!input.name || input.name.trim().length === 0)) {
    throw new Error('Namn är obligatoriskt');
  }

  try {
    await apiClient.put(`/api/Items/${id}`, {
      name: input.name,
      description: input.description,
      spaceId: input.spaceId,
      zoneId: input.zoneId,
      boxId: input.boxId,
    } as UpdateItemDto);

    return await getItem(id);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Objekt hittades inte');
    }
    throw new Error(apiError.message || 'Kunde inte uppdatera objekt');
  }
}

export async function deleteItem(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/Items/${id}`);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Objekt hittades inte');
    }
    throw new Error(apiError.message || 'Kunde inte ta bort objekt');
  }
}

export async function addTagToItem(itemId: number, tagName: string): Promise<void> {
  if (!tagName || tagName.trim().length === 0) {
    throw new Error('Tagg-namn är obligatoriskt');
  }

  try {
    await apiClient.post(`/api/Items/${itemId}/tags`, tagName.trim());
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Objekt hittades inte');
    }
    throw new Error(apiError.message || 'Kunde inte lägga till tagg');
  }
}

export async function removeTagFromItem(itemId: number, tagName: string): Promise<void> {
  if (!tagName || tagName.trim().length === 0) {
    throw new Error('Tagg-namn är obligatoriskt');
  }

  try {
    await apiClient.delete(`/api/Items/${itemId}/tags?tagName=${encodeURIComponent(tagName.trim())}`);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Objekt hittades inte');
    }
    throw new Error(apiError.message || 'Kunde inte ta bort tagg');
  }
}

export async function getItemCount(): Promise<number> {
  try {
    const items = await apiClient.get<ItemDto[]>('/api/Items');
    return items.length;
  } catch (error) {
    return 0;
  }
}

