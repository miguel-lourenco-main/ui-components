import { Trans as TransComponent } from 'react-i18next/TransWithoutContext';

export function Trans({ className, ...props }: React.ComponentProps<typeof TransComponent> & { className?: string }) {
  return <TransComponent {...props} className={className} />;
}
