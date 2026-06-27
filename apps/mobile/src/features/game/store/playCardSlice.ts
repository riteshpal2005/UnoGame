import { StateCreator } from 'zustand';
import { GameStore } from './types';
import { Card, Player } from '../../../types';
import { createDeck, shuffleDeck } from '../utils/deck';
import { isValidMove } from '../utils/gameRules';
import { generatePlayers, createGodHand, sortHand, processBatchTurn } from './helpers';
import { triggerHaptic } from '../../../shared/utils/haptics';
import { playSound } from '../../../shared/utils/sound';

export const createPlayCardSlice: StateCreator<GameStore, [], [], Partial<GameStore>> = (set, get) => ({
  startGame: (
    playerCount = 2,
    mode = 'bot',
    playersList = [],
    initialServerData = null
  ) => {
    if (mode === 'online' && initialServerData) {
      set({
        gameStatus: 'playing',
        deck: initialServerData.deck,
        discardPile: initialServerData.discardPile,
        players: initialServerData.players,
        currentPlayerIndex: initialServerData.currentPlayerIndex,
        currentColor: initialServerData.currentColor,
        direction: initialServerData.direction,
        winner: null,
        unoCalled: false,
        hasDrawnCard: false,
        selectedCardIds: [],
        myId: get().myId
      });
      return;
    }

    const currentRules = get().customRules;
    const fullDeck = shuffleDeck(createDeck());
    let players: Player[] = [];

    if (mode === 'bot') {
      players = generatePlayers(playerCount, fullDeck);
    }
    else {
      players = playersList.map((pObj: any) => ({
        id: pObj.id,
        name: pObj.name || `Player ${pObj.id.slice(0, 4)}`,
        hand: fullDeck.splice(0, 7),
        isBot: false,
        isHost: !!pObj.isHost,
        score: 0
      }));
      players.forEach(p => p.hand = sortHand(p.hand));
    }

    let topCard = fullDeck.pop()!;
    while ((topCard.color as string) === 'black') {
      fullDeck.unshift(topCard);
      const randomIndex = Math.floor(Math.random() * fullDeck.length);
      [fullDeck[0], fullDeck[randomIndex]] = [fullDeck[randomIndex], fullDeck[0]];
      topCard = fullDeck.pop()!;
    }

    set({
      gameStatus: mode === 'bot' ? 'dealing' : 'playing',
      deck: fullDeck,
      discardPile: [topCard],
      players: players,
      currentPlayerIndex: 0,
      direction: 1,
      currentColor: (topCard.color as string) === 'black' ? 'red' : topCard.color,
      isChoosingColor: false,
      pendingBatch: null,
      unoCalled: false,
      winner: null,
      isDebugMode: false,
      hasDrawnCard: false,
      selectedCardIds: [],
      lastAction: null
    });
  },

  restartGame: () => {
    const state = get();
    const currentRules = state.customRules;
    const fullDeck = shuffleDeck(createDeck());
    const resetPlayers = state.players.map(p => ({
      ...p,
      hand: sortHand(fullDeck.splice(0, 7))
    }));

    if (state.isDebugMode) {
      resetPlayers[0].hand = createGodHand(currentRules);
    }
    const topCard = fullDeck.pop()!;
    set({
      deck: fullDeck,
      discardPile: [topCard],
      players: resetPlayers,
      currentPlayerIndex: 0,
      direction: 1,
      currentColor: topCard.color === 'black' ? 'red' : topCard.color,
      isChoosingColor: false,
      pendingBatch: null,
      unoCalled: false,
      winner: null,
      hasDrawnCard: false,
      selectedCardIds: []
    });
  },

  playCard: (playerId, card) => set((state) => {
    if (state.winner) return state;

    const topCard = state.discardPile[state.discardPile.length - 1];
    if (!isValidMove(card, topCard, state.currentColor)) {
      triggerHaptic.error();
      return state;
    }

    const pIndex = state.players.findIndex(p => p.id === playerId);
    const player = state.players[pIndex];
    const remainingHandSize = player.hand.length - 1;

    if (remainingHandSize === 0) {
      const winningPlayers = [...state.players];
      winningPlayers[pIndex] = { ...winningPlayers[pIndex], hand: [] };
      triggerHaptic.success();
      playSound('victory');
      return {
        players: winningPlayers,
        discardPile: [...state.discardPile, card],
        winner: player,
        selectedCardIds: []
      };
    }

    if (card.type.startsWith('wild')) {
      const newPlayers = [...state.players];
      newPlayers[pIndex] = {
        ...newPlayers[pIndex],
        hand: newPlayers[pIndex].hand.filter(c => c.id !== card.id)
      };
      triggerHaptic.light();
      playSound('card_play');
      return {
        players: newPlayers,
        isChoosingColor: true,
        pendingBatch: [card],
        selectedCardIds: [],
        hasDrawnCard: false
      };
    }

    const newState = processBatchTurn(state, playerId, [card], card.color, 0);

    triggerHaptic.light();
    playSound('card_play');

    return {
      ...newState,
      lastAction: { playerId, cardId: card.id, type: 'play' }
    };
  }),

  playSelectedCards: () => set((state) => {
    if (state.selectedCardIds.length === 0) return state;

    const myPlayerId = state.myId || 'p1';
    const me = state.players.find(p => p.id === myPlayerId) || state.players[0];

    const cardsToPlay = state.selectedCardIds
      .map(id => me.hand.find(c => c.id === id))
      .filter(Boolean) as Card[];

    if (cardsToPlay.length === 0) return state;

    const topCard = state.discardPile[state.discardPile.length - 1];
    if (!isValidMove(cardsToPlay[0], topCard, state.currentColor)) {
      alert("Invalid Move!");
      triggerHaptic.error();
      return { selectedCardIds: [] };
    }

    const remainingHandSize = me.hand.length - cardsToPlay.length;
    if (remainingHandSize === 0) {
      const winningPlayers = [...state.players];
      const myIndex = state.players.findIndex(p => p.id === me.id);
      winningPlayers[myIndex] = { ...winningPlayers[myIndex], hand: [] };
      triggerHaptic.success();
      playSound('victory');
      return {
        players: winningPlayers,
        discardPile: [...state.discardPile, ...cardsToPlay],
        winner: me,
        selectedCardIds: []
      };
    }

    if (remainingHandSize === 1 && !state.unoCalled) {
      alert("Forgot to say UNO! Draw 2 Penalty!");
      triggerHaptic.error();
    }

    if (cardsToPlay[0].type.startsWith('wild')) {
      const newPlayers = [...state.players];
      const myIndex = state.players.findIndex(p => p.id === me.id);
      newPlayers[myIndex] = {
        ...newPlayers[myIndex],
        hand: newPlayers[myIndex].hand.filter(c => !state.selectedCardIds.includes(c.id))
      };

      triggerHaptic.light();
      playSound('card_play');

      return {
        players: newPlayers,
        isChoosingColor: true,
        pendingBatch: cardsToPlay,
        selectedCardIds: [],
        hasDrawnCard: false
      };
    }

    triggerHaptic.light();
    playSound('card_play');

    return processBatchTurn(state, me.id, cardsToPlay, cardsToPlay[0].color, remainingHandSize === 1 && !state.unoCalled ? 2 : 0);
  }),

  selectColor: (color) => set((state) => {
    if (!state.pendingBatch) return state;
    const playerId = state.players[state.currentPlayerIndex].id;
    return processBatchTurn(state, playerId, state.pendingBatch, color);
  }),

  debugWinHand: () => set((state) => {
    const humanId = state.myId || 'p1';
    const playerIndex = state.players.findIndex(p => p.id === humanId);
    if (playerIndex === -1) return state;

    const godHand = createGodHand(state.customRules);
    const newPlayers = [...state.players];
    newPlayers[playerIndex] = { ...newPlayers[playerIndex], hand: godHand };
    return {
      players: newPlayers,
      currentPlayerIndex: playerIndex,
      isDebugMode: true,
      unoCalled: true,
      hasDrawnCard: false,
      selectedCardIds: []
    };
  }),
});
