import { StateCreator } from 'zustand';
import { GameStore, ExtendedGameState } from './types';

export const initialGameState: ExtendedGameState = {
  deck: [],
  discardPile: [],
  players: [],
  currentPlayerIndex: 0,
  gameStatus: 'lobby',
  direction: 1,
  currentColor: 'red',
  isChoosingColor: false,
  pendingBatch: null,
  unoCalled: false,
  winner: null,
  isDebugMode: false,
  hasDrawnCard: false,
  selectedCardIds: [],
  customRules: ['Shuffle Hands', 'Shuffle Hands', 'Shuffle Hands'],
  lastAction: null,
  myId: null,
};

export const createCoreSlice: StateCreator<GameStore, [], [], ExtendedGameState & Partial<GameStore>> = (set) => ({
  ...initialGameState,

  setCustomRules: (rules) => set({ customRules: rules }),
  setGameState: (newState) => set(() => ({ ...newState })),
  setMyId: (id) => set({ myId: id }),

  exitGame: () => set({
    players: [], deck: [], discardPile: [], winner: null, isDebugMode: false, hasDrawnCard: false, selectedCardIds: [], myId: null
  }),
});
