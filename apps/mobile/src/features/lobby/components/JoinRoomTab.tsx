import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../../../constants/colors';

interface JoinRoomTabProps {
  nickname: string;
  roomCode: string;
  setRoomCode: (code: string) => void;
  onJoin: () => void;
  onPaste: () => void;
}

export function JoinRoomTab({ nickname, roomCode, setRoomCode, onJoin, onPaste }: JoinRoomTabProps) {
  return (
    <View style={styles.centerContent}>
        <Text style={styles.helperText}>Join a Room</Text>
        <Text style={styles.helperSubText}>Enter the 5-char code.</Text>
        
        <View style={styles.codeInputWrapper}>
            <TextInput 
                style={styles.codeInput} 
                placeholder="CODE" 
                placeholderTextColor={THEME.textDim} 
                maxLength={5} 
                autoCapitalize="characters" 
                value={roomCode} 
                onChangeText={(t) => setRoomCode(t.toUpperCase())} 
            />
            <TouchableOpacity style={styles.pasteBtn} onPress={onPaste}>
                <Text style={styles.pasteText}>PASTE</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity 
            style={[styles.btnPrimary, (!nickname || roomCode.length !== 5) && styles.btnDisabled, { backgroundColor: THEME.secondary }]} 
            onPress={onJoin}
            disabled={!nickname || roomCode.length !== 5}
        >
            <Text style={styles.btnText}>Join Game</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    alignItems: 'center',
    width: '100%',
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
  codeInputWrapper: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  codeInput: {
    flex: 1,
    backgroundColor: THEME.input,
    color: THEME.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 14,
  },
  pasteBtn: {
    backgroundColor: THEME.card,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  pasteText: {
    color: THEME.secondary,
    fontWeight: 'bold',
    fontSize: 12,
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
