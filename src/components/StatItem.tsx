import React from 'react';

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}

export default function StatItem({ icon, label, value, className = '' }: StatItemProps) {
  return (
    <div className={`w-full flex flex-row items-center text-center text-white/80 gap-3 ${className}`}>
      <div className="text-[#FF8C00] pl-8">
        {icon}
      </div>
      <div className="flex flex-col text-lg  items-start">
        <div className="text-white/50 text-sm">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}