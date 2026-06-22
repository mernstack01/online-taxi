export type CreateOrderInput = {
  from: string;
  to: string;
  pickupLat: number;
  pickupLng: number;
};

export enum OrderStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Arrived = 'arrived',
  Started = 'started',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export type Order = CreateOrderInput & {
  id: string;
  status: OrderStatus;
  userId: string;
  driverId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderAcceptedEvent = {
  orderId: string;
  driverId: string;
};

export type DriverLocationEvent = {
  lat: number;
  lng: number;
  orderId: string;
};
