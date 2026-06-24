import { StateCreator } from 'zustand';
import { GameStore } from './types';
import { shuffleDeck } from '../utils/deck';
import { getNextPlayerIndex } from '../utils/gameRules';
import { sortHand } from './helpers';

export const createTurnSlice: StateCreator<GameStore, [], [], Partial<GameStore>> = (set, get) => ({
  catchUnoFailure: () => set((state) => {
    let caughtSomeone = false;
    const newPlayers = state.players.map(p => {
      if (p.hand.length === 1 && !state.unoCalled) {
        caughtSomeone = true;
        const penaltyCards = state.deck.slice(0, 2);
        return { ...p, hand: [...p.hand, ...penaltyCards] };
      }
      return p;
    });

    if (caughtSomeone) {
      alert("CAUGHT! Player forgot to say UNO!");
      return { players: newPlayers, deck: state.deck.slice(2) };
    } else {
      alert("False Alarm! Everyone is safe.");
      return state;
    }
  }),

  drawCard: (playerId) => set((state) => {
    if (state.winner) return state;
    const playerIndex = state.players.findIndex(p => p.id === playerId);

    if (playerIndex !== state.currentPlayerIndex) return state;

    const newDeck = [...state.deck];
    if (newDeck.length === 0) {
      const oldDiscard = state.discardPile.slice(0, -1);
      const shuffledOld = shuffleDeck(oldDiscard);
      newDeck.push(...shuffledOld);
    }

    const card = newDeck.pop();
    if (!card) return state;

    const newPlayers = [...state.players];
    const newHand = [...newPlayers[playerIndex].hand, card];
    newPlayers[playerIndex] = { ...newPlayers[playerIndex], hand: sortHand(newHand) };

    return {
      deck: newDeck,
      players: newPlayers,
      hasDrawnCard: true,
      selectedCardIds: []
    };
  }),

  passTurn: () => set((state) => {
    const nextIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.direction);
    return {
      currentPlayerIndex: nextIndex,
      hasDrawnCard: false,
      selectedCardIds: []
    };
  }),

  toggleCardSelection: (cardId) => set((state) => {
    const myPlayerId = state.myId || 'p1';
    const me = state.players.find(p => p.id === myPlayerId) || state.players[0];

    const card = me.hand.find(c => c.id === cardId);
    if (!card) return state;

    const currentSelection = state.selectedCardIds;
    const isAlreadySelected = currentSelection.includes(cardId);

    if (isAlreadySelected) {
      return { selectedCardIds: currentSelection.filter(id => id !== cardId) };
    }

    if (currentSelection.length === 0) {
      return { selectedCardIds: [cardId] };
    }

    const firstCardId = currentSelection[0];
    const firstCard = me.hand.find(c => c.id === firstCardId)!;

    if (card.type === firstCard.type && card.color === firstCard.color) {
      return { selectedCardIds: [...currentSelection, cardId] };
    } else {
      return { selectedCardIds: [cardId] };
    }
  }),

  sayUno: (playerId) => set((state) => {
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex !== state.currentPlayerIndex) return state;
    return { unoCalled: true };
  }),
});
