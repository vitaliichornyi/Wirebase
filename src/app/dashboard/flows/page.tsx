import { FlowsTable, listFlows } from '@/features/flows';
import { Empty } from '@/shared/ui/empty';

export default async function FlowsPage() {
  const { data, error } = await listFlows();

  if (error || !data) {
    return <Empty type="error" />;
  }

  return <FlowsTable initialFlows={data} />;
}
