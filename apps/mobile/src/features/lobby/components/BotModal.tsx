import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../../constants/colors';

interface BotModalProps {
  visible: boolean;
  onClose: () => void;
  onStartBotGame: (count: number) => void;
}

export function BotModal({ visible, onClose, onStartBotGame }: BotModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Players</Text>
                <Text style={styles.modalSubtitle}>Including you</Text>
                
                <View style={styles.botCountGrid}>
                    {[2, 3, 4, 5].map((num) => (
                        <TouchableOpacity 
                            key={num} 
                            style={styles.countBtn} 
                            onPress={() => onStartBotGame(num)}
                        >
                            <Text style={styles.countBtnText}>{num}</Text>
                            <MaterialCommunityIcons name="account" size={16} color={THEME.textDim} />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={styles.closeBtnText}>Cancel</Text>
                </TouchableOpacity>
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
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: THEME.textDim,
    marginBottom: 24,
  },
  botCountGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  countBtn: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: THEME.input,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.secondary,
  },
  countBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 2,
  },
  closeBtn: {
    padding: 10,
  },
  closeBtnText: {
    color: THEME.textDim,
    fontSize: 16,
  },
});
