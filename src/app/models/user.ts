export interface UserClaims {
  email?: string;
}

export interface User {
  id: string,
  admin?: {
    studies: Map<string, string>
  },
  user?: {
    studies: string[]
  },
  super_admin: boolean
}