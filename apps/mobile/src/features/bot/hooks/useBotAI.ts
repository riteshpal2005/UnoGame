import { useEffect } from 'react';
import { useGameStore } from '../../game/store';
import { isValidMove } from '../../game/utils/gameRules';
import { CardColor } from '../../../types';

export const useBotAI = () => {
  const { 
    players, 
    currentPlayerIndex, 
    discardPile, 
    currentColor, 
    playCard, 
    drawCard, 
    selectColor,
    hasDrawnCard,
    passTurn,
    isChoosingColor
  } = useGameStore();

  const activePlayer = players[currentPlayerIndex];
  const topCard = discardPile[discardPile.length - 1];

  useEffect(() => {
    if (!activePlayer || !activePlayer.isBot) return;
    if (!players.length) return;

    if (isChoosingColor) {
        setTimeout(() => {
             const colorCounts: Record<string, number> = { red: 0, blue: 0, green: 0, yellow: 0 };
             activePlayer.hand.forEach(c => { if (c.color !== 'black') colorCounts[c.color]++; });
             const bestColor = Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b) as CardColor;
             selectColor(bestColor);
        }, 1000);
        return;
    }

    const timer = setTimeout(() => {
      
      const findBestMove = () => {
         const validCards = activePlayer.hand.filter(card => isValidMove(card, topCard, currentColor));
         
         return validCards.sort((a, b) => {
             if (a.type.startsWith('wild')) return 1;
             if (b.type.startsWith('wild')) return -1;
             return 0;
         })[0];
      };

      const cardToPlay = findBestMove();

      if (hasDrawnCard) {
         if (cardToPlay) {
             playCard(activePlayer.id, cardToPlay);
         } else {
             passTurn();
         }
      } else {
         if (cardToPlay) {
             playCard(activePlayer.id, cardToPlay);
         } else {
             drawCard(activePlayer.id);
         }
      }

    }, 1500);

    return () => clearTimeout(timer);

  }, [currentPlayerIndex, activePlayer, discardPile, currentColor, hasDrawnCard, isChoosingColor]);
};