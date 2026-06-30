'use client';

import * as React from 'react';
import { cn } from '../utils/cn';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  size?: number | string;
}

const Icon = React.forwardRef<SVGElement, IconProps>(
  ({ icon: IconComponent, size = 16, className, ...props }, _ref) => {
    return (
      <IconComponent
        className={cn('inline-block flex-shrink-0', className)}
        size={size}
        {...props}
      />
    );
  },
);
Icon.displayName = 'Icon';

export { Icon };
