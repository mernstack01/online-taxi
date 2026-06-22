import { useEffect, useRef } from 'react';
import {
  connectSocket,
  onDriverLocationUpdate,
  onOrderAccepted,
  onOrderStatus,
} from '@/services/socket';
import type {
  DriverLocationEvent,
  Order,
  OrderAcceptedEvent,
} from '@/features/tracking/types/order';

type UseClientSocketOptions = {
  onOrderAccepted?: (event: OrderAcceptedEvent) => void;
  onDriverLocationUpdate?: (event: DriverLocationEvent) => void;
  onOrderStatus?: (event: Order) => void;
};

export const useClientSocket = (options: UseClientSocketOptions) => {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    void connectSocket();

    const cleanupOrderAccepted = onOrderAccepted((event) => {
      optionsRef.current.onOrderAccepted?.(event);
    });

    const cleanupDriverLocation = onDriverLocationUpdate((event) => {
      optionsRef.current.onDriverLocationUpdate?.(event);
    });

    const cleanupArrived = onOrderStatus('orderArrived', (event) => {
      optionsRef.current.onOrderStatus?.(event);
    });

    const cleanupStarted = onOrderStatus('orderStarted', (event) => {
      optionsRef.current.onOrderStatus?.(event);
    });

    const cleanupCompleted = onOrderStatus('orderCompleted', (event) => {
      optionsRef.current.onOrderStatus?.(event);
    });

    const cleanupStatusChanged = onOrderStatus('orderStatusChanged', (event) => {
      optionsRef.current.onOrderStatus?.(event);
    });

    return () => {
      cleanupOrderAccepted?.();
      cleanupDriverLocation?.();
      cleanupArrived?.();
      cleanupStarted?.();
      cleanupCompleted?.();
      cleanupStatusChanged?.();
    };
  }, []);
};
