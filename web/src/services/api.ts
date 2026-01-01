import type {
  SpaceDto,
  CreateSpaceDto,
  UpdateSpaceDto,
  BoxDto,
  CreateBoxDto,
  UpdateBoxDto,
  MoveBoxDto,
  ItemDto,
  CreateItemDto,
  UpdateItemDto,
  TagDto,
  LoginDto,
  RegisterDto,
  AuthResponse,
} from '../types/api';

// In development, Vite proxy handles /api requests
// In production, set VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Important for cookie-based auth
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    let errorData: any = null;
    let errorMessages: string[] = [];

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
        
        // Handle ASP.NET Core ModelState format
        // Format: { "": ["error1", "error2"], "field": ["error3"] }
        if (errorData && typeof errorData === 'object') {
          const allErrors: string[] = [];
          for (const key in errorData) {
            if (Array.isArray(errorData[key])) {
              allErrors.push(...errorData[key]);
            } else if (typeof errorData[key] === 'string') {
              allErrors.push(errorData[key]);
            }
          }
          if (allErrors.length > 0) {
            errorMessages = allErrors;
            errorMessage = allErrors.join('. ');
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else {
        errorMessage = await response.text() || errorMessage;
      }
    } catch {
      // Ignore parsing errors
    }

    const error = new ApiError(errorMessage, response.status, errorData);
    if (errorMessages.length > 0) {
      (error as any).messages = errorMessages;
    }
    throw error;
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return {} as T;
  }

  return response.json();
}

// Auth API
export const authApi = {
  async login(data: LoginDto): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/api/Auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/api/Auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/api/Auth/logout', {
      method: 'POST',
    });
  },
};

// Spaces API
export const spacesApi = {
  async getAll(): Promise<SpaceDto[]> {
    return fetchApi<SpaceDto[]>('/api/Spaces');
  },

  async getById(id: number): Promise<SpaceDto> {
    return fetchApi<SpaceDto>(`/api/Spaces/${id}`);
  },

  async create(data: CreateSpaceDto): Promise<SpaceDto> {
    return fetchApi<SpaceDto>('/api/Spaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: UpdateSpaceDto): Promise<void> {
    return fetchApi<void>(`/api/Spaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchApi<void>(`/api/Spaces/${id}`, {
      method: 'DELETE',
    });
  },
};

// Boxes API
export const boxesApi = {
  async getAll(): Promise<BoxDto[]> {
    return fetchApi<BoxDto[]>('/api/Boxes');
  },

  async getById(id: number): Promise<BoxDto> {
    return fetchApi<BoxDto>(`/api/Boxes/${id}`);
  },

  async getBySpace(spaceId: number): Promise<BoxDto[]> {
    return fetchApi<BoxDto[]>(`/api/Boxes/space/${spaceId}`);
  },

  async create(data: CreateBoxDto): Promise<BoxDto> {
    return fetchApi<BoxDto>('/api/Boxes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: UpdateBoxDto): Promise<void> {
    return fetchApi<void>(`/api/Boxes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchApi<void>(`/api/Boxes/${id}`, {
      method: 'DELETE',
    });
  },

  async move(id: number, data: MoveBoxDto): Promise<void> {
    return fetchApi<void>(`/api/Boxes/${id}/move`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Items API
export const itemsApi = {
  async getAll(): Promise<ItemDto[]> {
    return fetchApi<ItemDto[]>('/api/Items');
  },

  async getById(id: number): Promise<ItemDto> {
    return fetchApi<ItemDto>(`/api/Items/${id}`);
  },

  async getByBox(boxId: number): Promise<ItemDto[]> {
    return fetchApi<ItemDto[]>(`/api/Items/box/${boxId}`);
  },

  async create(data: CreateItemDto): Promise<ItemDto> {
    return fetchApi<ItemDto>('/api/Items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: UpdateItemDto): Promise<void> {
    return fetchApi<void>(`/api/Items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchApi<void>(`/api/Items/${id}`, {
      method: 'DELETE',
    });
  },

  async addTag(id: number, tagName: string): Promise<void> {
    return fetchApi<void>(`/api/Items/${id}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tagName),
    });
  },

  async removeTag(id: number, tagName: string): Promise<void> {
    return fetchApi<void>(`/api/Items/${id}/tags?tagName=${encodeURIComponent(tagName)}`, {
      method: 'DELETE',
    });
  },
};

// Tags API
export const tagsApi = {
  async getAll(): Promise<TagDto[]> {
    return fetchApi<TagDto[]>('/api/Tags');
  },

  async getById(id: number): Promise<TagDto> {
    return fetchApi<TagDto>(`/api/Tags/${id}`);
  },
};

export { ApiError };


