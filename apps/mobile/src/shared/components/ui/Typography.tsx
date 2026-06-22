import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  className?: string;
}

export function Heading({ children, className = '', ...props }: TypographyProps) {
  return (
    <Text 
      className={`text-2xl font-bold text-primary mb-2 ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}

export function SubText({ children, className = '', ...props }: TypographyProps) {
  return (
    <Text 
      className={`text-secondary text-sm ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Label({ children, className = '', ...props }: TypographyProps) {
  return (
    <Text 
      className={`text-secondary font-bold uppercase text-xs tracking-wider mb-2 ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}
