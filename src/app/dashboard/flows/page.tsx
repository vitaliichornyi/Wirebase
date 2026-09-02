import { FlowsTable, listFlows } from '@/features/flows';
import { EmptyState } from '@/shared/ui/empty-state';

export default async function FlowsPage() {
  const { data, error } = await listFlows();

  if (error || !data) {
    return <EmptyState type="error" />;
  }

  return <FlowsTable initialFlows={data} />;
}
