import { cn } from '@/utils';
import { WarningSVG } from '@/components/svg/warning';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Error = ({
  message,
  className,
}: {
  message: string;
  className?: string;
}) => (
  <Alert
    variant="warning"
    className={cn(
      'text-sm leading-4 mb-6 flex space-x-4 items-center p-4',
      className
    )}
  >
    <WarningSVG />
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);
