import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CreateRoomTabProps {
  nickname: string;
  onCreate: () => void;
}

export function CreateRoomTab({ nickname, onCreate }: CreateRoomTabProps) {
  return (
    <View className="items-center w-full">
        <View className="w-24 h-24 rounded-full bg-text-primary items-center justify-center mb-5 shadow-lg">
            <MaterialCommunityIcons name="crown" size={48} className="text-background" />
        </View>
        <Text className="text-lg font-bold text-text-primary mb-1">Host a Game</Text>
        <Text className="text-sm text-text-secondary text-center mb-6">Get a code to share with friends.</Text>
        <TouchableOpacity 
            className={`w-full bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/30 ${!nickname ? 'opacity-50' : ''}`}
            onPress={onCreate}
            disabled={!nickname}
        >
            <Text className="text-white text-base font-bold tracking-wide">Generate Room</Text>
        </TouchableOpacity>
    </View>
  );
}
