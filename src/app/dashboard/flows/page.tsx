import { FlowsTable, listFlows } from '@/features/flows';
import { Empty } from '@/shared/ui/empty';

export default async function FlowsPage() {
  const { data, error } = await listFlows();

  if (error) {
    return <Empty type="error" />;
  }

  if (!data) {
    return (
      <Empty
        type="no-data"
        title="No data yet"
        description="Create your first flow to start seeing data here."
      />
    );
  }

  return <FlowsTable initialFlows={data} />;
}
