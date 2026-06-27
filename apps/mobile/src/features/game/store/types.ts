import { GameState, Card, CardColor, Player } from '../../../types';

export interface ExtendedGameState extends GameState {
  myId: string | null;
  isChoosingColor: boolean;
  pendingBatch: Card[] | null;
  unoCalled: boolean;
  customRules: string[];
  winner: Player | null;
  isDebugMode: boolean;
  hasDrawnCard: boolean;
  selectedCardIds: string[];
  gameStatus: 'lobby' | 'dealing' | 'playing' | 'ended';
  lastAction: { playerId: string; cardId: string; type: 'play' | 'draw' } | null;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface GameActions {
  startGame: (
    playerCount?: number,
    mode?: 'bot' | 'online' | 'host',
    playersList?: any[],
    initialServerData?: any
  ) => void;
  restartGame: () => void;
  drawCard: (playerId: string) => void;
  passTurn: () => void;

  toggleCardSelection: (cardId: string) => void;
  playSelectedCards: () => void;
  playCard: (playerId: string, card: Card) => void;

  selectColor: (color: CardColor) => void;
  sayUno: (playerId: string) => void;
  setCustomRules: (rules: string[]) => void;

  setMyId: (id: string) => void;
  syncFromSocket: (serverData: any) => void;

  setGameState: (newState: ExtendedGameState) => void;
  setGameStatus: (status: ExtendedGameState['gameStatus']) => void;
  exitGame: () => void;
  debugWinHand: () => void;
  catchUnoFailure: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
}

export type GameStore = ExtendedGameState & GameActions;
