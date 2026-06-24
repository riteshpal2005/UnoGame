import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../../constants/colors';
import { Player } from '../../../types';

interface OpponentRowProps {
  players: Player[];
  humanPlayerId?: string;
  currentPlayerIndex: number;
  onLayoutOpponent: (id: string, x: number, y: number) => void;
}

export function OpponentRow({ players, humanPlayerId, currentPlayerIndex, onLayoutOpponent }: OpponentRowProps) {
  return (
    <View style={styles.opponentsRow}>
        {players.map((p, index) => {
            if (p.id === humanPlayerId) return null;
            const isTurn = index === currentPlayerIndex;
            return (
                <View 
                    key={p.id} 
                    style={[styles.opponentContainer, isTurn && styles.activeOpponent]} 
                    onLayout={(event) => {
                        const { x, y, width, height } = event.nativeEvent.layout;
                        onLayoutOpponent(p.id, x + width / 2, y + 80);
                    }}
                >
                    <View style={[styles.avatarCircle, isTurn && { borderColor: THEME.success, borderWidth: 2 }]}>
                        <Text style={styles.avatarText}>{(p.name || 'P').charAt(0)}</Text>
                    </View>
                    <Text style={styles.opponentName} numberOfLines={1}>{p.name || 'Player'}</Text>

                    <View style={styles.cardCountBadge}>
                        <MaterialCommunityIcons name="cards-playing-outline" size={12} color={THEME.textDim} />
                        <Text style={styles.cardCountText}>{p.hand.length}</Text>
                    </View>
                </View>
            )
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  opponentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  opponentContainer: {
    alignItems: 'center',
    opacity: 0.6
  },
  activeOpponent: {
    opacity: 1,
    transform: [{ scale: 1.1 }]
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  avatarText: {
    color: THEME.text,
    fontWeight: 'bold',
    fontSize: 18,
  },
  opponentName: {
    fontSize: 11,
    color: THEME.textDim,
    maxWidth: 60,
    textAlign: 'center',
    marginBottom: 2,
  },
  cardCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  cardCountText: {
    color: THEME.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
