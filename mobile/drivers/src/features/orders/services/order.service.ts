import { api } from '@/services/api';
import type { Order } from '@/features/orders/types/order';

export const getAvailableOrders = async () => {
  const res = await api.get<Order[]>('/orders/available');

  return res.data;
};

export const acceptOrder = async (orderId: string) => {
  const res = await api.patch<Order>(`/orders/${orderId}/accept`);

  return res.data;
};

export const markOrderArrived = async (orderId: string) => {
  const res = await api.patch<Order>(`/orders/${orderId}/arrived`);

  return res.data;
};

export const startOrderTrip = async (orderId: string) => {
  const res = await api.patch<Order>(`/orders/${orderId}/start`);

  return res.data;
};

export const completeOrderTrip = async (orderId: string) => {
  const res = await api.patch<Order>(`/orders/${orderId}/complete`);

  return res.data;
};
