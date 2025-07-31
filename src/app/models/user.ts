export interface User {
  id: string;
  admin?: {
    studies: { [studyCode: string]: AdminStudy };
  };
  user?: {
    studies: { [studyCode: string]: UserStudy };
  };
  super_admin?: boolean;
}

export interface AdminStudy {
   dashboard?: number;
   repo?: string;
   iframeUrl?: string;
   hasOura: boolean;
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


