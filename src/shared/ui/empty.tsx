import {
  Empty as EmptyPrimitive,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './primitives/empty';
import { Button } from './button';
import { FolderIcon } from './icons/folder-icon';

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

interface EmptyProps {
  type: EmptyStateType;
  entity?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  isActionSubmitting?: boolean;
}

export function Empty({
  type,
  entity = 'item',
  title,
  description,
  actionLabel,
  onAction,
  isActionSubmitting,
}: EmptyProps) {
  const content = EMPTY_STATE_MESSAGES[type](entity);
  const resolvedTitle = title ?? content.title;
  const resolvedDescription = description ?? content.description;
  const resolvedActionLabel = actionLabel ?? content.actionLabel;

  return (
    <EmptyPrimitive className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderIcon />
        </EmptyMedia>
        <EmptyTitle className="label-large">{resolvedTitle}</EmptyTitle>
        <EmptyDescription className="body-medium">
          {resolvedDescription}
        </EmptyDescription>
      </EmptyHeader>
      {resolvedActionLabel && onAction && (
        <EmptyContent>
          <Button
            variant="outline"
            onClick={onAction}
            isSubmitting={isActionSubmitting}
          >
            {resolvedActionLabel}
          </Button>
        </EmptyContent>
      )}
    </EmptyPrimitive>
  );
}
