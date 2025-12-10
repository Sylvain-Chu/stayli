import { cn } from '@/lib/utils'

type Status = 'confirmed' | 'pending' | 'cancelled' | 'blocked'

const statusConfig: Record<Status, { label: string; className: string }> = {
  confirmed: {
    label: 'Confirmé',
    className: 'bg-[#e8f0ec] text-[#2d5a47]',
  },
  pending: {
    label: 'En attente',
    className: 'bg-[#fef3e2] text-[#b87f1a]',
  },
  cancelled: {
    label: 'Annulé',
    className: 'bg-[#fce8e8] text-[#c53030]',
  },
  blocked: {
    label: 'Bloqué',
    className: 'bg-[#f0eeeb] text-[#737373]',
  },
}

interface StatusBadgeProps {
  status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}
