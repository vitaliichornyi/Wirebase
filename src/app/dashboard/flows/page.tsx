import { listFlows } from '@/actions/flows';

import { FlowsView } from './flows-view';

export default async function FlowsPage() {
  const { data: flows, error } = await listFlows();

  if (error) {
    console.error(error);
  }

  return (
    <div className="p-6">
      <FlowsView initialFlows={flows ?? []} />
    </div>
  );
}
