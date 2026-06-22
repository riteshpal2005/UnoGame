import React from 'react';
import { Text, Pressable, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ComponentProps<typeof Pressable> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  textClassName = '',
  icon,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  
  const scale = useSharedValue(1);

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    if (onPressOut) onPressOut(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const getVariantStyles = (): string => {
    switch (variant) {
      case 'primary': return 'bg-brand-primary';
      case 'secondary': return 'bg-surface border border-bordercolor';
      case 'danger': return 'bg-red-500';
      case 'outline': return 'bg-transparent border border-brand-primary';
      case 'ghost': return 'bg-transparent';
      default: return 'bg-brand-primary';
    }
  };

  const getTextStyles = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger': return 'text-white';
      case 'secondary': return 'text-primary';
      case 'outline':
      case 'ghost': return 'text-brand-primary';
      default: return 'text-white';
    }
  };

  const getSizeStyles = (): string => {
    switch (size) {
      case 'sm': return 'h-10 px-4 rounded-lg';
      case 'md': return 'h-14 px-6 rounded-xl';
      case 'lg': return 'h-16 px-8 rounded-2xl';
      default: return 'h-14 px-6 rounded-xl';
    }
  };

  const activeOpacity = disabled || loading ? 'opacity-50' : 'active:opacity-80';

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center ${getVariantStyles()} ${getSizeStyles()} ${activeOpacity} ${className}`}
      style={animatedStyle}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : '#2563eb'} />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Text className={`font-bold text-center ${size === 'sm' ? 'text-sm' : 'text-lg'} ${icon ? 'ml-2' : ''} ${getTextStyles()} ${textClassName}`}>
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}
