import * as RadixAvatar from '@radix-ui/react-avatar';
import { forwardRef } from 'react';

import { cn } from '../../lib/cn';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const;

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt = '', fallback, size = 'md', className },
  ref,
) {
  return (
    <RadixAvatar.Root
      ref={ref}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-brand-100 font-medium text-brand-700',
        sizeMap[size],
        className,
      )}
    >
      {src && <RadixAvatar.Image src={src} alt={alt} className="h-full w-full object-cover" />}
      <RadixAvatar.Fallback delayMs={300}>{fallback}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
});

Avatar.displayName = 'Avatar';
