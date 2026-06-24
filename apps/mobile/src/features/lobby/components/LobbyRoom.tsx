import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../../constants/colors';

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
    <View style={styles.fullWidth}>
        <Text style={styles.screenTitle}>Lobby</Text>
        
        <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>ROOM CODE</Text>
            <TouchableOpacity style={styles.codeRow} onPress={onCopyCode}>
                <Text style={styles.codeText}>{roomCode}</Text>
                <MaterialCommunityIcons name="content-copy" size={24} color={THEME.primary} />
            </TouchableOpacity>
        </View>

        <View style={styles.playerSection}>
            <Text style={styles.sectionHeader}>PLAYERS ({players.length})</Text>
            {players.map((p, i) => (
                <View key={i} style={styles.playerRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{p.charAt(0)}</Text>
                    </View>
                    <Text style={styles.playerText}>{p}</Text>
                    {i === 0 && <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />}
                </View>
            ))}
        </View>

        <View style={styles.footerAction}>
            {isHost ? (
                <TouchableOpacity style={styles.btnPrimary} onPress={onStartGame}>
                    <Text style={styles.btnText}>Start Game</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.waitingBadge}>
                     <ActivityIndicator size="small" color={THEME.textDim} />
                     <Text style={styles.waitingText}>Waiting for host...</Text>
                </View>
            )}
            
            <TouchableOpacity style={styles.btnGhost} onPress={onLeave}>
                <Text style={styles.btnGhostText}>Leave Room</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  screenTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME.text,
    marginBottom: 24,
  },
  codeCard: {
    width: '100%',
    backgroundColor: THEME.input,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.primary,
    marginBottom: 30,
  },
  codeLabel: {
    color: THEME.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeText: {
    color: THEME.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
  },
  sectionHeader: {
    color: THEME.textDim,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  playerSection: {
    width: '100%',
    marginBottom: 30,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: THEME.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerText: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  footerAction: {
    width: '100%',
    gap: 16,
  },
  waitingBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  waitingText: {
    color: THEME.textDim,
    fontSize: 14,
    fontStyle: 'italic',
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: THEME.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  btnGhost: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
  },
  btnGhostText: {
    color: THEME.textDim,
    fontSize: 14,
  },
});
