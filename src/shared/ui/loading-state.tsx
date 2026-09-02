import { Spinner } from './primitives/spinner';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full w-full py-24 px-12">
      <Spinner className="size-6" />
    </div>
  );
}
