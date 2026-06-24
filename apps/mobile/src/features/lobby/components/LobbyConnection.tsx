import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../../constants/colors';

interface LobbyConnectionProps {
  ipAddress: string;
  setIpAddress: (ip: string) => void;
  isLoading: boolean;
  onConnect: () => void;
  onBack: () => void;
}

export function LobbyConnection({
  ipAddress,
  setIpAddress,
  isLoading,
  onConnect,
  onBack
}: LobbyConnectionProps) {
  return (
    <View style={styles.fullWidth}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={THEME.textDim} />
            <Text style={styles.backText}>Back to Menu</Text>
        </TouchableOpacity>

        <View style={styles.card}>
            <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="server-network" size={32} color={THEME.primary} />
            </View>
            <Text style={styles.headerTitle}>Connect to Server</Text>
            <Text style={styles.headerSubtitle}>Enter IP from 'node server.js' terminal</Text>
            
            <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>IP ADDRESS</Text>
                <TextInput 
                    style={styles.input} 
                    value={ipAddress} 
                    onChangeText={setIpAddress} 
                    keyboardType="numeric" 
                    placeholder="192.168.x.x"
                    placeholderTextColor={THEME.textDim}
                />
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={onConnect}>
                {isLoading ? <ActivityIndicator color="white"/> : <Text style={styles.btnText}>Connect</Text>}
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 4,
  },
  backText: {
    color: THEME.textDim,
    fontSize: 16,
  },
  card: {
    width: '100%',
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.textDim,
    marginTop: 4,
    marginBottom: 24,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textDim,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    backgroundColor: THEME.input,
    paddingVertical: 16,
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
