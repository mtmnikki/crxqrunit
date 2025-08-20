import React from 'react';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface GradientStrokeIconProps {
  name: string;
  size?: number;
  className?: string;
}

// Type assertion to access lucide icons dynamically
const icons = LucideIcons as Record<string, LucideIcon>;

export default function GradientStrokeIcon({ 
  name, 
  size = 24, 
  className = '' 
}: GradientStrokeIconProps) {
  // Normalize the icon name (capitalize first letter)
  const iconName = name.charAt(0).toUpperCase() + name.slice(1);
  const IconComponent = icons[iconName] || icons.FileText;

  return (
    <IconComponent 
      size={size} 
      className={`text-white ${className}`}
    />
  );
}