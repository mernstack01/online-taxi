import type { Order } from '@/features/orders/types/order';

let incomingOrders: Order[] = [];
let activeOrder: Order | null = null;

export const orderStore = {
  getIncomingOrders() {
    return incomingOrders;
  },
  setIncomingOrders(orders: Order[]) {
    incomingOrders = orders;
  },
  upsertIncomingOrder(order: Order) {
    incomingOrders = [order, ...incomingOrders.filter((item) => item.id !== order.id)];
  },
  removeIncomingOrder(orderId: string) {
    incomingOrders = incomingOrders.filter((order) => order.id !== orderId);
  },
  getActiveOrder() {
    return activeOrder;
  },
  setActiveOrder(order: Order | null) {
    activeOrder = order;
  },
};
