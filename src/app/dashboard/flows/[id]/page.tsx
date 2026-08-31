import { notFound } from 'next/navigation';

import { FlowCanvas, getFlow } from '@/features/flows';
import { Alert } from '@/shared/ui/alert';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export default async function FlowCanvasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await getFlow({ flowId: id });

  if (error === 'Flow not found') {
    notFound();
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Alert message={GENERIC_ERROR_MESSAGE} />
      </div>
    );
  }

  return <FlowCanvas initial={data} />;
}
