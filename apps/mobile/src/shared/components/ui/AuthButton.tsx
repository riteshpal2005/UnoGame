import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthButtonProps extends TouchableOpacityProps {
  label: string;
  isLoading?: boolean;
  variant?: 'primary' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  isDark?: boolean;
}

export function AuthButton({ 
  label, 
  isLoading = false, 
  variant = 'primary', 
  icon,
  isDark = false,
  className,
  ...props 
}: AuthButtonProps) {
  
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        {...props}
        activeOpacity={0.8}
        className={`w-full h-14 rounded-2xl flex-row items-center justify-center border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
        } ${props.disabled ? 'opacity-70' : ''} ${className || ''}`}
      >
        {isLoading ? (
          <ActivityIndicator color={isDark ? 'white' : 'black'} />
        ) : (
          <View className="flex-row items-center">
            {icon && <Ionicons name={icon} size={22} color={isDark ? 'white' : 'black'} />}
            <Text className={`font-semibold text-lg ${icon ? 'ml-3' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      {...props}
      activeOpacity={0.8}
      className={`w-full h-14 rounded-2xl items-center justify-center shadow-lg ${
        isLoading || props.disabled 
          ? 'bg-blue-400 shadow-transparent' 
          : 'bg-blue-600 shadow-blue-600/30'
      } ${className || ''}`}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <View className="flex-row items-center">
          {icon && <Ionicons name={icon} size={22} color="white" />}
          <Text className={`text-white font-semibold text-lg ${icon ? 'ml-3' : ''}`}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
