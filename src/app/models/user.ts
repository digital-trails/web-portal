
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