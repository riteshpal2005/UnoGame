import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Card, CardColor, Player } from '../types';
import { createDeck, shuffleDeck } from '../utils/deck';
import { isValidMove, getNextPlayerIndex } from '../utils/gameRules';
import { socketService } from '../utils/socketService';

export type CardColors = 'red' | 'blue' | 'green' | 'yellow' | 'black';

const generatePlayers = (count: number, fullDeck: Card[]) => {
  const players = [];
  players.push({ id: 'p1', name: 'You', hand: fullDeck.splice(0, 7), isBot: false });
  for (let i = 1; i < count; i++) {
    players.push({ id: `bot-${i}`, name: `Bot ${i}`, hand: fullDeck.splice(0, 7), isBot: true });
  }
  return players;
};

const createGodHand = (rules: string[]): Card[] => {
  const pool = [
    { type: 'wild' }, { type: 'wild' }, { type: 'wild' }, { type: 'wild' },
    { type: 'wild4' }, { type: 'wild4' }, { type: 'wild4' }, { type: 'wild4' },
    { type: 'wild_shuffle' },
    { type: 'wild_custom', text: rules[0] || "Custom 1" },
    { type: 'wild_custom', text: rules[1] || "Custom 2" },
    { type: 'wild_custom', text: rules[2] || "Custom 3" },
  ];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 7).map((def, i) => ({
    id: `god-wild-${Date.now()}-${Math.random()}-${i}`,
    color: 'black',
    type: def.type as any,
    customText: def.text
  }));
};

const sortHand = (hand: Card[]): Card[] => {
  return hand.sort((a, b) => {
    if (a.type.startsWith('wild') && !b.type.startsWith('wild')) return -1;
    if (!a.type.startsWith('wild') && b.type.startsWith('wild')) return 1;
    if (a.color < b.color) return -1;
    if (a.color > b.color) return 1;
    return 0;
  });
};

interface ExtendedGameState extends GameState {
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

interface GameActions {
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

export const useGameStore = create<ExtendedGameState & GameActions>()(
  persist(
    (set, get) => ({
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

      setCustomRules: (rules) => set({ customRules: rules }),
      setGameState: (newState) => set(() => ({ ...newState })),

      setMyId: (id) => set({ myId: id }),


      syncFromSocket: (serverState: any) => {
        const myId = socketService.socket?.id;
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

      exitGame: () => set({
        players: [], deck: [], discardPile: [], winner: null, isDebugMode: false, hasDrawnCard: false, selectedCardIds: [], myId: null
      }),

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
        const fullDeck = shuffleDeck(createDeck(currentRules));
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
          gameStatus: 'playing',
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

      restartGame: () => {
        const state = get();
        const currentRules = state.customRules;
        const fullDeck = shuffleDeck(createDeck(currentRules));
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

      playCard: (playerId, card) => set((state) => {
        if (state.winner) return state;

        const topCard = state.discardPile[state.discardPile.length - 1];
        if (!isValidMove(card, topCard, state.currentColor)) {
          return state;
        }

        const pIndex = state.players.findIndex(p => p.id === playerId);
        const player = state.players[pIndex];
        const remainingHandSize = player.hand.length - 1;

        if (remainingHandSize === 0) {
          const winningPlayers = [...state.players];
          winningPlayers[pIndex] = { ...winningPlayers[pIndex], hand: [] };
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
          return {
            players: newPlayers,
            isChoosingColor: true,
            pendingBatch: [card],
            selectedCardIds: [],
            hasDrawnCard: false
          };
        }

        const newState = processBatchTurn(state, playerId, [card], card.color, 0);

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
          return { selectedCardIds: [] };
        }

        const remainingHandSize = me.hand.length - cardsToPlay.length;
        if (remainingHandSize === 0) {
          const winningPlayers = [...state.players];
          const myIndex = state.players.findIndex(p => p.id === me.id);
          winningPlayers[myIndex] = { ...winningPlayers[myIndex], hand: [] };
          return {
            players: winningPlayers,
            discardPile: [...state.discardPile, ...cardsToPlay],
            winner: me,
            selectedCardIds: []
          };
        }

        if (remainingHandSize === 1 && !state.unoCalled) {
          alert("Forgot to say UNO! Draw 2 Penalty!");
        }

        if (cardsToPlay[0].type.startsWith('wild')) {
          const newPlayers = [...state.players];
          const myIndex = state.players.findIndex(p => p.id === me.id);
          newPlayers[myIndex] = {
            ...newPlayers[myIndex],
            hand: newPlayers[myIndex].hand.filter(c => !state.selectedCardIds.includes(c.id))
          };

          return {
            players: newPlayers,
            isChoosingColor: true,
            pendingBatch: cardsToPlay,
            selectedCardIds: [],
            hasDrawnCard: false
          };
        }

        return processBatchTurn(state, me.id, cardsToPlay, cardsToPlay[0].color, remainingHandSize === 1 && !state.unoCalled ? 2 : 0);
      }),

      selectColor: (color) => set((state) => {
        if (!state.pendingBatch) return state;
        const playerId = state.players[state.currentPlayerIndex].id;
        return processBatchTurn(state, playerId, state.pendingBatch, color);
      }),

      sayUno: (playerId) => set((state) => {
        const playerIndex = state.players.findIndex(p => p.id === playerId);
        if (playerIndex !== state.currentPlayerIndex) return state;
        return { unoCalled: true };
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
    }),
    {
      name: 'uno-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ customRules: state.customRules }),
    }
  )
);

const processBatchTurn = (
  state: ExtendedGameState,
  playerId: string,
  cardsPlayed: Card[],
  chosenColor: CardColor,
  penaltyDraw: number = 0
): Partial<ExtendedGameState> => {

  let newDirection = state.direction;
  let shouldSkip = false;
  let cardsToDraw = 0;
  let playersToUpdate = [...state.players];
  const representativeCard = cardsPlayed[0];

  if (representativeCard.type === 'draw2') {
    cardsToDraw = 2 * cardsPlayed.length;
    shouldSkip = true;
  }
  else if (representativeCard.type === 'wild4') {
    cardsToDraw = 4 * cardsPlayed.length;
    shouldSkip = true;
  }
  else if (representativeCard.type === 'skip') {
    shouldSkip = true;
  }
  else if (representativeCard.type === 'reverse') {
    newDirection = state.direction * -1 as 1 | -1;
    if (state.players.length === 2) shouldSkip = true;
  }

  const hasShuffle = cardsPlayed.some(c => c.type === 'wild_shuffle' || c.customText === 'Shuffle Hands');

  if (hasShuffle) {
    let allCards: Card[] = [];
    playersToUpdate.forEach(p => { allCards.push(...p.hand); p.hand = []; });
    allCards = shuffleDeck(allCards);

    let pIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, newDirection);
    while (allCards.length > 0) {
      const c = allCards.pop()!;
      playersToUpdate[pIndex].hand.push(c);
      pIndex = getNextPlayerIndex(pIndex, state.players.length, newDirection);
    }
    playersToUpdate.forEach(p => p.hand = sortHand(p.hand));
  } else {
    if (!representativeCard.type.startsWith('wild')) {
      playersToUpdate = playersToUpdate.map(p =>
        p.id === playerId
          ? { ...p, hand: p.hand.filter(c => !cardsPlayed.some(played => played.id === c.id)) }
          : p
      );
    }
  }

  let nextIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, newDirection);
  let finalDeck = [...state.deck];

  if (cardsToDraw > 0) {
    const victimIndex = nextIndex;
    const cardsDrawn: Card[] = [];
    for (let i = 0; i < cardsToDraw; i++) { if (finalDeck.length > 0) cardsDrawn.push(finalDeck.pop()!); }
    playersToUpdate[victimIndex].hand = sortHand([...playersToUpdate[victimIndex].hand, ...cardsDrawn]);
  }

  if (penaltyDraw > 0) {
    const cardsDrawn: Card[] = [];
    for (let i = 0; i < penaltyDraw; i++) { if (finalDeck.length > 0) cardsDrawn.push(finalDeck.pop()!); }
    const pIndex = playersToUpdate.findIndex(p => p.id === playerId);
    playersToUpdate[pIndex].hand = sortHand([...playersToUpdate[pIndex].hand, ...cardsDrawn]);
  }

  if (shouldSkip) {
    nextIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, newDirection, true);
  } else {
    nextIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, newDirection, false);
  }

  return {
    deck: finalDeck,
    discardPile: [...state.discardPile, ...cardsPlayed],
    players: playersToUpdate,
    currentPlayerIndex: nextIndex,
    direction: newDirection,
    currentColor: chosenColor,
    isChoosingColor: false,
    pendingBatch: null,
    unoCalled: false,
    hasDrawnCard: false,
    selectedCardIds: []
  };
};