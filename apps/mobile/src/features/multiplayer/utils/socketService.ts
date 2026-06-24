import { io, Socket } from 'socket.io-client';

class SocketService {
  socket: Socket | null = null;

  connect(url: string) {
    if (this.socket) {
        this.socket.disconnect();
    }
    
    console.log(`Connecting to LAN Server: ${url}`);
    this.socket = io(url, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Server:', this.socket?.id);
    });

    this.socket.on('connect_error', (err) => {
      console.log('❌ Connection Error:', err.message);
    });
  }

  emit(event: string, data: any = {}) {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const socketService = new SocketService();