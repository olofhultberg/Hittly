import { apiClient, ApiError } from '../api/client';

export interface Box {
  id: number;
  name: string;
  spaceId: number;
  zoneId?: number | null;
  labelCode: string;
  imageUri?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  imageUri?: string | null;
}

interface BoxDto {
  id: number;
  name: string;
  spaceId: number;
  zoneId?: number | null;
  labelCode?: string | null;
  imageUri?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateBoxDto {
  name: string;
  spaceId: number;
  zoneId?: number | null;
  imageUri?: string | null;
}

interface UpdateBoxDto {
  name?: string;
  spaceId?: number;
  zoneId?: number | null;
  imageUri?: string | null;
}

interface MoveBoxDto {
  newSpaceId: number;
  newZoneId?: number | null;
}

export async function createBox(input: CreateBoxInput): Promise<Box> {
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('Namn är obligatoriskt');
  }

  try {
    const response = await apiClient.post<BoxDto>('/api/Boxes', {
      name: input.name.trim(),
      spaceId: input.spaceId,
      zoneId: input.zoneId || null,
      imageUri: input.imageUri || null,
    } as CreateBoxDto);

    return {
      id: response.id,
      name: response.name,
      spaceId: response.spaceId,
      zoneId: response.zoneId,
      labelCode: response.labelCode || '',
      imageUri: response.imageUri,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.message || 'Kunde inte skapa låda');
  }
}

export async function getBox(id: number): Promise<Box | null> {
  try {
    const response = await apiClient.get<BoxDto>(`/api/Boxes/${id}`);
    return {
      id: response.id,
      name: response.name,
      spaceId: response.spaceId,
      zoneId: response.zoneId,
      labelCode: response.labelCode || '',
      imageUri: response.imageUri,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      return null;
    }
    throw new Error(apiError.message || 'Kunde inte hämta låda');
  }
}

export async function getBoxesBySpace(spaceId: number): Promise<Box[]> {
  try {
    const response = await apiClient.get<BoxDto[]>(`/api/Boxes/space/${spaceId}`);
    return response.map((b) => ({
      id: b.id,
      name: b.name,
      spaceId: b.spaceId,
      zoneId: b.zoneId,
      labelCode: b.labelCode || '',
      imageUri: b.imageUri,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.message || 'Kunde inte hämta lådor');
  }
}

export async function updateBox(id: number, input: UpdateBoxInput): Promise<Box | null> {
  if (input.name !== undefined && (!input.name || input.name.trim().length === 0)) {
    throw new Error('Namn är obligatoriskt');
  }

  try {
    await apiClient.put(`/api/Boxes/${id}`, {
      name: input.name,
      spaceId: input.spaceId,
      zoneId: input.zoneId,
      imageUri: input.imageUri,
    } as UpdateBoxDto);

    return await getBox(id);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Låda hittades inte');
    }
    throw new Error(apiError.message || 'Kunde inte uppdatera låda');
  }
}

export async function deleteBox(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/Boxes/${id}`);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Låda hittades inte');
    }
    throw new Error(apiError.message || 'Kunde inte ta bort låda');
  }
}

export async function moveBox(
  boxId: number,
  newSpaceId: number,
  newZoneId: number | null
): Promise<Box | null> {
  try {
    await apiClient.post(`/api/Boxes/${boxId}/move`, {
      newSpaceId,
      newZoneId,
    } as MoveBoxDto);

    return await getBox(boxId);
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.message || 'Kunde inte flytta låda');
  }
}

export async function getAllBoxes(): Promise<Box[]> {
  try {
    const response = await apiClient.get<BoxDto[]>('/api/Boxes');
    return response.map((b) => ({
      id: b.id,
      name: b.name,
      spaceId: b.spaceId,
      zoneId: b.zoneId,
      labelCode: b.labelCode || '',
      imageUri: b.imageUri,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.message || 'Kunde inte hämta lådor');
  }
}

export async function getBoxCount(): Promise<number> {
  try {
    const boxes = await getAllBoxes();
    return boxes.length;
  } catch (error) {
    return 0;
  }
}
