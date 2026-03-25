import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthUser } from '../middleware/auth';

let io: Server;

export function initSocket(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as AuthUser;
    console.log(`User connected: ${user.badgeNumber} (${user.role})`);

    // Join role-based rooms
    socket.join(`role:${user.role}`);
    socket.join(`user:${user.id}`);

    // Handle GPS updates via socket
    socket.on('gps_update', (data: { latitude: number; longitude: number }) => {
      // Broadcast GPS update to admins/ecos
      io.to('role:admin').to('role:eco').emit('gps_updated', {
        userId: user.id,
        ...data,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.badgeNumber}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

// Emit helpers
export function emitAlertCreated(alert: any) {
  io?.emit('alert_created', alert);
}

export function emitAlertUpdated(alert: any) {
  io?.emit('alert_updated', alert);
}

export function emitEmergencyModeChanged(data: {
  mode: string | null;
  alert?: any;
}) {
  io?.emit('emergency_mode_changed', data);
}

export function emitReceiptConfirmed(data: {
  alertId: string;
  userId: string;
}) {
  io?.to('role:admin').to('role:eco').to('role:supervisor').emit('receipt_confirmed', data);
}

export function emitUserStatusChanged(data: {
  userId: string;
  status: string;
}) {
  io?.to('role:admin').to('role:eco').to('role:supervisor').emit('user_status_changed', data);
}

export function emitZoneUpdated(zone: any) {
  io?.emit('zone_updated', zone);
}

export function emitToUser(userId: string, event: string, data: any) {
  io?.to(`user:${userId}`).emit(event, data);
}
