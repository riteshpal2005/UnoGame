import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface JoinRoomTabProps {
  nickname: string;
  roomCode: string;
  setRoomCode: (code: string) => void;
  onJoin: () => void;
  onPaste: () => void;
}

export function JoinRoomTab({ nickname, roomCode, setRoomCode, onJoin }: JoinRoomTabProps) {
  return (
    <View className="items-center w-full">
        <View className="w-24 h-24 rounded-full bg-text-primary items-center justify-center mb-5 shadow-lg">
            <MaterialCommunityIcons name="account-group" size={48} className="text-background" />
        </View>
        <Text className="text-lg font-bold text-text-primary mb-1">Join a Game</Text>
        <Text className="text-sm text-text-secondary text-center mb-6">Enter the 4-digit room code.</Text>
        
        <View className="w-full mb-5">
            <Text className="text-xs font-bold text-text-secondary mb-2 ml-1 tracking-wider">ROOM CODE</Text>
            <TextInput 
                className="w-full bg-input py-4 px-5 rounded-2xl text-text-primary text-2xl font-black tracking-[10px] text-center border border-border"
                value={roomCode} 
                onChangeText={(text) => setRoomCode(text.toUpperCase())} 
                maxLength={4}
                autoCapitalize="characters"
                placeholder="XXXX"
                placeholderTextColor="rgba(148, 163, 184, 0.5)"
            />
        </View>

        <TouchableOpacity 
            className={`w-full bg-secondary py-4 rounded-2xl items-center shadow-lg shadow-secondary/30 ${(!nickname || roomCode.length < 4) ? 'opacity-50' : ''}`}
            onPress={onJoin}
            disabled={!nickname || roomCode.length < 4}
        >
            <Text className="text-white text-base font-bold tracking-wide">Join Game</Text>
        </TouchableOpacity>
    </View>
  );
}
