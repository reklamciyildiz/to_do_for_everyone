'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ProgressProps = {
  value?: number;
  max?: number;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
        {...props}
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
