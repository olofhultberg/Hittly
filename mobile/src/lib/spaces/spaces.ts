import { apiClient, ApiError } from '../api/client';

export interface Space {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SpaceDto {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateSpaceDto {
  name: string;
}

interface UpdateSpaceDto {
  name: string;
}

export async function createSpace(name: string): Promise<Space> {
  if (!name || name.trim().length === 0) {
    throw new Error('Namn är obligatoriskt');
  }

  if (name.length > 100) {
    throw new Error('Namn får inte vara längre än 100 tecken');
  }

  try {
    const response = await apiClient.post<SpaceDto>('/api/Spaces', {
      name: name.trim(),
    } as CreateSpaceDto);

    return {
      id: response.id,
      name: response.name,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.message || 'Kunde inte skapa utrymme');
  }
}

export async function getSpace(id: number): Promise<Space | null> {
  try {
    const response = await apiClient.get<SpaceDto>(`/api/Spaces/${id}`);
    return {
      id: response.id,
      name: response.name,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      return null;
    }
    throw new Error(apiError.message || 'Kunde inte hämta utrymme');
  }
}

export async function getAllSpaces(): Promise<Space[]> {
  try {
    const response = await apiClient.get<SpaceDto[]>('/api/Spaces');
    return response.map((s) => ({
      id: s.id,
      name: s.name,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.message || 'Kunde inte hämta utrymmen');
  }
}

export async function updateSpace(id: number, name: string): Promise<Space | null> {
  if (!name || name.trim().length === 0) {
    throw new Error('Namn är obligatoriskt');
  }

  if (name.length > 100) {
    throw new Error('Namn får inte vara längre än 100 tecken');
  }

  try {
    await apiClient.put(`/api/Spaces/${id}`, {
      name: name.trim(),
    } as UpdateSpaceDto);

    return await getSpace(id);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Utrymme hittades inte');
    }
    throw new Error(apiError.message || 'Kunde inte uppdatera utrymme');
  }
}

export async function deleteSpace(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/Spaces/${id}`);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Utrymme hittades inte');
    }
    if (apiError.status === 400) {
      throw new Error(apiError.message || 'Kan inte ta bort utrymme med lådor');
    }
    throw new Error(apiError.message || 'Kunde inte ta bort utrymme');
  }
}
