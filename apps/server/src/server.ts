const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const COLORS = ['red', 'blue', 'green', 'yellow'];
const ACTION_TYPES = ['skip', 'reverse', 'draw2'];
const WILD_TYPES = ['wild', 'wild4'];

function generateDeck() {
  let deck = [];
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

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const rooms = {}; 

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', ({ nickname }) => {
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    rooms[roomCode] = {
      code: roomCode,
      players: [{ id: socket.id, name: nickname, isHost: true, hand: [] }],
      deck: [],
      discardPile: [],
      currentPlayerIndex: 0,
      direction: 1,
      currentColor: null,
      gameStarted: false
    };
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.emit('roomCreated', roomCode);
    io.to(roomCode).emit('updatePlayerList', rooms[roomCode].players);
  });

  socket.on('joinRoom', ({ roomCode, nickname }) => {
    const room = rooms[roomCode];
    if (room && !room.gameStarted) {
      room.players.push({ id: socket.id, name: nickname, isHost: false, hand: [] });
      socket.join(roomCode);
      socket.roomCode = roomCode;
      socket.emit('roomJoined', roomCode);
      io.to(roomCode).emit('updatePlayerList', room.players);
    }
  });

  socket.on('startGame', (roomCode) => {
    const room = rooms[roomCode];
    if (room) {
      room.gameStarted = true;
      room.deck = generateDeck();
      
      room.players.forEach(p => p.hand = room.deck.splice(0, 7));
      
      let first = room.deck.pop();
      while(first.color === 'black') {
        room.deck.unshift(first);
        room.deck = shuffle(room.deck);
        first = room.deck.pop();
      }
      room.discardPile = [first];
      room.currentColor = first.color;

      broadcastState(roomCode);
    }
  });

  socket.on('playCard', ({ roomCode, cardId, selectedColor }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players[room.currentPlayerIndex];
    if (player.id !== socket.id) return;

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;
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

  socket.on('drawCard', (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    if (room.players[room.currentPlayerIndex].id !== socket.id) return;

    drawCards(room, room.players[room.currentPlayerIndex], 1);
    advanceTurn(room);
    broadcastState(roomCode);
  });

  socket.on('REQUEST_GAME_STATE', (roomCode) => {
    const room = rooms[roomCode];
    
    if (!room || !room.gameStarted) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const playerView = {
      ...room,
      deck: room.deck.map(() => ({ color: 'black', type: 'back' })), 
      players: room.players.map(p => {
        if (p.id === socket.id) {
          return p;
        } else {
          return { 
            ...p, 
            hand: p.hand.map(() => ({ color: 'black', type: 'back' }))
          };
        }
      })
    };

    socket.emit('GAME_UPDATE', playerView);
  });

  function advanceTurn(room) {
    const num = room.players.length;
    room.currentPlayerIndex = (room.currentPlayerIndex + room.direction + num) % num;
  }

  function getNextPlayer(room) {
    const num = room.players.length;
    const idx = (room.currentPlayerIndex + room.direction + num) % num;
    return room.players[idx];
  }

  function drawCards(room, player, count) {
    for(let i=0; i<count; i++) {
      if (room.deck.length === 0) {
        if (room.discardPile.length <= 1) return;
        
        const top = room.discardPile.pop();
        room.deck = shuffle(room.discardPile);
        room.discardPile = [top];
        
        io.to(room.code).emit('deckReshuffled'); 
      }
      player.hand.push(room.deck.pop());
    }
  }

  function broadcastState(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    room.players.forEach(player => {
      const playerView = {
        ...room,
        deck: room.deck.map(() => ({ color: 'black', type: 'back' })),
        players: room.players.map(p => {
          if (p.id === player.id) {
            return p;
          } else {
            return {
              ...p,
              hand: p.hand.map(() => ({ color: 'black', type: 'back' }))
            };
          }
        })
      };
      io.to(player.id).emit('GAME_UPDATE', playerView);
    });
  }
});

server.listen(3000, () => console.log('Server running on 3000'));