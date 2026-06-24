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
  gameStatus: 'lobby' | 'playing' | 'ended';
  lastAction: { playerId: string; cardId: string; type: 'play' | 'draw' } | null;
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
  exitGame: () => void;
  debugWinHand: () => void;
  catchUnoFailure: () => void;
}

export type GameStore = ExtendedGameState & GameActions;
