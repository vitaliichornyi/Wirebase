export interface Click {
  id: string;
  inputNodeId: string;
  flowId: string;
  userId: string;
  country: string | null;
  userAgent: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  createdAt: string;
}
