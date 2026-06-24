import { Card, CardColor, Player } from '../../../types';
import { ExtendedGameState } from './types';
import { getNextPlayerIndex } from '../utils/gameRules';
import { shuffleDeck } from '../utils/deck';

export const generatePlayers = (count: number, fullDeck: Card[]) => {
  const players = [];
  players.push({ id: 'p1', name: 'You', hand: fullDeck.splice(0, 7), isBot: false });
  for (let i = 1; i < count; i++) {
    players.push({ id: `bot-${i}`, name: `Bot ${i}`, hand: fullDeck.splice(0, 7), isBot: true });
  }
  return players;
};

export const createGodHand = (rules: string[]): Card[] => {
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

export const sortHand = (hand: Card[]): Card[] => {
  return hand.sort((a, b) => {
    if (a.type.startsWith('wild') && !b.type.startsWith('wild')) return -1;
    if (!a.type.startsWith('wild') && b.type.startsWith('wild')) return 1;
    if (a.color < b.color) return -1;
    if (a.color > b.color) return 1;
    return 0;
  });
};

export const processBatchTurn = (
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
