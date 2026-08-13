export interface Edge {
  id: string;
  flowId: string;
  userId: string;
  fromNodeId: string;
  fromSlot: string;
  toNodeId: string;
  toSlot: string;
  createdAt: string;
}

export interface EdgeRow {
  id: string;
  flow_id: string;
  user_id: string;
  from_node_id: string;
  from_slot: string;
  to_node_id: string;
  to_slot: string;
  created_at: string;
}
