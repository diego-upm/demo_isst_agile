export interface ApiClientOptions extends RequestInit {
  token?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? String(payload.message)
        : 'Error inesperado al llamar a la API.';
    throw new Error(message);
  }

  return payload as T;
}

export const apiClient = {
  async get<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers,
      },
    });

    return parseResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown, options: ApiClientOptions = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return parseResponse<T>(response);
  },
};
