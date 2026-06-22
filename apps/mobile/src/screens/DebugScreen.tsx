import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { initializeSocket, getSocket } from '../utils/socket';
import { THEME } from '../constants/colors';

const HARDCODED_IP = '100.123.107.45';
const DEBUG_ROOM_CODE = 'TEST1';

type ViewState = 'connect' | 'lobby' | 'inside_room';

export default function DebugScreen({ navigation }: any) {
  const [viewState, setViewState] = useState<ViewState>('connect');
  const [nickname, setNickname] = useState('');
  const [status, setStatus] = useState('Disconnected');
  const [isLoading, setIsLoading] = useState(false);
  
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);


  const handleConnect = () => {
    if (!nickname) {
        Alert.alert("Required", "Enter a nickname (e.g. 'Phone' or 'Emu')");
        return;
    }

    setIsLoading(true);
    setStatus('Connecting...');
    const socket = initializeSocket(HARDCODED_IP);

    socket.on('connect', () => {
      setIsLoading(false);
      setStatus('Connected ✅');
      setViewState('lobby');
    });

    socket.on('connect_error', () => {
      setIsLoading(false);
      setStatus('Error ❌');
      Alert.alert("Connection Failed", "Check if server is running on " + HARDCODED_IP);
    });

    setupSocketListeners(socket);
  };

  const setupSocketListeners = (socket: any) => {
    socket.on('roomJoined', (data: any) => {
        setViewState('inside_room');
    });

    socket.on('playerJoined', (name: string) => {
        setPlayers(prev => [...prev, name]);
    });
    
    socket.on('updatePlayerList', (list: string[]) => {
        setPlayers(list);
    });

    socket.on('gameStarted', (playersList: string[]) => {
        navigation.navigate('Game', { mode: 'multiplayer', playersList, roomCode: DEBUG_ROOM_CODE });
    });
    
    socket.on('error', (msg: string) => Alert.alert("Error", msg));
  };

  useEffect(() => {
    return () => {
      const socket = getSocket();
      if(socket) socket.removeAllListeners();
    };
  }, []);


  const debugCreate = () => {
      const socket = getSocket();
      if(!socket) return;
      
      setIsHost(true);
      setPlayers([`${nickname} (Host)`]); 
      
      socket.emit('joinRoom', { roomCode: DEBUG_ROOM_CODE, playerName: nickname });
  };

  const debugJoin = () => {
      const socket = getSocket();
      if(!socket) return;

      setIsHost(false);
      socket.emit('joinRoom', { roomCode: DEBUG_ROOM_CODE, playerName: nickname });
  };

  const forceStart = () => {
      const socket = getSocket();
      if(socket) socket.emit('startGame', DEBUG_ROOM_CODE);
  };


  const renderConnection = () => (
      <View style={styles.centerContainer}>
          <View style={styles.illustrationCircle}>
                <MaterialCommunityIcons name="bug" size={40} color={THEME.primary} />
          </View>
          <Text style={styles.logoText}>DEBUG <Text style={{color: THEME.primary}}>LAB</Text></Text>
          <Text style={styles.helperSubText}>Target IP: {HARDCODED_IP}</Text>

          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.inputLabel}>DEBUG NICKNAME</Text>
            <TextInput 
                style={styles.input} 
                placeholder="e.g. Emu / Phone" 
                placeholderTextColor={THEME.textDim} 
                value={nickname} 
                onChangeText={setNickname} 
            />
          </View>

          <TouchableOpacity 
            style={[styles.btnPrimary, !nickname && styles.btnDisabled]} 
            onPress={handleConnect}
            disabled={!nickname || isLoading}
          >
             {isLoading ? <ActivityIndicator color="white"/> : <Text style={styles.btnText}>Connect to Server</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
             <Text style={{color: THEME.textDim}}>← Back to Main</Text>
          </TouchableOpacity>
      </View>
  );

  const renderLobby = () => (
    <View style={styles.fullWidth}>
        <View style={styles.headerRow}>
             <TouchableOpacity onPress={() => setViewState('connect')} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={20} color={THEME.textDim} />
                <Text style={styles.backText}>Disconnect</Text>
             </TouchableOpacity>
             <Text style={{color: THEME.success, fontWeight: 'bold'}}>{status}</Text>
        </View>

        <Text style={styles.screenTitle}>Select Role</Text>
        <Text style={styles.helperSubText}>Both buttons join room: <Text style={{color:THEME.primary, fontWeight:'bold'}}>{DEBUG_ROOM_CODE}</Text></Text>

        {}
        <TouchableOpacity 
            style={[styles.bigButton, { borderColor: THEME.primary }]} 
            onPress={debugCreate}
        >
            <View style={styles.bigButtonContent}>
                <View style={[styles.miniIconCircle, { backgroundColor: 'rgba(225, 29, 72, 0.1)' }]}>
                    <MaterialCommunityIcons name="server-plus" size={24} color={THEME.primary} />
                </View>
                <View>
                    <Text style={styles.bigButtonTitle}>Host (Create)</Text>
                    <Text style={styles.bigButtonDesc}>Join as the Game Host</Text>
                </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={THEME.textDim} />
        </TouchableOpacity>

        {}
        <TouchableOpacity 
            style={[styles.bigButton, { borderColor: THEME.secondary, marginTop: 15 }]} 
            onPress={debugJoin}
        >
            <View style={styles.bigButtonContent}>
                <View style={[styles.miniIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <MaterialCommunityIcons name="login" size={24} color={THEME.secondary} />
                </View>
                <View>
                    <Text style={styles.bigButtonTitle}>Client (Join)</Text>
                    <Text style={styles.bigButtonDesc}>Join as a Player</Text>
                </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={THEME.textDim} />
        </TouchableOpacity>
    </View>
  );

  const renderInsideRoom = () => (
    <View style={styles.fullWidth}>
        <Text style={styles.screenTitle}>Debug Room</Text>
        
        <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>FIXED ROOM CODE</Text>
            <Text style={styles.codeText}>{DEBUG_ROOM_CODE}</Text>
        </View>

        <View style={styles.playerSection}>
            <Text style={styles.sectionHeader}>PLAYERS IN LOBBY ({players.length})</Text>
            {players.length === 0 && <Text style={{color: THEME.textDim, fontStyle:'italic'}}>Waiting for server update...</Text>}
            
            {players.map((p, i) => (
                <View key={i} style={styles.playerRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{p.charAt(0)}</Text>
                    </View>
                    <Text style={styles.playerText}>{p}</Text>
                    {}
                    {i === 0 && <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />}
                </View>
            ))}
        </View>

        <View style={styles.footerAction}>
            {isHost ? (
                <TouchableOpacity style={styles.btnPrimary} onPress={forceStart}>
                    <Text style={styles.btnText}>Force Start Game</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.waitingBadge}>
                     <ActivityIndicator size="small" color={THEME.textDim} />
                     <Text style={styles.waitingText}>Waiting for host to start...</Text>
                </View>
            )}
            
            <TouchableOpacity style={styles.btnGhost} onPress={() => { setViewState('lobby'); setPlayers([]); }}>
                <Text style={styles.btnGhostText}>Leave Room</Text>
            </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={THEME.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {viewState === 'connect' && renderConnection()}
            {viewState === 'lobby' && renderLobby()}
            {viewState === 'inside_room' && renderInsideRoom()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME.bg },
  container: { flex: 1, backgroundColor: THEME.bg },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, alignItems: 'center' },
  fullWidth: { width: '100%' },
  centerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  
  logoText: { fontSize: 32, fontWeight: '900', color: THEME.text, letterSpacing: 2, marginBottom: 10 },
  screenTitle: { fontSize: 32, fontWeight: '900', color: THEME.text, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  
  card: { width: '100%', backgroundColor: THEME.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: THEME.border, marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: THEME.textDim, marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
  input: { width: '100%', backgroundColor: THEME.input, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, color: THEME.text, fontSize: 16, borderWidth: 1, borderColor: THEME.border },
  
  btnPrimary: { width: '100%', backgroundColor: THEME.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', elevation: 4 },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  btnDisabled: { opacity: 0.5 },
  btnGhost: { width: '100%', alignItems: 'center', padding: 16 },
  btnGhostText: { color: THEME.textDim, fontSize: 14 },
  
  bigButton: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.card, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: THEME.border },
  bigButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  miniIconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  bigButtonTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text },
  bigButtonDesc: { fontSize: 13, color: THEME.textDim },

  illustrationCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: THEME.input, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: THEME.border },
  helperSubText: { fontSize: 14, color: THEME.textDim, textAlign: 'center', marginBottom: 24 },

  codeCard: { width: '100%', backgroundColor: THEME.input, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: THEME.primary, marginBottom: 30 },
  codeLabel: { color: THEME.primary, fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 },
  codeText: { color: THEME.text, fontSize: 36, fontWeight: '900', letterSpacing: 6 },

  playerSection: { width: '100%', marginBottom: 30 },
  sectionHeader: { color: THEME.textDim, fontSize: 13, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: THEME.border },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.input, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: THEME.primary, fontWeight: 'bold', fontSize: 16 },
  playerText: { color: THEME.text, fontSize: 16, fontWeight: '600', flex: 1 },
  
  footerAction: { width: '100%', gap: 16 },
  waitingBadge: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, gap: 10 },
  waitingText: { color: THEME.textDim, fontSize: 14, fontStyle: 'italic' },
  
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: THEME.textDim, fontSize: 16 },
});