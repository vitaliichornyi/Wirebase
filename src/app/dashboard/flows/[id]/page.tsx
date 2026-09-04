import { FlowCanvas, getFlow } from '@/features/flows';
import { Empty } from '@/shared/ui/empty';

export default async function FlowCanvasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await getFlow({ flowId: id });

  if (error || !data) {
    return <Empty type="error" />;
  }

  return <FlowCanvas initial={data} />;
}
