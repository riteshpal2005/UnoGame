import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (ip: string): Socket => {
  if (socket) socket.disconnect();
  
  let url = ip.trim();
  if (!url.includes(':')) url += ":3000"; 
  if (!url.startsWith('http')) url = "http://" + url;

  socket = io(url);
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};