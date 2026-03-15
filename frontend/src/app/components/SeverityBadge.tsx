import { SeverityLevel } from '../types';

interface SeverityBadgeProps {
  severity: SeverityLevel;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const severityConfig = {
    low: {
      label: 'Low',
      className: 'bg-[#B8BB26] text-[#282828]',
    },
    medium: {
      label: 'Medium',
      className: 'bg-[#FABD2F] text-[#282828]',
    },
    high: {
      label: 'High',
      className: 'bg-[#FE8019] text-[#282828]',
    },
    critical: {
      label: 'Critical',
      className: 'bg-[#FB4934] text-[#282828]',
    },
  };

  const config = severityConfig[severity];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs ${config.className}`}
    >
      {config.label}
    </span>
  );
}
