import { Spinner } from '@/shared/ui/primitives/spinner';

export default function FlowCanvasLoading() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background">
      <Spinner className="size-6" />
    </div>
  );
}
