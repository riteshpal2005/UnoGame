import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../../constants/colors';

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
    <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.iconBtn}>
            <MaterialCommunityIcons name="logout" size={20} color={THEME.textDim} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.roomBadge} onPress={onCopyRoomCode} disabled={isBotMode}>
            <MaterialCommunityIcons name={isBotMode ? "robot" : "wifi"} size={14} color={THEME.success} />
            <Text style={styles.roomText}>{isBotMode ? 'Single Player' : roomCode}</Text>
            {!isBotMode && <MaterialCommunityIcons name="content-copy" size={12} color={THEME.textDim} />}
        </TouchableOpacity>

        {(mode === 'host' || mode === 'bot') ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={styles.iconBtn} onPress={onDebugWinHand}>
                    <MaterialCommunityIcons name="lightning-bolt" size={20} color="#fbbf24" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconBtn} onPress={onRestartGame}>
                    <MaterialCommunityIcons name="refresh" size={20} color={THEME.textDim} />
                </TouchableOpacity>
            </View>
        ) : (
            <View style={{ width: 32 }} />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
    zIndex: 10
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.input,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  roomText: {
    color: THEME.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
