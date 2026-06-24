import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../../constants/colors';

interface GameControlsProps {
  unoCalled: boolean;
  isMyTurn: boolean;
  onUnoButton: () => void;
  selectedCardIds: string[];
  onPlay: () => void;
  hasDrawnCard: boolean;
  onPassTurn: () => void;
  onDrawCard: () => void;
}

export function GameControls({
  unoCalled,
  isMyTurn,
  onUnoButton,
  selectedCardIds,
  onPlay,
  hasDrawnCard,
  onPassTurn,
  onDrawCard
}: GameControlsProps) {
  return (
    <View style={styles.controlsRow}>
        <TouchableOpacity
            style={[styles.unoBtn, unoCalled ? styles.unoBtnActive : styles.unoBtnInactive]}
            disabled={!isMyTurn}
            onPress={onUnoButton}
        >
            <Text style={styles.unoBtnText}>{unoCalled ? "UNO!" : "UNO"}</Text>
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
            {selectedCardIds.length > 0 ? (
                <TouchableOpacity style={styles.playBtn} onPress={onPlay}>
                    <Text style={styles.playBtnText}>PLAY ({selectedCardIds.length})</Text>
                    <MaterialCommunityIcons name="arrow-up-bold" size={20} color="white" />
                </TouchableOpacity>
            ) : (
                hasDrawnCard ? (
                    <TouchableOpacity style={styles.passBtn} disabled={!isMyTurn} onPress={onPassTurn}>
                        <Text style={styles.btnLabel}>Pass Turn</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.drawBtn} disabled={!isMyTurn} onPress={onDrawCard}>
                        <MaterialCommunityIcons name="plus" size={20} color="white" />
                        <Text style={styles.btnLabel}>Draw Card</Text>
                    </TouchableOpacity>
                )
            )}
        </View>

        <View style={{ width: 50 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  unoBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  unoBtnActive: {
    backgroundColor: THEME.primary,
    borderColor: 'white',
  },
  unoBtnInactive: {
    backgroundColor: THEME.card,
    borderColor: THEME.border,
    opacity: 0.5,
  },
  unoBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  playBtn: {
    backgroundColor: THEME.success,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: THEME.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  playBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  drawBtn: {
    backgroundColor: THEME.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passBtn: {
    backgroundColor: THEME.warning,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  btnLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
