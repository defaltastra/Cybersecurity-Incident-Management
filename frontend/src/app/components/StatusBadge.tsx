import type { IncidentStatus } from '../types';

interface StatusBadgeProps {
  status: IncidentStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    open: {
      label: 'Open',
      className: 'bg-[#FB4934] text-[#282828]',
    },
    investigating: {
      label: 'Investigating',
      className: 'bg-[#FABD2F] text-[#282828]',
    },
    resolved: {
      label: 'Resolved',
      className: 'bg-[#B8BB26] text-[#282828]',
    },
  };

  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : '';
  const config = statusConfig[normalizedStatus as IncidentStatus] ?? {
    label: normalizedStatus || 'Unknown',
    className: 'bg-[#928374] text-[#282828]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs ${config.className}`}
    >
      {config.label}
    </span>
  );
}
