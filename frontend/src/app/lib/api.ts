import type {
  Incident,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  IncidentStatus,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '../types';

export function getApiBaseUrl(): string {
  return '/api';
}

const BASE = getApiBaseUrl();
const STORAGE_KEY = 'cim_user';

function userIdHeader(): Record<string, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const user = JSON.parse(stored) as { id: number };
    return { 'X-User-Id': String(user.id) };
  } catch {
    return {};
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getIncidents(): Promise<Incident[]> {
  const res = await fetch(`${BASE}/incidents`, {
    headers: userIdHeader(),
  });
  return handleResponse<Incident[]>(res);
}

export async function getIncident(id: number): Promise<Incident> {
  const res = await fetch(`${BASE}/incidents/${id}`, {
    headers: userIdHeader(),
  });
  return handleResponse<Incident>(res);
}

export async function createIncident(req: CreateIncidentRequest): Promise<Incident> {
  const res = await fetch(`${BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...userIdHeader() },
    body: JSON.stringify(req),
  });
  return handleResponse<Incident>(res);
}

export async function updateIncidentStatus(
  id: number,
  status: IncidentStatus,
): Promise<Incident> {
  const res = await fetch(`${BASE}/incidents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...userIdHeader() },
    body: JSON.stringify({ status }),
  });
  const body = await handleResponse<{ incident: Incident }>(res);
  return body.incident;
}

export async function updateIncident(id: number, req: UpdateIncidentRequest): Promise<Incident> {
  const res = await fetch(`${BASE}/incidents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...userIdHeader() },
    body: JSON.stringify(req),
  });
  const body = await handleResponse<{ incident: Incident }>(res);
  return body.incident;
}

export async function deleteIncident(id: number): Promise<void> {
  const res = await fetch(`${BASE}/incidents/${id}`, {
    method: 'DELETE',
    headers: userIdHeader(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function loginUser(req: LoginRequest): Promise<User> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const body = await handleResponse<{ user: User }>(res);
  return body.user;
}

export async function registerUser(req: RegisterRequest): Promise<User> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const body = await handleResponse<{ user: User }>(res);
  return body.user;
}

export async function updateProfile(id: number, req: UpdateProfileRequest): Promise<User> {
  const res = await fetch(`${BASE}/auth/profile/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const body = await handleResponse<{ user: User }>(res);
  return body.user;
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${BASE}/users`, {
    headers: userIdHeader(),
  });
  return handleResponse<User[]>(res);
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: 'DELETE',
    headers: userIdHeader(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
}
