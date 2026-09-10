export const DEMO_ACCOUNT_USER_ID = 'f0acea95-1915-484a-bac7-1c1df55b78b0';

export const DEMO_ACCOUNT_RESTRICTION_MESSAGE =
  'This is a demo account. Creating, editing, and deleting are disabled.';

import { DashboardIcon } from '@/shared/ui/icons/dashboard-icon';
import { FlowsIcon } from '@/shared/ui/icons/flows-icon';

export const NAV_ITEMS: {
  label: string;
  href: string;
  icon: React.ComponentType;
}[] = [
  { label: 'Dashboards', href: '/dashboard', icon: DashboardIcon },
  { label: 'Flows', href: '/dashboard/flows', icon: FlowsIcon },
];

export const FLOW_CANVAS_PATTERN = /^\/dashboard\/flows\/[^/]+$/;
