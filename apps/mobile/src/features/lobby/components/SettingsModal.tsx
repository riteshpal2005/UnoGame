import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { THEME } from '../../../constants/colors';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  customRules: string[];
  setCustomRules: (rules: string[]) => void;
}

export function SettingsModal({ visible, onClose, customRules, setCustomRules }: SettingsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Custom Rules</Text>
                <Text style={styles.modalSubtitle}>Edit the text for Custom Wild Cards</Text>

                {customRules.map((rule, index) => (
                    <View key={index} style={{ width: '100%', marginBottom: 12 }}>
                        <Text style={{ color: THEME.textDim, fontSize: 12, marginBottom: 4 }}>Rule #{index + 1}</Text>
                        <TextInput
                            style={[styles.input, { paddingVertical: 12 }]}
                            value={rule}
                            onChangeText={(text) => {
                                const newRules = [...customRules];
                                newRules[index] = text;
                                setCustomRules(newRules);
                            }}
                            placeholder={`Rule ${index + 1}`}
                            placeholderTextColor={THEME.textDim}
                        />
                    </View>
                ))}

                <TouchableOpacity 
                    style={[styles.btnPrimary, { marginTop: 20 }]} 
                    onPress={onClose}
                >
                    <Text style={styles.btnText}>Save & Close</Text>
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
  input: {
    width: '100%',
    backgroundColor: THEME.input,
    paddingHorizontal: 20,
    borderRadius: 16,
    color: THEME.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: THEME.border,
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
});
