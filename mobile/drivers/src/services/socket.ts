import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import type { DriverLocationPayload, Order } from '@/features/orders/types/order';

export const socket = io('http://10.29.160.135:9000', {
  autoConnect: false,
});

socket.on('connect', () => {
  console.log('DRIVER SOCKET CONNECTED', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('DRIVER SOCKET DISCONNECTED', reason);
});

socket.on('connect_error', (error) => {
  console.log('DRIVER SOCKET CONNECT ERROR', error.message);
});

export const connectDriverSocket = async () => {
  const token = await AsyncStorage.getItem('token');

  if (!token) {
    return false;
  }

  socket.auth = {
    token,
  };

  if (socket.connected) {
    socket.emit('joinDriver');
    return true;
  }

  socket.once('connect', () => {
    socket.emit('joinDriver');
  });

  socket.connect();

  return true;
};

export const disconnectDriverSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const onNewOrder = (callback: (order: Order) => void) => {
  socket.on('newOrder', callback);

  return () => {
    socket.off('newOrder', callback);
  };
};

export const onOrderCancelled = (callback: (data: { orderId: string }) => void) => {
  socket.on('orderCancelled', callback);

  return () => {
    socket.off('orderCancelled', callback);
  };
};

export const sendDriverLocation = (payload: DriverLocationPayload) => {
  socket.emit('driverLocation', payload);
};

export const markOrderArrived = (orderId: string) => {
  socket.emit('orderArrived', { orderId });
};

export const markOrderStarted = (orderId: string) => {
  socket.emit('orderStarted', { orderId });
};

export const markOrderCompleted = (orderId: string) => {
  socket.emit('orderCompleted', { orderId });
};
