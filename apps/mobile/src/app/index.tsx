import React, { useState } from 'react';
import { StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import { getSocket } from '../features/multiplayer/utils/socket';
import { useLobbySocket } from '../features/multiplayer/hooks/useLobbySocket';
import { useGameStore } from '../features/game/store';
import { THEME } from '../constants/colors';

import { LobbyMenu } from '../features/lobby/components/LobbyMenu';
import { LobbyConnection } from '../features/lobby/components/LobbyConnection';
import { LobbyJoinCreate } from '../features/lobby/components/LobbyJoinCreate';
import { LobbyRoom } from '../features/lobby/components/LobbyRoom';
import { BotModal } from '../features/lobby/components/BotModal';
import { SettingsModal } from '../features/lobby/components/SettingsModal';

type ViewState = 'menu' | 'connect' | 'join_create' | 'inside_room';
type TabState = 'create' | 'join';

export default function LobbyScreen() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>('menu');
  const [activeTab, setActiveTab] = useState<TabState>('create');

  const {
    ipAddress, setIpAddress,
    isLoading,
    isConnected, setIsConnected,
    roomCode, setRoomCode,
    players,
    isHost,
    handleConnect
  } = useLobbySocket(setViewState, router);

  const [nickname, setNickname] = useState('');
  
  const [showBotModal, setShowBotModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { customRules, setCustomRules } = useGameStore();



  const handleMultiplayerClick = () => {
      const socket = getSocket();
      if (socket && socket.connected) {
          setViewState('join_create');
      } else {
          setViewState('connect');
      }
  };

  const startBotGame = (count: number) => {
      setShowBotModal(false);
      router.push({ pathname: '/game', params: { mode: 'bot', botCount: count } });
  };

  const handleCreateRoom = () => {
    const socket = getSocket();
    if (nickname && socket) socket.emit('createRoom');
    else Alert.alert("Missing Info", "Enter Nickname first.");
  };

  const handleJoinRoom = () => {
    const socket = getSocket();
    if (nickname && socket && roomCode.length === 5) {
        socket.emit('joinRoom', roomCode.toUpperCase());
    } else {
        Alert.alert("Invalid", "Check code and nickname.");
    }
  };

  const handleStartGame = () => {
      const socket = getSocket();
      if (socket) {
          socket.emit('startGame', roomCode); 
      }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(roomCode);
  };

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setRoomCode(text.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={THEME.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {viewState === 'menu' && (
            <LobbyMenu 
              onOpenSettings={() => setShowSettings(true)}
              onOpenBotModal={() => setShowBotModal(true)}
              onMultiplayerClick={handleMultiplayerClick}
              onDebugCardTest={() => router.push('/cardTest')}
            />
          )}

          {viewState === 'connect' && (
            <LobbyConnection 
              ipAddress={ipAddress}
              setIpAddress={setIpAddress}
              isLoading={isLoading}
              onConnect={handleConnect}
              onBack={() => setViewState('menu')}
            />
          )}

          {viewState === 'join_create' && (
            <LobbyJoinCreate 
              nickname={nickname}
              setNickname={setNickname}
              roomCode={roomCode}
              setRoomCode={setRoomCode}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onCreate={handleCreateRoom}
              onJoin={handleJoinRoom}
              onBack={() => setViewState('menu')}
              onPaste={pasteFromClipboard}
            />
          )}

          {viewState === 'inside_room' && (
            <LobbyRoom 
              roomCode={roomCode}
              players={players}
              isHost={isHost}
              onCopyCode={copyToClipboard}
              onStartGame={handleStartGame}
              onLeave={() => { setViewState('menu'); setIsConnected(false); }}
            />
          )}

        </ScrollView>
        
        <BotModal 
          visible={showBotModal} 
          onClose={() => setShowBotModal(false)} 
          onStartBotGame={startBotGame} 
        />
        
        <SettingsModal 
          visible={showSettings} 
          onClose={() => setShowSettings(false)} 
          customRules={customRules} 
          setCustomRules={setCustomRules} 
        />

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    alignItems: 'center',
  },
});