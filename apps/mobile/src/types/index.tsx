export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'black';

export type CardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4' | 'wild_shuffle';

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number;
  customText?: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isBot?: boolean;
}

export interface GameState {
  deck: Card[];
  discardPile: Card[];
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  currentColor: CardColor;
}