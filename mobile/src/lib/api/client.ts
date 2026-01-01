import API_CONFIG from './config';

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.timeout = API_CONFIG.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          errors: errorData.errors,
        };
        throw error;
      }

      // Om response är tom (204 No Content), returnera tomt objekt
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw { message: 'Request timeout', status: 408 } as ApiError;
        }
        if (error.message.includes('Network request failed') || error.message.includes('Failed to connect')) {
          const platform = typeof navigator !== 'undefined' ? 'web' : 'mobile';
          const helpText = platform === 'web' 
            ? 'Kontrollera att backend körs på http://localhost:5048'
            : 'Kontrollera att backend körs och att din IP-adress är korrekt i config.ts. Se API_SETUP.md för instruktioner.';
          throw { message: `Kunde inte ansluta till servern. ${helpText}`, status: 0 } as ApiError;
        }
        throw { message: error.message } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();


