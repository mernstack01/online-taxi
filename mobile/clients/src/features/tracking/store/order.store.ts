import type {
  DriverLocationEvent,
  Order,
  OrderAcceptedEvent,
} from '@/features/tracking/types/order';

let activeOrder: Order | null = null;
let acceptedOrder: OrderAcceptedEvent | null = null;
let driverLocation: DriverLocationEvent | null = null;

export const orderStore = {
  getActiveOrder() {
    return activeOrder;
  },
  setActiveOrder(order: Order | null) {
    activeOrder = order;
  },
  getAcceptedOrder() {
    return acceptedOrder;
  },
  setAcceptedOrder(event: OrderAcceptedEvent | null) {
    acceptedOrder = event;
  },
  getDriverLocation() {
    return driverLocation;
  },
  setDriverLocation(event: DriverLocationEvent | null) {
    driverLocation = event;
  },
};
