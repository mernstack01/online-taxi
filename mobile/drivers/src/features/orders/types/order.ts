export enum OrderStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Arrived = 'arrived',
  Started = 'started',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export type Order = {
  id: string;
  from: string;
  to: string;
  pickupLat: number;
  pickupLng: number;
  userId: string;
  driverId?: string | null;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type DriverLocationPayload = {
  orderId?: string;
  lat: number;
  lng: number;
};
