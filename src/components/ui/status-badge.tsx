'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type AmpelStatus = 'grün' | 'gelb' | 'rot';

interface StatusBadgeProps {
  status: AmpelStatus;
  label: string;
  className?: string;
}

const statusConfig = {
  grün: {
    className: 'bg-green-100 text-green-800 border-green-200',
    label: 'Gut'
  },
  gelb: {
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Achtung'
  },
  rot: {
    className: 'bg-red-100 text-red-800 border-red-200',
    label: 'Kritisch'
  }
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {label}: {config.label}
    </Badge>
  );
}