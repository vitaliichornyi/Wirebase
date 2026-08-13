export const FLOW_STATUSES = ['active', 'inactive', 'archived'] as const;

export type FlowStatus = (typeof FLOW_STATUSES)[number];

export interface Flow {
  id: string;
  userId: string;
  name: string;
  status: FlowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FlowRow {
  id: string;
  user_id: string;
  name: string;
  status: FlowStatus;
  created_at: string;
  updated_at: string;
}
