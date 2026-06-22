import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className = '',
  padding = 'md',
  ...props
}: CardProps) {

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none': return 'p-0';
      case 'sm': return 'p-3';
      case 'md': return 'p-4';
      case 'lg': return 'p-6';
      default: return 'p-4';
    }
  };

  return (
    <View 
      className={`bg-surface rounded-2xl border border-bordercolor ${getPaddingStyles()} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
