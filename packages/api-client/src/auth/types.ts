/**
 * Auth Types for ClubVantage
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'TENANT_ADMIN'
  | 'MANAGER'
  | 'STAFF'
  | 'MEMBER';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  clubId?: string | null;
  club?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  avatarUrl?: string | null;
  isMember?: boolean;
  supabaseId?: string;
}

export interface AuthSession {
  user: AuthUser | null;
  expiresAt: number;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: AuthUser;
  expiresIn: number;
  expiresAt: number;
}

export interface RefreshResponse {
  expiresIn: number;
  expiresAt: number;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

export interface AuthContextValue extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkSession: () => Promise<AuthUser | null>;
  /** Extend the session - resets inactivity timer and refreshes tokens */
  extendSession: () => Promise<void>;
  /** Get milliseconds until session timeout due to inactivity */
  getTimeUntilTimeout: () => number;
}
