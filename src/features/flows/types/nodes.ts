export const INPUT_NODE_STATUSES = ['enabled', 'disabled'] as const;

export type InputNodeStatus = (typeof INPUT_NODE_STATUSES)[number];

export interface InputNode {
  id: string;
  flowId: string;
  userId: string;
  type: 'input';
  name: string;
  positionX: number;
  positionY: number;
  slug: string;
  status: InputNodeStatus;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OutputNode {
  id: string;
  flowId: string;
  userId: string;
  type: 'output';
  name: string;
  positionX: number;
  positionY: number;
  destinationUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type FlowNode = InputNode | OutputNode;

export interface NodeRow {
  id: string;
  flow_id: string;
  user_id: string;
  type: 'input' | 'output';
  name: string;
  position_x: number;
  position_y: number;
  slug: string | null;
  input_status: InputNodeStatus | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  destination_url: string | null;
  created_at: string;
  updated_at: string;
}
