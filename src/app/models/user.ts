export interface User {
  id: string;
  admin?: {
    studies: { [key: string]: AdminStudy };
  };
  user?: {
    studies: { [key: string]: any };
  };
  super_admin: boolean;
}

export interface AdminStudy {
   dashboard: number;
  repo: string;
}

