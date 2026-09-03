import type { FlowStatus } from '@/features/flows';

export const TIME_RANGES = ['24h', '7d', '30d', 'all'] as const;

export type TimeRange = (typeof TIME_RANGES)[number];

export interface NodeRow {
  id: string;
  name: string;
  input_status: string | null;
  flow: { name?: string; status: string } | null;
}

export interface ClickRow {
  id: string;
  input_node_id: string;
  flow_id: string;
  user_id: string;
  country: string | null;
  user_agent: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  created_at: string;
}

export interface FlowFilterOption {
  id: string;
  name: string;
  status: FlowStatus;
}

export interface LinkFilterOption {
  id: string;
  name: string;
  flowName: string;
  isArchived: boolean;
  isDisabled: boolean;
}

export type CountryFilterOption = string;

export interface ClickFilterOptions {
  flows: FlowFilterOption[];
  links: LinkFilterOption[];
  countries: CountryFilterOption[];
}

export interface RankedBucket {
  label: string;
  value: number;
}

export interface ClickStats {
  totalClicks: number;
  byCountry: RankedBucket[];
  byLink: RankedBucket[];
  byReferrer: RankedBucket[];
  byCampaign: RankedBucket[];
}
