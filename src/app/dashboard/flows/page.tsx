import { FlowsTable, listFlows } from '@/features/flows';
import { Alert } from '@/shared/ui/alert';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export default async function FlowsPage() {
  const { data: flows, error } = await listFlows();

  if (error || !flows) {
    console.error(error);
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 py-24 text-center">
        <Alert message={GENERIC_ERROR_MESSAGE} />
      </div>
    );
  }

  return <FlowsTable initialFlows={flows} />;
}
