// Auth Types
export type {
  AuthUser,
  AuthSession,
  LoginCredentials,
  SignInResponse,
  RefreshResponse,
  AuthState,
  AuthContextValue,
  UserRole,
} from './types';

// Auth API
export {
  configureAuthApi,
  getApiBaseUrl,
  signIn,
  signOut,
  refreshSession,
  getSession,
  getMe,
  checkSession,
} from './api';

// Auth Context
export { AuthProvider, useAuthContext, AuthContext } from './AuthContext';
export type { AuthProviderProps } from './AuthContext';

// Auth Hooks
export {
  useAuth,
  useUser,
  useIsAuthenticated,
  useRequireAuth,
  useRequireRole,
  useHasPermission,
  useHasRole,
  useUserDisplayName,
  useUserInitials,
} from './hooks';
