export function formatLinkStatusMarker(
  isArchived: boolean,
  isDisabled: boolean,
): string {
  const markers = [isArchived && 'Archived', isDisabled && 'Disabled'].filter(
    Boolean,
  );
  return markers.length > 0 ? ` (${markers.join(', ')})` : '';
}
