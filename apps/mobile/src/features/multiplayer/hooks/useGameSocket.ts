import { useEffect } from 'react';
import { socketService } from '../utils/socketService';

export function useGameSocket(mode: string, syncFromSocket: (state: any) => void) {
  useEffect(() => {
    if (mode === 'bot') return;

    const socket = socketService.socket;
    if (!socket) return;

    const handleGameUpdate = (serverState: any) => {
        console.log("📥 Game Update Received");
        syncFromSocket(serverState);
    };

    socketService.on('GAME_UPDATE', handleGameUpdate);
    socketService.on('GAME_START', handleGameUpdate);

    return () => {
        socketService.off('GAME_UPDATE');
        socketService.off('GAME_START');
    };
  }, [mode, syncFromSocket]);
}
