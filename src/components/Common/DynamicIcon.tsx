import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  // Map or fallback
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Folder;
  return <IconComponent className={className} size={size} />;
};
