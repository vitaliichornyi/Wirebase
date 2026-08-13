export type InputNodeStatus = 'enabled' | 'disabled';

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
