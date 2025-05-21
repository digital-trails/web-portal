
export interface ClientPrincipal {
  userId?: string;
  claims?: UserClaims[];
  userDetails?: string;
  roles?: string[];
}

export interface UserClaims {
  email?: string;
}