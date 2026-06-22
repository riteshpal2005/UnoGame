import React from 'react';
import { View, ViewProps } from 'react-native';

interface IconWrapperProps extends ViewProps {
  children: React.ReactNode;
  colorClass?: string; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function IconWrapper({
  children,
  colorClass = 'bg-brand-primary/20',
  size = 'md',
  className = '',
  ...props
}: IconWrapperProps) {

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-10 h-10';
      case 'lg': return 'w-16 h-16';
      default: return 'w-10 h-10';
    }
  };

  return (
    <View 
      className={`rounded-full items-center justify-center ${getSizeStyles()} ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
