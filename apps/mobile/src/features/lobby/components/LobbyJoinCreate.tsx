import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../../constants/colors';
import { CreateRoomTab } from './CreateRoomTab';
import { JoinRoomTab } from './JoinRoomTab';

type TabState = 'create' | 'join';

interface LobbyJoinCreateProps {
  nickname: string;
  setNickname: (name: string) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  activeTab: TabState;
  setActiveTab: (tab: TabState) => void;
  onCreate: () => void;
  onJoin: () => void;
  onBack: () => void;
  onPaste: () => void;
}

export function LobbyJoinCreate({
  nickname,
  setNickname,
  roomCode,
  setRoomCode,
  activeTab,
  setActiveTab,
  onCreate,
  onJoin,
  onBack,
  onPaste
}: LobbyJoinCreateProps) {
  return (
    <View style={styles.fullWidth}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={THEME.textDim} />
            <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={[styles.card, { padding: 16, marginBottom: 20 }]}>
            <Text style={styles.inputLabel}>YOUR NICKNAME</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Maverick" 
                placeholderTextColor={THEME.textDim} 
                value={nickname} 
                onChangeText={setNickname} 
            />
        </View>

        <View style={styles.tabContainer}>
            <View style={styles.tabHeader}>
                <TouchableOpacity style={[styles.tab, activeTab === 'create' && styles.activeTab]} onPress={() => setActiveTab('create')}>
                    <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'join' && styles.activeTab]} onPress={() => setActiveTab('join')}>
                    <Text style={[styles.tabText, activeTab === 'join' && styles.activeTabText]}>Join</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabContent}>
                {activeTab === 'create' ? (
                    <CreateRoomTab nickname={nickname} onCreate={onCreate} />
                ) : (
                    <JoinRoomTab 
                        nickname={nickname}
                        roomCode={roomCode}
                        setRoomCode={setRoomCode}
                        onJoin={onJoin}
                        onPaste={onPaste}
                    />
                )}
            </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 4,
  },
  backText: { color: THEME.textDim, fontSize: 16 },
  card: {
    width: '100%',
    backgroundColor: THEME.card,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textDim,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
    alignSelf: 'flex-start'
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
  tabContainer: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: 'hidden',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: THEME.input,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: { backgroundColor: THEME.card },
  tabText: { fontWeight: '600', color: THEME.textDim },
  activeTabText: { color: THEME.primary, fontWeight: 'bold' },
  tabContent: {
    padding: 30,
    alignItems: 'center',
  },
});
