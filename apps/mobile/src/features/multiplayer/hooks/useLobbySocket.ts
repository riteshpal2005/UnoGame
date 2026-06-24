import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { initializeSocket, getSocket } from '../utils/socket';

export function useLobbySocket(
  setViewState: (state: any) => void,
  navigate: (screen: string, params?: any) => void
) {
  const [ipAddress, setIpAddress] = useState('192.168.18.247'); 
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);

  const setupSocketListeners = (socket: any) => {
    socket.on('roomCreated', (code: string) => {
      setRoomCode(code);
      setIsHost(true);
      setPlayers(['You (Host)']);
      setViewState('inside_room');
    });

    socket.on('roomJoined', (code: string) => {
      setRoomCode(code);
      setIsHost(false);
      setViewState('inside_room');
    });

    socket.on('playerJoined', (playerId: string) => {
      setPlayers((prev) => [...prev, `Player ${playerId.slice(0, 4)}`]);
    });
    
    socket.on('gameStarted', (initialData: any) => {
       navigate('Game', { initialData });
    });

    socket.on('error', (msg: string) => Alert.alert("Error", msg));
  };

  const handleConnect = () => {
    setIsLoading(true);
    const newSocket = initializeSocket(ipAddress);

    newSocket.on('connect', () => {
      setIsLoading(false);
      setIsConnected(true);
      setViewState('join_create');
      Alert.alert('Success', 'Connected to Server!');
    });

    newSocket.on('connect_error', () => {
      setIsLoading(false);
      Alert.alert('Connection Failed', 'Ensure phone and PC are on the same Wi-Fi.');
    });

    setupSocketListeners(newSocket);
  };

  useEffect(() => {
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.removeAllListeners();
      }
    };
  }, []);

  return {
    ipAddress, setIpAddress,
    isLoading,
    isConnected, setIsConnected,
    roomCode, setRoomCode,
    players,
    isHost,
    handleConnect
  };
}
