export type UserRole = 'Admin' | 'Analyst';
export type IncidentType = 'phishing' | 'malware' | 'intrusion' | 'data breach';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  incidentType: IncidentType;
  severity: SeverityLevel;
  status: IncidentStatus;
  reportedByUserId: number;
  reportedByName: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  incidentType: IncidentType;
  severity: SeverityLevel;
  status: IncidentStatus;
  reportedByUserId: number;
}

export interface UpdateIncidentRequest {
  title: string;
  description: string;
  incidentType: IncidentType;
  severity: SeverityLevel;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  newPassword?: string;
}
