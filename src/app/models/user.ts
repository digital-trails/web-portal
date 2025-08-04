export interface User {
  id: string;
  super_admin: boolean;
  admin?: {
    studies: { [studyCode: string]: AdminStudy };
  };
  user?: {
    studies: { [studyCode: string]: UserStudy };
  };
}

export interface AdminStudy {
   dashboard?: number;
   repo?: string;
   iframeUrl?: string;
   hasOura: boolean;
   super_admin: boolean;
}

export interface UserStudy {
   state: ProtocolState;
   lastUpdate: string;
}

export enum ProtocolState {
  Running,
  Stopped,
  Paused
}


