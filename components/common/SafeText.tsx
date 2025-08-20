import React from 'react';

interface SafeTextProps {
  value: string | undefined | null;
  fallback?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Safe text component that handles undefined/null values gracefully
 */
export default function SafeText({ 
  value, 
  fallback = '', 
  className,
  as: Component = 'span' 
}: SafeTextProps) {
  const safeValue = value ?? fallback;
  
  return (
    <Component className={className}>
      {safeValue}
    </Component>
  );
}