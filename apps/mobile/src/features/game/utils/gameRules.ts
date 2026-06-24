import { Card, CardColor } from '../../../types';

export const getNextPlayerIndex = (currentIndex: number, totalPlayers: number, direction: number, skip: boolean = false): number => {
  let next = (currentIndex + direction) % totalPlayers;
  if (next < 0) next += totalPlayers;
  
  if (skip) {
    next = (next + direction) % totalPlayers;
    if (next < 0) next += totalPlayers;
  }
  return next;
};

export const isValidMove = (card: Card, topCard: Card, currentColor: CardColor): boolean => {
  if (card.type.startsWith('wild')) return true;

  if (card.color === currentColor) return true;

  if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) return true;

  if (card.type !== 'number' && card.type === topCard.type) return true;

  return false;
};