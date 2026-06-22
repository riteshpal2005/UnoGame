import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';

interface AuthInputProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
  error?: string;
}

export function AuthInput({ label, isPassword = false, error, ...props }: AuthInputProps) {
  const { activeThemeClass } = useTheme();
  const isDark = activeThemeClass !== '';
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4">
      <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </Text>
      <View className="relative justify-center">
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          className={`w-full h-14 px-4 rounded-2xl border ${
            error 
              ? 'border-red-500 bg-red-500/5' 
              : isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-200 text-gray-900'
          } ${isPassword ? 'pr-12' : ''} ${error ? (isDark ? 'text-white' : 'text-gray-900') : ''}`}
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        />
        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 h-full justify-center"
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={22} 
              color={isDark ? '#9CA3AF' : '#6B7280'} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{error}</Text>
      ) : null}
    </View>
  );
}
