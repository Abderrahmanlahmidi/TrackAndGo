import axios from 'axios';
import { Platform } from 'react-native';

function getApiHost(): string {
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname || 'localhost';
  }

  return 'localhost';
}

const DRIVERS_API_URL = `http://${getApiHost()}:3000/drivers`;

export type Driver = {
  id: string;
  email: string;
  password: string;
  name: string;
  role?: string;
  createdAt: string;
};

type RegisterDriverInput = {
  name: string;
  email: string;
  password: string;
};

const driversApi = axios.create({
  baseURL: DRIVERS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function loginDriver(email: string, password: string): Promise<Driver | null> {
  const response = await driversApi.get<Driver[]>('', {
    params: { email, password },
  });

  return response.data[0] ?? null;
}

export async function findDriverByEmail(email: string): Promise<Driver | null> {
  const response = await driversApi.get<Driver[]>('', {
    params: { email },
  });

  return response.data[0] ?? null;
}

export async function registerDriver(input: RegisterDriverInput): Promise<Driver> {
  const response = await driversApi.post<Driver>('', {
    ...input,
    role: 'driver',
    createdAt: new Date().toISOString(),
  });

  return response.data;
}

export function formatApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Unexpected error happened. Please try again.';
  }

  if (typeof error.response?.data === 'string' && error.response.data.trim().length > 0) {
    return error.response.data;
  }

  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Could not connect to the API server.';
}
