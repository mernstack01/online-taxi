import { useEffect, useRef } from 'react';
import {
  connectDriverSocket,
  onNewOrder,
  onOrderCancelled,
  sendDriverLocation,
} from '@/services/socket';
import { watchDriverLocation } from '@/features/tracking/services/location.service';
import type { Order } from '@/features/orders/types/order';

type UseDriverSocketOptions = {
  onNewOrder?: (order: Order) => void;
  onOrderCancelled?: (data: { orderId: string }) => void;
};

export const useDriverSocket = (options: UseDriverSocketOptions) => {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    void connectDriverSocket();

    const cleanupNewOrder = onNewOrder((order) => {
      optionsRef.current.onNewOrder?.(order);
    });

    const cleanupCancelled = onOrderCancelled((data) => {
      optionsRef.current.onOrderCancelled?.(data);
    });

    let locationSubscription: { remove: () => void } | null = null;

    const startLocationBroadcast = async () => {
      try {
        locationSubscription = await watchDriverLocation((location) => {
          sendDriverLocation(location);
        });
      } catch (err) {
        console.log('DRIVER LOCATION BROADCAST ERROR:', err);
      }
    };

    void startLocationBroadcast();

    return () => {
      cleanupNewOrder?.();
      cleanupCancelled?.();
      locationSubscription?.remove();
    };
  }, []);
};
