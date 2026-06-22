import { api } from '@/services/api';
import type { CreateOrderInput, Order } from '@/features/tracking/types/order';

export const createOrder = async (input: CreateOrderInput) => {
  const res = await api.post<Order>('/orders', input);

  return res.data;
};
