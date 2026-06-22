import { Card, CardColor, CardType } from '../types';

const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

export const createDeck = (customRules: string[] = ['Shuffle Hands', 'Shuffle Hands', 'Shuffle Hands']): Card[] => {
  const deck: Card[] = [];
  let idCounter = 0;

  COLORS.forEach(color => {
    deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: 0 });
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: i });
      deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: i });
    }
    (['skip', 'reverse', 'draw2'] as CardType[]).forEach(type => {
      deck.push({ id: `c-${idCounter++}`, color, type });
      deck.push({ id: `c-${idCounter++}`, color, type });
    });
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c-${idCounter++}`, color: 'black', type: 'wild' });
    deck.push({ id: `c-${idCounter++}`, color: 'black', type: 'wild4' });
  }

  deck.push({ id: `c-${idCounter++}`, color: 'black', type: 'wild_shuffle' });

  customRules.forEach((rule) => {
    deck.push({ 
      id: `c-${idCounter++}`, 
      color: 'black', 
      type: 'wild_custom',
      customText: rule || "Shuffle Hands"
    });
  });

  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};