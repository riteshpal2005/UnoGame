import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface GameHeaderProps {
  mode: string;
  roomCode: string;
  isBotMode: boolean;
  onExit: () => void;
  onCopyRoomCode: () => void;
  onDebugWinHand: () => void;
  onRestartGame: () => void;
}

export function GameHeader({
  mode,
  roomCode,
  isBotMode,
  onExit,
  onCopyRoomCode,
  onDebugWinHand,
  onRestartGame
}: GameHeaderProps) {
  return (
    <View className="flex-row justify-between items-center px-5 pt-3 pb-2 z-10">
        <TouchableOpacity onPress={onExit} className="w-10 h-10 rounded-full bg-surface justify-center items-center border border-border">
            <MaterialCommunityIcons name="logout" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center bg-background py-2 px-4 rounded-full gap-2 border border-border shadow-md" onPress={onCopyRoomCode} disabled={isBotMode}>
            <MaterialCommunityIcons name={isBotMode ? "robot" : "wifi"} size={14} color="#10B981" />
            <Text className="text-text-primary font-bold text-sm">{isBotMode ? 'Single Player' : roomCode}</Text>
            {!isBotMode && <MaterialCommunityIcons name="content-copy" size={12} color="#94A3B8" />}
        </TouchableOpacity>

        {(mode === 'host' || mode === 'bot') ? (
            <View className="flex-row gap-2">
                <TouchableOpacity className="w-10 h-10 rounded-full bg-surface justify-center items-center border border-border" onPress={onDebugWinHand}>
                    <MaterialCommunityIcons name="lightning-bolt" size={20} color="#fbbf24" />
                </TouchableOpacity>

                <TouchableOpacity className="w-10 h-10 rounded-full bg-surface justify-center items-center border border-border" onPress={onRestartGame}>
                    <MaterialCommunityIcons name="refresh" size={20} color="#94A3B8" />
                </TouchableOpacity>
            </View>
        ) : (
            <View style={{ width: 32 }} />
        )}
    </View>
  );
}

