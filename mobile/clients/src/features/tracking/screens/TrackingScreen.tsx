import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useClientSocket } from '@/features/tracking/hooks/useClientSocket';
import {
  getCurrentUserLocation,
  type Coordinates,
} from '@/features/tracking/services/location.service';
import { orderStore } from '@/features/tracking/store/order.store';
import type {
  DriverLocationEvent,
  Order,
  OrderAcceptedEvent,
} from '@/features/tracking/types/order';

const statusTimeline = ['pending', 'accepted', 'arrived', 'started', 'completed'];

export default function TrackingScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const [acceptedOrder, setAcceptedOrder] = useState<OrderAcceptedEvent | null>(
    orderStore.getAcceptedOrder(),
  );
  const [driverLocation, setDriverLocation] = useState<DriverLocationEvent | null>(
    orderStore.getDriverLocation(),
  );
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [latestStatus, setLatestStatus] = useState<Order | null>(orderStore.getActiveOrder());
  const [locationError, setLocationError] = useState('');

  const activeOrder = useMemo(() => orderStore.getActiveOrder(), []);
  const orderId = params.orderId ?? activeOrder?.id;
  const displayedOrder = latestStatus ?? activeOrder;
  const currentStatus = displayedOrder?.status ?? 'pending';
  const pickupLocation = displayedOrder
    ? {
      lat: displayedOrder.pickupLat,
      lng: displayedOrder.pickupLng,
    }
    : null;

  const mapRegion: Region = {
    latitude: driverLocation?.lat ?? userLocation?.lat ?? pickupLocation?.lat ?? 41.311081,
    longitude: driverLocation?.lng ?? userLocation?.lng ?? pickupLocation?.lng ?? 69.240562,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const location = await getCurrentUserLocation();
        setUserLocation(location);
      } catch (err) {
        console.log('CLIENT LOCATION ERROR:', err);
        setLocationError('Location permission or GPS is unavailable.');
      }
    };

    void loadLocation();
  }, []);

  useClientSocket({
    onOrderAccepted: (event) => {
      if (orderId && event.orderId !== orderId) {
        return;
      }

      orderStore.setAcceptedOrder(event);
      setAcceptedOrder(event);

      const current = orderStore.getActiveOrder();

      if (current) {
        const accepted = {
          ...current,
          driverId: event.driverId,
          status: 'accepted' as Order['status'],
        };

        orderStore.setActiveOrder(accepted);
        setLatestStatus(accepted);
      }
    },
    onDriverLocationUpdate: (event) => {
      if (orderId && event.orderId !== orderId) {
        return;
      }

      orderStore.setDriverLocation(event);
      setDriverLocation(event);
    },
    onOrderStatus: (event) => {
      if (orderId && event.id !== orderId) {
        return;
      }

      orderStore.setActiveOrder(event);
      setLatestStatus(event);
    },
  });

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={mapRegion} region={mapRegion}>
        {userLocation ? (
          <Marker
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
            title="You"
            pinColor="blue"
          />
        ) : null}

        {pickupLocation ? (
          <Marker
            coordinate={{
              latitude: pickupLocation.lat,
              longitude: pickupLocation.lng,
            }}
            title="Pickup"
            pinColor="orange"
          />
        ) : null}

        {driverLocation ? (
          <Marker
            coordinate={{
              latitude: driverLocation.lat,
              longitude: driverLocation.lng,
            }}
            title="Driver"
            description={acceptedOrder?.driverId ?? 'Assigned driver'}
            pinColor="green"
          />
        ) : null}
      </MapView>

      <View style={styles.statusCard}>
        <Text style={styles.title}>Live Tracking</Text>
        <Text style={styles.status}>{currentStatus}</Text>

        <View style={styles.timeline}>
          {statusTimeline.map((status) => {
            const isDone =
              statusTimeline.indexOf(status) <= statusTimeline.indexOf(currentStatus);

            return (
              <View key={status} style={styles.timelineItem}>
                <View style={[styles.dot, isDone ? styles.dotDone : null]} />
                <Text style={[styles.timelineText, isDone ? styles.timelineTextDone : null]}>
                  {status}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.label}>Order ID</Text>
        <Text style={styles.value}>{orderId ?? 'No active order yet'}</Text>

        <Text style={styles.label}>Driver Info</Text>
        <Text style={styles.value}>
          {acceptedOrder?.driverId ?? displayedOrder?.driverId ?? 'Waiting for driver'}
        </Text>

        <Text style={styles.label}>Driver Location</Text>
        <Text style={styles.value}>
          {driverLocation
            ? `${driverLocation.lat.toFixed(6)}, ${driverLocation.lng.toFixed(6)}`
            : 'Waiting for live location'}
        </Text>

        {locationError ? <Text style={styles.error}>{locationError}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  map: {
    flex: 1,
  },
  statusCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  status: {
    marginTop: 4,
    color: '#16a34a',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 4,
  },
  timelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d4d4d4',
  },
  dotDone: {
    backgroundColor: '#16a34a',
  },
  timelineText: {
    marginTop: 4,
    color: '#777777',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  timelineTextDone: {
    color: '#111111',
  },
  label: {
    marginTop: 14,
    color: '#666666',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    marginTop: 10,
    color: '#b00020',
  },
});
