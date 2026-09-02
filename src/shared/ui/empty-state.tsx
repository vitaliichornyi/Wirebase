import { Headline } from './headline';
import { Button } from './button';

type EmptyStateType = 'no-data' | 'no-results' | 'error';

interface EmptyStateContent {
  title: string;
  description: string;
  actionLabel?: string;
}

const EMPTY_STATE_MESSAGES: Record<
  EmptyStateType,
  (entity: string) => EmptyStateContent
> = {
  'no-data': (entity) => ({
    title: `No ${entity} yet`,
    description: `Create your first ${entity} to get started.`,
    actionLabel: `New ${entity}`,
  }),
  'no-results': () => ({
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
  }),
  error: () => ({
    title: 'Something went wrong',
    description: "We couldn't load this data. Please try again.",
  }),
};

interface EmptyStateProps {
  type: EmptyStateType;
  entity?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  isActionSubmitting?: boolean;
}

export function EmptyState({
  type,
  entity = 'item',
  title,
  description,
  actionLabel,
  onAction,
  isActionSubmitting,
}: EmptyStateProps) {
  const content = EMPTY_STATE_MESSAGES[type](entity);
  const resolvedTitle = title ?? content.title;
  const resolvedDescription = description ?? content.description;
  const resolvedActionLabel = actionLabel ?? content.actionLabel;

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full w-full py-24 px-12 text-center">
      <div className="flex flex-col gap-2">
        <Headline as="h1" variant="headline" size="medium">
          {resolvedTitle}
        </Headline>
        <p className="body-large text-muted-foreground">
          {resolvedDescription}
        </p>
      </div>
      {resolvedActionLabel && onAction && (
        <Button
          variant="outline"
          onClick={onAction}
          isSubmitting={isActionSubmitting}
        >
          {resolvedActionLabel}
        </Button>
      )}
    </div>
  );
}
