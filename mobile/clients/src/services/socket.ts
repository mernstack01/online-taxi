import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import type { DriverLocationEvent, Order } from '@/features/tracking/types/order';

export const socket = io('http://10.29.160.135:9000', {
  autoConnect: false,
});

socket.on('connect', () => {
  console.log('CONNECTED', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('DISCONNECTED', reason);
});

socket.on('connect_error', (error) => {
  console.log('CONNECT ERROR', error.message);
});

export const connectSocket = async () => {
  const token = await AsyncStorage.getItem('token');

  if (!token) {
    return false;
  }

  socket.auth = {
    token,
  };

  if (socket.connected) {
    socket.emit('join');
    return true;
  }

  socket.once('connect', () => {
    socket.emit('join');
  });

  socket.connect();

  return true;
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const onOrderAccepted = (
  callback: (data: { orderId: string; driverId: string }) => void,
) => {
  socket.on('orderAccepted', callback);

  return () => {
    socket.off('orderAccepted', callback);
  };
};

export const onDriverLocationUpdate = (
  callback: (data: DriverLocationEvent) => void,
) => {
  socket.on('driverLocationUpdate', callback);
  socket.on('driverLocation', callback);

  return () => {
    socket.off('driverLocationUpdate', callback);
    socket.off('driverLocation', callback);
  };
};

export const onOrderStatus = (
  event: 'orderArrived' | 'orderStarted' | 'orderCompleted' | 'orderStatusChanged',
  callback: (data: Order) => void,
) => {
  socket.on(event, callback);

  return () => {
    socket.off(event, callback);
  };
};
