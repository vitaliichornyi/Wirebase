import { Spinner } from '@/shared/ui/primitives/spinner';

export default function FlowsLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <Spinner className="size-6" />
    </div>
  );
}
