import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LobbyRoomProps {
  roomCode: string;
  players: string[];
  isHost: boolean;
  onCopyCode: () => void;
  onStartGame: () => void;
  onLeave: () => void;
}

export function LobbyRoom({
  roomCode,
  players,
  isHost,
  onCopyCode,
  onStartGame,
  onLeave
}: LobbyRoomProps) {
  return (
    <View className="w-full">
        <Text className="text-[32px] font-black text-text-primary mb-6">Lobby</Text>
        
        <View className="w-full bg-input rounded-2xl p-5 items-center border border-primary mb-8">
            <Text className="text-primary text-xs font-bold tracking-[2px] mb-2">ROOM CODE</Text>
            <TouchableOpacity className="flex-row items-center gap-3" onPress={onCopyCode}>
                <Text className="text-text-primary text-4xl font-black tracking-[6px]">{roomCode}</Text>
                <MaterialCommunityIcons name="content-copy" size={24} className="text-primary" />
            </TouchableOpacity>
        </View>

        <View className="w-full mb-8">
            <Text className="text-text-secondary text-sm font-bold mb-3 ml-1">PLAYERS ({players.length})</Text>
            {players.map((p, i) => (
                <View key={i} className="flex-row items-center bg-surface p-3 rounded-xl mb-2 border border-border">
                    <View className="w-9 h-9 rounded-full bg-input justify-center items-center mr-3">
                        <Text className="text-primary font-bold text-base">{p.charAt(0)}</Text>
                    </View>
                    <Text className="text-text-primary text-base font-semibold flex-1">{p}</Text>
                    {i === 0 && <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />}
                </View>
            ))}
        </View>

        <View className="w-full gap-4">
            {isHost ? (
                <TouchableOpacity className="w-full bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/30" onPress={onStartGame}>
                    <Text className="text-white text-base font-bold tracking-wide">Start Game</Text>
                </TouchableOpacity>
            ) : (
                <View className="flex-row justify-center items-center p-4 gap-3">
                     <ActivityIndicator size="small" color="#94A3B8" />
                     <Text className="text-text-secondary text-sm italic">Waiting for host...</Text>
                </View>
            )}
            
            <TouchableOpacity className="w-full items-center p-4" onPress={onLeave}>
                <Text className="text-text-secondary text-sm">Leave Room</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}
