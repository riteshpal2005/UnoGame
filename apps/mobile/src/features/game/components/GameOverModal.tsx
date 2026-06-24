import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../../constants/colors';
import { Player } from '../../../types';

interface GameOverModalProps {
  winner: Player | null;
  mode: string;
  onExit: () => void;
  onRestartGame: () => void;
}

export function GameOverModal({ winner, mode, onExit, onRestartGame }: GameOverModalProps) {
  return (
    <Modal visible={!!winner} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.winnerCard}>
                <View style={styles.trophyCircle}>
                    <MaterialCommunityIcons name="trophy" size={50} color="#fbbf24" />
                </View>
                <Text style={styles.winnerText}>GAME OVER</Text>
                <Text style={styles.winnerName}>{winner?.name} Wins!</Text>

                <View style={styles.winnerButtons}>
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: THEME.card }]} onPress={onExit}>
                        <Text style={[styles.modalBtnText, { color: THEME.textDim }]}>Exit</Text>
                    </TouchableOpacity>

                    {(mode === 'host' || mode === 'bot') && (
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: THEME.success }]} onPress={onRestartGame}>
                            <Text style={[styles.modalBtnText, { color: 'white' }]}>Play Again</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  winnerCard: {
    width: '80%',
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    elevation: 20
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  winnerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.textDim,
    letterSpacing: 2
  },
  winnerName: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.text,
    marginVertical: 10
  },
  winnerButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  modalBtnText: {
    fontWeight: 'bold',
    fontSize: 14
  },
});
