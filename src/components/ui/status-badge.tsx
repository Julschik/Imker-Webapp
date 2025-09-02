import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: 'gut' | 'mittel' | 'schlecht'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = {
    gut: 'bg-green-100 text-green-800 border-green-200',
    mittel: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    schlecht: 'bg-red-100 text-red-800 border-red-200'
  }

  const labels = {
    gut: 'Gut',
    mittel: 'Mittel',
    schlecht: 'Schlecht'
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
      colors[status],
      className
    )}>
      {labels[status]}
    </span>
  )
}