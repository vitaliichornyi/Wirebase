export type FlowStatus = 'active' | 'inactive' | 'archived';

export interface Flow {
  id: string;
  userId: string;
  name: string;
  status: FlowStatus;
  createdAt: string;
  updatedAt: string;
}
