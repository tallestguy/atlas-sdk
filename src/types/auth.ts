/**
 * User authentication types
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export interface User {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

