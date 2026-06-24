import { useGameStore } from '../../game/store';
import { socketService } from '../utils/socketService';
import { CardColor } from '../../../types';

export const useMultiplayer = (mode: string, roomCode: string) => {
  const store = useGameStore();
  const socket = socketService.socket;


  const mpDrawCard = (playerId: string) => {
     if (mode === 'bot') {
        store.drawCard(playerId);
     } else if (socket) {
        socket.emit('drawCard', roomCode);
     }
  };

  const mpPassTurn = () => {
     if (mode === 'bot') {
        store.passTurn();
     } else if (socket) {
        socket.emit('passTurn', roomCode); 
     }
  };

  const mpSayUno = (playerId: string) => {
     if (mode === 'bot') {
        store.sayUno(playerId);
     } else if (socket) {
        socket.emit('sayUno', roomCode);
     }
  };

  const mpSelectColor = (color: CardColor) => {
     if (mode === 'bot') {
        store.selectColor(color);
     } else if (socket) {
     }
  };

  const mpPlaySelected = () => {
     const state = useGameStore.getState();
     const selectedIds = state.selectedCardIds;
     if (selectedIds.length === 0) return;

     const cardId = selectedIds[0];
     
     if (mode === 'bot') {
        store.playSelectedCards();
     } else if (socket) {
        socket.emit('playCard', { 
            roomCode, 
            cardId, 
            selectedColor: 'red'
        });
        
        store.toggleCardSelection(cardId); 
     }
  };

  return { mpDrawCard, mpPassTurn, mpSayUno, mpSelectColor, mpPlaySelected };
};