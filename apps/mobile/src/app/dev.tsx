import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const screens = [
  { name: 'Lobby (index)', path: '/' },
  { name: 'Game', path: '/game' },
  { name: 'Settings', path: '/settings' },
  { name: 'Card Test', path: '/cardTest' },
  { name: 'Test', path: '/test' },
  { name: 'Old Index', path: '/old_index' },
];

export default function DevScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      <ScrollView contentContainerClassName="flex-grow p-6">
        <Text className="text-3xl font-bold text-white mb-6 text-center">
          Dev Menu
        </Text>
        <Text className="text-gray-400 mb-8 text-center">
          Navigate to all screens for UI testing
        </Text>

        <View className="space-y-4">
          {screens.map((screen, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(screen.path as any)}
              className="bg-surface/80 p-4 rounded-2xl border border-white/10 active:opacity-80 flex-row justify-between items-center"
            >
              <Text className="text-white text-lg font-semibold">{screen.name}</Text>
              <Text className="text-primary text-sm font-medium">{screen.path}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
