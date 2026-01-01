// API Types matching backend DTOs

export interface SpaceDto {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpaceDto {
  name: string;
}

export interface UpdateSpaceDto {
  name: string;
}

export interface BoxDto {
  id: number;
  name: string;
  spaceId: number;
  zoneId?: number;
  labelCode?: string;
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoxDto {
  name: string;
  spaceId: number;
  zoneId?: number;
  imageUri?: string;
}

export interface UpdateBoxDto {
  name?: string;
  spaceId?: number;
  zoneId?: number;
  imageUri?: string;
}

export interface MoveBoxDto {
  newSpaceId: number;
  newZoneId?: number;
}

export interface TagDto {
  id: number;
  name: string;
}

export interface ItemDto {
  id: number;
  name: string;
  description: string;
  spaceId: number;
  zoneId?: number;
  boxId: number;
  tags: TagDto[];
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemDto {
  name: string;
  description: string;
  spaceId: number;
  zoneId?: number;
  boxId: number;
  imageUri?: string;
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  spaceId?: number;
  zoneId?: number;
  boxId?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  userId?: string;
}


