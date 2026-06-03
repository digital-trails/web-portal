export type ProtocolStatus = 'draft' | 'running' | 'paused' | 'completed' | 'archived';

export interface ProtocolMeta {
  id: string;
  name: string;
  status: ProtocolStatus;
  createdAt: string;
  updatedAt: string;

}

export interface Protocol extends ProtocolMeta {
  data: Record<string, unknown>;
}
