import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Modal,
  StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { socketService } from '../utils/socketService';
import { useGameStore } from '../store/gameStore';
import { THEME } from '../constants/colors';


type ViewState = 'menu' | 'connect' | 'join_create' | 'inside_room';
type TabState = 'create' | 'join';

export default function DevLobbyScreen({ navigation }: any) {
  const [viewState, setViewState] = useState<ViewState>('menu');
  const [activeTab, setActiveTab] = useState<TabState>('create');

  const [ipAddress, setIpAddress] = useState('100.123.107.45'); 
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);
  
  const [showBotModal, setShowBotModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { customRules, setCustomRules } = useGameStore();

  const handleConnect = () => {
    setIsLoading(true);
    const url = `http://${ipAddress}:3000`;
    socketService.connect(url);
    const newSocket = socketService.socket;

    newSocket?.on('connect', () => {
      setIsLoading(false);
      setIsConnected(true);
      useGameStore.setState({ myId: newSocket.id });
      setViewState('join_create');
      Alert.alert('Success', 'Connected to Server!');
    });

    newSocket?.on('connect_error', () => {
      setIsLoading(false);
    });

    if (newSocket) setupSocketListeners(newSocket);
  };

  const setupSocketListeners = (socket: any) => {
    socket.on('roomCreated', (code: string) => {
      setRoomCode(code);
      setIsHost(true);
      setViewState('inside_room');
    });

    socket.on('roomJoined', (code: string) => {
      setRoomCode(code);
      setIsHost(false);
      setViewState('inside_room');
    });

    socket.on('updatePlayerList', (list: any[]) => {
      setPlayers(list);
    });
    
    socket.on('GAME_UPDATE', (state: any) => {
       useGameStore.getState().syncFromSocket(state);
       navigation.navigate('DevGame', { mode: 'online', roomCode: state.code });
    });

    socket.on('error', (msg: string) => Alert.alert("Error", msg));
  };

  useEffect(() => {
    return () => {
    };
  }, []);

  const handleMultiplayerClick = () => {
      const socket = socketService.socket;
      if (socket?.connected) {
          setViewState('join_create');
      } else {
          setViewState('connect');
      }
  };

  const startBotGame = (count: number) => {
      setShowBotModal(false);
      navigation.navigate('DevGame', { mode: 'bot', botCount: count });
  };

  const handleCreateRoom = () => {
    const socket = socketService.socket;
    if (nickname && socket) socket.emit('createRoom', { nickname });
    else Alert.alert("Missing Info", "Enter Nickname first.");
  };

  const handleJoinRoom = () => {
    const socket = socketService.socket;
    if (nickname && socket && roomCode.length === 5) {
        socket.emit('joinRoom', { roomCode: roomCode.toUpperCase(), nickname });
    } else {
        Alert.alert("Invalid", "Check code and nickname.");
    }
  };

  const handleStartGame = () => {
      const socket = socketService.socket;
      if (socket) socket.emit('startGame', roomCode); 
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(roomCode);
  };

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setRoomCode(text.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5));
  };


  const renderMenu = () => (
    <View style={styles.centerContainer}>
        <View style={{ width: '100%', alignItems: 'flex-end', marginBottom: 10 }}>
         <TouchableOpacity onPress={() => setShowSettings(true)} style={{ padding: 10 }}>
            <MaterialCommunityIcons name="cog" size={28} color={THEME.textDim} />
         </TouchableOpacity>
      </View>

      <Text style={styles.logoText}>UNO</Text>
      
      {}
      <TouchableOpacity 
        style={styles.bigButton} 
        onPress={() => setShowBotModal(true)}
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

      {}
      <TouchableOpacity 
        style={styles.bigButton} 
        onPress={handleMultiplayerClick}
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

      {}
      <TouchableOpacity 
        style={styles.debugBtn} 
        onPress={() => navigation.navigate('CardTest')}
      >
        <MaterialCommunityIcons name="test-tube" size={16} color={THEME.textDim} />
        <Text style={styles.debugText}>Debug: Card Test</Text>
      </TouchableOpacity>

      {}
      <TouchableOpacity 
        style={styles.debugBtn} 
        onPress={() => navigation.navigate('Test')}
      >
        <MaterialCommunityIcons name="test-tube" size={16} color={THEME.textDim} />
        <Text style={styles.debugText}>Debug: Card Test</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConnection = () => (
    <View style={styles.fullWidth}>
        <TouchableOpacity onPress={() => setViewState('menu')} style={styles.backButton}>
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

            <TouchableOpacity style={styles.btnPrimary} onPress={handleConnect}>
                {isLoading ? <ActivityIndicator color="white"/> : <Text style={styles.btnText}>Connect</Text>}
            </TouchableOpacity>
        </View>
    </View>
  );

  const renderJoinCreate = () => (
    <View style={styles.fullWidth}>
        <TouchableOpacity onPress={() => setViewState('menu')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={THEME.textDim} />
            <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {}
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
                    <View style={styles.centerContent}>
                        <View style={styles.illustrationCircle}>
                             <MaterialCommunityIcons name="crown" size={40} color={THEME.primary} />
                        </View>
                        <Text style={styles.helperText}>Host a Game</Text>
                        <Text style={styles.helperSubText}>Get a code to share with friends.</Text>
                        <TouchableOpacity 
                            style={[styles.btnPrimary, !nickname && styles.btnDisabled]} 
                            onPress={handleCreateRoom}
                            disabled={!nickname}
                        >
                            <Text style={styles.btnText}>Generate Room</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
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
                            <TouchableOpacity style={styles.pasteBtn} onPress={pasteFromClipboard}>
                                <Text style={styles.pasteText}>PASTE</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={[styles.btnPrimary, (!nickname || roomCode.length !== 5) && styles.btnDisabled, { backgroundColor: THEME.secondary }]} 
                            onPress={handleJoinRoom}
                            disabled={!nickname || roomCode.length !== 5}
                        >
                            <Text style={styles.btnText}>Join Game</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    </View>
  );

  const renderInsideRoom = () => (
    <View style={styles.fullWidth}>
        <Text style={styles.screenTitle}>Lobby</Text>
        
        <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>ROOM CODE</Text>
            <TouchableOpacity style={styles.codeRow} onPress={copyToClipboard}>
                <Text style={styles.codeText}>{roomCode}</Text>
                <MaterialCommunityIcons name="content-copy" size={24} color={THEME.primary} />
            </TouchableOpacity>
        </View>

        <View style={styles.playerSection}>
            <Text style={styles.sectionHeader}>PLAYERS ({players.length})</Text>
            {players.map((p, i) => (
                <View key={i} style={styles.playerRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{p.name?.charAt(0) || '?'}</Text>
                    </View>
                    <Text style={styles.playerText}>{p.name} {p.id === socketService.socket?.id ? '(You)' : ''}</Text>
                    {p.isHost && <MaterialCommunityIcons name="crown" size={16} color="#fbbf24" />}
                </View>
            ))}
        </View>

        <View style={styles.footerAction}>
            {isHost ? (
                <TouchableOpacity style={styles.btnPrimary} onPress={handleStartGame}>
                    <Text style={styles.btnText}>Start Game</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.waitingBadge}>
                     <ActivityIndicator size="small" color={THEME.textDim} />
                     <Text style={styles.waitingText}>Waiting for host...</Text>
                </View>
            )}
            
            <TouchableOpacity style={styles.btnGhost} onPress={() => { setViewState('menu'); setIsConnected(false); }}>
                <Text style={styles.btnGhostText}>Leave Room</Text>
            </TouchableOpacity>
        </View>
    </View>
  );

  const renderBotModal = () => (
    <Modal visible={showBotModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Players</Text>
                <Text style={styles.modalSubtitle}>Including you</Text>
                
                <View style={styles.botCountGrid}>
                    {[2, 3, 4, 5].map((num) => (
                        <TouchableOpacity 
                            key={num} 
                            style={styles.countBtn} 
                            onPress={() => startBotGame(num)}
                        >
                            <Text style={styles.countBtnText}>{num}</Text>
                            <MaterialCommunityIcons name="account" size={16} color={THEME.textDim} />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowBotModal(false)}>
                    <Text style={styles.closeBtnText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal visible={showSettings} transparent animationType="slide">
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
                    onPress={() => setShowSettings(false)}
                >
                    <Text style={styles.btnText}>Save & Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={THEME.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {viewState === 'menu' && renderMenu()}
          {viewState === 'connect' && renderConnection()}
          {viewState === 'join_create' && renderJoinCreate()}
          {viewState === 'inside_room' && renderInsideRoom()}
        </ScrollView>
        {renderBotModal()}
        {renderSettingsModal()}
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
  fullWidth: {
    width: '100%',
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
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  
  centerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
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
  activeTab: {
    backgroundColor: THEME.card,
  },
  tabText: {
    fontWeight: '600',
    color: THEME.textDim,
  },
  activeTabText: {
    color: THEME.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    padding: 30,
    alignItems: 'center',
  },
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

  screenTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME.text,
    marginBottom: 24,
  },
  codeCard: {
    width: '100%',
    backgroundColor: THEME.input,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.primary,
    marginBottom: 30,
  },
  codeLabel: {
    color: THEME.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeText: {
    color: THEME.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
  },
  sectionHeader: {
    color: THEME.textDim,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  playerSection: {
    width: '100%',
    marginBottom: 30,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: THEME.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerText: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  footerAction: {
    width: '100%',
    gap: 16,
  },
  waitingBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  waitingText: {
    color: THEME.textDim,
    fontSize: 14,
    fontStyle: 'italic',
  },
  btnGhost: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
  },
  btnGhostText: {
    color: THEME.textDim,
    fontSize: 14,
  },

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