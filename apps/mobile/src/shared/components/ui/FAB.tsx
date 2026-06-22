import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FABProps extends React.ComponentProps<typeof Pressable> {
  icon: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

export function FAB({
  icon,
  position = 'bottom-right',
  className = '',
  onPressIn,
  onPressOut,
  ...props
}: FABProps) {
  
  const scale = useSharedValue(1);

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    if (onPressOut) onPressOut(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right': return 'absolute bottom-6 right-6';
      case 'bottom-left': return 'absolute bottom-6 left-6';
      case 'bottom-center': return 'absolute bottom-6 self-center';
      default: return 'absolute bottom-6 right-6';
    }
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={`${getPositionStyles()} w-16 h-16 bg-brand-primary rounded-full items-center justify-center shadow-lg elevation-5 active:opacity-90 ${className}`}
      style={animatedStyle}
      {...props}
    >
      {icon}
    </AnimatedPressable>
  );
}
