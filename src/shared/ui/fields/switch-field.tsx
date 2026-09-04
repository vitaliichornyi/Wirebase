import { Field, FieldLabel } from '@/shared/ui/primitives/field';
import { Switch } from '@/shared/ui/switch';
import { cn } from '@/shared/lib/utils';

interface SwitchFieldProps {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function SwitchField({
  id,
  label,
  checked,
  disabled,
  onCheckedChange,
  className,
}: SwitchFieldProps) {
  return (
    <Field
      orientation="horizontal"
      className={cn('items-center justify-between h-10', className)}
    >
      <FieldLabel htmlFor={id} className="label-medium">
        {label}
      </FieldLabel>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </Field>
  );
}
