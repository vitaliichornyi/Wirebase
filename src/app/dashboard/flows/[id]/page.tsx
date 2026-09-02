import { FlowCanvas, getFlow } from '@/features/flows';
import { EmptyState } from '@/shared/ui/empty-state';

export default async function FlowCanvasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await getFlow({ flowId: id });

  if (error || !data) {
    return <EmptyState type="error" />;
  }

  return <FlowCanvas initial={data} />;
}
