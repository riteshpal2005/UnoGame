import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../../constants/colors';

interface CreateRoomTabProps {
  nickname: string;
  onCreate: () => void;
}

export function CreateRoomTab({ nickname, onCreate }: CreateRoomTabProps) {
  return (
    <View style={styles.centerContent}>
        <View style={styles.illustrationCircle}>
            <MaterialCommunityIcons name="crown" size={40} color={THEME.primary} />
        </View>
        <Text style={styles.helperText}>Host a Game</Text>
        <Text style={styles.helperSubText}>Get a code to share with friends.</Text>
        <TouchableOpacity 
            style={[styles.btnPrimary, !nickname && styles.btnDisabled]} 
            onPress={onCreate}
            disabled={!nickname}
        >
            <Text style={styles.btnText}>Generate Room</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    alignItems: 'center',
    width: '100%',
  },
  illustrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  helperText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 4,
  },
  helperSubText: {
    fontSize: 14,
    color: THEME.textDim,
    textAlign: 'center',
    marginBottom: 24,
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
  btnDisabled: { opacity: 0.5 },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
