import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../../constants/colors';

interface LobbyMenuProps {
  onOpenSettings: () => void;
  onOpenBotModal: () => void;
  onMultiplayerClick: () => void;
  onDebugCardTest: () => void;
}

export function LobbyMenu({ 
  onOpenSettings, 
  onOpenBotModal, 
  onMultiplayerClick, 
  onDebugCardTest 
}: LobbyMenuProps) {
  return (
    <View style={styles.centerContainer}>
      <View style={styles.settingsRow}>
        <TouchableOpacity onPress={onOpenSettings} style={styles.settingsBtn}>
          <MaterialCommunityIcons name="cog" size={28} color={THEME.textDim} />
        </TouchableOpacity>
      </View>

      <Text style={styles.logoText}>UNO</Text>
      
      <TouchableOpacity 
        style={styles.bigButton} 
        onPress={onOpenBotModal}
        activeOpacity={0.8}
      >
        <View style={styles.bigButtonContent}>
           <View style={[styles.miniIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <MaterialCommunityIcons name="robot" size={24} color={THEME.secondary} />
           </View>
           <View>
             <Text style={styles.bigButtonTitle}>Single Player</Text>
             <Text style={styles.bigButtonDesc}>Practice against Bots</Text>
           </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={THEME.textDim} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.bigButton} 
        onPress={onMultiplayerClick}
        activeOpacity={0.8}
      >
        <View style={styles.bigButtonContent}>
           <View style={[styles.miniIconCircle, { backgroundColor: 'rgba(225, 29, 72, 0.1)' }]}>
                <MaterialCommunityIcons name="gamepad-variant" size={24} color={THEME.primary} />
           </View>
           <View>
             <Text style={styles.bigButtonTitle}>Multiplayer</Text>
             <Text style={styles.bigButtonDesc}>Connect to LAN Server</Text>
           </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={THEME.textDim} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.debugBtn} 
        onPress={onDebugCardTest}
      >
        <MaterialCommunityIcons name="test-tube" size={16} color={THEME.textDim} />
        <Text style={styles.debugText}>Playground</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  settingsRow: { 
    width: '100%', 
    alignItems: 'flex-end', 
    marginBottom: 10 
  },
  settingsBtn: { 
    padding: 10 
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: THEME.text,
    letterSpacing: 4,
    marginBottom: 40,
    textShadowColor: 'rgba(225, 29, 72, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  bigButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.card,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    marginTop: 8,
  },
  bigButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  miniIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  bigButtonDesc: {
    fontSize: 13,
    color: THEME.textDim,
  },
  debugBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 15,
    marginTop: 20,
    opacity: 0.6,
  },
  debugText: {
    color: THEME.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
});
