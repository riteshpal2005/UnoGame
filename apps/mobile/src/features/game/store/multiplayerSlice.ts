import { StateCreator } from 'zustand';
import { GameStore } from './types';

export const createMultiplayerSlice: StateCreator<GameStore, [], [], Partial<GameStore>> = (set) => ({
  syncFromSocket: (serverState: any) => {
    // The socketService dependency should ideally be injected or handled at the component level
    // but for now we'll just update the state directly from the payload.
    set({
      gameStatus: 'playing',
      deck: serverState.deck,
      discardPile: serverState.discardPile,
      players: serverState.players,
      currentPlayerIndex: serverState.currentPlayerIndex,
      direction: serverState.direction,
      currentColor: serverState.currentColor,
      winner: serverState.winner,
      unoCalled: serverState.unoCalled || false,
      isChoosingColor: false,
      selectedCardIds: [],
      hasDrawnCard: false,
    });
  },
});
