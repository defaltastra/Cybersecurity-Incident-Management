import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor, iconBgColor }: StatsCardProps) {
  return (
    <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6 hover:border-[#B8BB26] transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#D5C4A1] text-sm mb-1">{title}</p>
          <p className="text-[#EBDBB2] text-3xl">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
