import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const COLORS = ['red', 'blue', 'green', 'yellow'] as const;
const ACTION_TYPES = ['skip', 'reverse', 'draw2'] as const;
const WILD_TYPES = ['wild', 'wild4'] as const;

type Color = typeof COLORS[number] | 'black';
type Type = typeof ACTION_TYPES[number] | typeof WILD_TYPES[number] | 'number' | 'back';

interface Card {
  id: string;
  color: Color;
  type: Type;
  value?: number;
}

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  hand: Card[];
  unoCalled: boolean;
  unoSafeUntil: number; // For race conditions
}

interface Room {
  code: string;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  currentColor: Color | null;
  gameStarted: boolean;
}

const rooms: Record<string, Room> = {};

function generateDeck(): Card[] {
  let deck: Card[] = [];
  let idCounter = 0;

  COLORS.forEach(color => {
    deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: 0 });
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: i });
      deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: i });
    }
    ACTION_TYPES.forEach(type => {
      deck.push({ id: `c-${idCounter++}`, color, type });
      deck.push({ id: `c-${idCounter++}`, color, type });
    });
  });

  WILD_TYPES.forEach(type => {
    for (let i = 0; i < 4; i++) {
      deck.push({ id: `c-${idCounter++}`, color: 'black', type });
    }
  });

  return shuffle(deck);
}

function shuffle(array: Card[]): Card[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', ({ nickname }: { nickname: string }) => {
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    rooms[roomCode] = {
      code: roomCode,
      players: [{ id: socket.id, name: nickname, isHost: true, hand: [], unoCalled: false, unoSafeUntil: 0 }],
      deck: [],
      discardPile: [],
      currentPlayerIndex: 0,
      direction: 1,
      currentColor: null,
      gameStarted: false
    };
    socket.join(roomCode);
    (socket as any).roomCode = roomCode;
    socket.emit('roomCreated', roomCode);
    io.to(roomCode).emit('updatePlayerList', rooms[roomCode].players.map(p => ({ id: p.id, name: p.name, isHost: p.isHost })));
  });

  socket.on('joinRoom', ({ roomCode, nickname }: { roomCode: string, nickname: string }) => {
    const room = rooms[roomCode];
    if (room && !room.gameStarted && room.players.length < 4) {
      room.players.push({ id: socket.id, name: nickname, isHost: false, hand: [], unoCalled: false, unoSafeUntil: 0 });
      socket.join(roomCode);
      (socket as any).roomCode = roomCode;
      socket.emit('roomJoined', roomCode);
      io.to(roomCode).emit('updatePlayerList', room.players.map(p => ({ id: p.id, name: p.name, isHost: p.isHost })));
    }
  });

  socket.on('startGame', (roomCode: string) => {
    const room = rooms[roomCode];
    if (room && room.players[0].id === socket.id && !room.gameStarted) { // Only host can start
      room.gameStarted = true;
      room.deck = generateDeck();
      
      room.players.forEach(p => p.hand = room.deck.splice(0, 7));
      
      let first = room.deck.pop()!;
      while(first.color === 'black') {
        room.deck.unshift(first);
        room.deck = shuffle(room.deck);
        first = room.deck.pop()!;
      }
      room.discardPile = [first];
      room.currentColor = first.color;

      broadcastState(roomCode);
    }
  });

  socket.on('sayUno', (roomCode: string, timestamp: number) => {
    const room = rooms[roomCode];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    
    // They can call UNO safely if they have 2 cards and are about to play one, or 1 card left.
    if (player.hand.length <= 2) {
       player.unoCalled = true;
       player.unoSafeUntil = timestamp;
       io.to(roomCode).emit('unoCalled', player.id);
    }
  });

  socket.on('catchUno', (roomCode: string, targetPlayerId: string, timestamp: number) => {
    const room = rooms[roomCode];
    if (!room) return;
    const targetPlayer = room.players.find(p => p.id === targetPlayerId);
    
    // Authoritative check if the target has 1 card and forgot to call UNO
    if (targetPlayer && targetPlayer.hand.length === 1 && !targetPlayer.unoCalled) {
       // Check if they called UNO faster than the catch using timestamp resolution (Race condition handling)
       if (targetPlayer.unoSafeUntil > 0 && targetPlayer.unoSafeUntil <= timestamp) {
           return; // Safe, they called it first
       }
       // Caught! Draw 2 penalty
       drawCards(room, targetPlayer, 2);
       io.to(roomCode).emit('unoCaught', { caught: targetPlayerId, catcher: socket.id });
       broadcastState(roomCode);
    }
  });

  socket.on('playCard', ({ roomCode, cardId, selectedColor }: { roomCode: string, cardId: string, selectedColor: Color }) => {
    const room = rooms[roomCode];
    if (!room || !room.gameStarted) return;

    const player = room.players[room.currentPlayerIndex];
    if (player.id !== socket.id) return; // Anti-cheat: Validate turn

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return; // Anti-cheat: Validate ownership

    const card = player.hand[cardIndex];
    const top = room.discardPile[room.discardPile.length - 1];
    
    const isColorMatch = card.color === room.currentColor;
    const isValueMatch = (card.type === 'number' && card.value === top.value);
    const isTypeMatch = (card.type !== 'number' && card.type === top.type);
    const isWild = card.color === 'black';

    if (isColorMatch || isValueMatch || isTypeMatch || isWild) {
      player.hand.splice(cardIndex, 1);
      room.discardPile.push(card);
      room.currentColor = isWild ? selectedColor : card.color;
      
      // If player didn't call UNO and now has 1 card, they are vulnerable
      if (player.hand.length > 1) {
          player.unoCalled = false;
          player.unoSafeUntil = 0;
      }

      // Check win condition
      if (player.hand.length === 0) {
        io.to(roomCode).emit('gameOver', player.id);
        return;
      }

      if (card.type === 'skip') {
        advanceTurn(room);
      } else if (card.type === 'reverse') {
        room.direction *= -1;
        if (room.players.length === 2) advanceTurn(room);
      } else if (card.type === 'draw2') {
        const nextP = getNextPlayer(room);
        drawCards(room, nextP, 2);
        advanceTurn(room);
      } else if (card.type === 'wild4') {
        const nextP = getNextPlayer(room);
        drawCards(room, nextP, 4);
        advanceTurn(room);
      }

      advanceTurn(room);
      broadcastState(roomCode);
    }
  });

  socket.on('drawCard', (roomCode: string) => {
    const room = rooms[roomCode];
    if (!room || !room.gameStarted) return;
    if (room.players[room.currentPlayerIndex].id !== socket.id) return; // Anti-cheat: Validate turn

    drawCards(room, room.players[room.currentPlayerIndex], 1);
    
    // Player resets UNO call state when they draw
    room.players[room.currentPlayerIndex].unoCalled = false;
    room.players[room.currentPlayerIndex].unoSafeUntil = 0;
    
    advanceTurn(room);
    broadcastState(roomCode);
  });

  socket.on('REQUEST_GAME_STATE', (roomCode: string) => {
    const room = rooms[roomCode];
    if (!room || !room.gameStarted) return;

    sendMaskedState(room, socket);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const roomCode = (socket as any).roomCode;
    if (roomCode) {
      // Logic for disconnects/bot takeover could go here
    }
  });

  function advanceTurn(room: Room) {
    const num = room.players.length;
    room.currentPlayerIndex = (room.currentPlayerIndex + room.direction + num) % num;
  }

  function getNextPlayer(room: Room): Player {
    const num = room.players.length;
    const idx = (room.currentPlayerIndex + room.direction + num) % num;
    return room.players[idx];
  }

  function drawCards(room: Room, player: Player, count: number) {
    for(let i=0; i<count; i++) {
      if (room.deck.length === 0) {
        if (room.discardPile.length <= 1) return;
        
        const top = room.discardPile.pop()!;
        room.deck = shuffle(room.discardPile);
        room.discardPile = [top];
        
        io.to(room.code).emit('deckReshuffled'); 
      }
      player.hand.push(room.deck.pop()!);
    }
  }

  function broadcastState(roomCode: string) {
    const room = rooms[roomCode];
    if (!room) return;

    const connectedSockets = io.sockets.adapter.rooms.get(roomCode);
    if (connectedSockets) {
        connectedSockets.forEach(socketId => {
            const playerSocket = io.sockets.sockets.get(socketId);
            if (playerSocket) {
                sendMaskedState(room, playerSocket);
            }
        });
    }
  }

  function sendMaskedState(room: Room, targetSocket: Socket) {
    // Authoritative State: Never leak deck or opponent hands
    const playerView = {
      ...room,
      deck: room.deck.map(() => ({ id: 'hidden', color: 'black', type: 'back' as Type })),
      players: room.players.map(p => {
        if (p.id === targetSocket.id) {
          return p; // Send exact hand only to owner
        } else {
          return {
            ...p,
            hand: p.hand.map(() => ({ id: 'hidden', color: 'black', type: 'back' as Type })) // Mask opponents
          };
        }
      })
    };
    targetSocket.emit('GAME_UPDATE', playerView);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));