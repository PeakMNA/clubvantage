export interface JwtPayload {
  sub: string; // userId (from our DB) or supabaseId
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  supabaseId?: string; // Supabase user ID
  isMember?: boolean; // True if authenticated via member portal
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
