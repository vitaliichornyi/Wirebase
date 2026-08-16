import type { ReactNode } from 'react';

import { Headline } from '@/components/common/headline';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between h-19 px-6">
      <Headline as="h1" variant="medium">
        {title}
      </Headline>
      {children}
    </div>
  );
}
