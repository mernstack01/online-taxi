import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import {
  watchDriverLocation,
  type Coordinates,
} from '@/features/tracking/services/location.service';
import {
  completeOrderTrip,
  markOrderArrived,
  startOrderTrip,
} from '@/features/orders/services/order.service';
import { sendDriverLocation } from '@/services/socket';
import { orderStore } from '@/features/orders/store/order.store';
import { OrderStatus } from '@/features/orders/types/order';

export default function ActiveOrderScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const activeOrder = useMemo(() => orderStore.getActiveOrder(), []);
  const orderId = params.orderId ?? activeOrder?.id;
  const [currentOrder, setCurrentOrder] = useState(activeOrder);
  const [lastLocation, setLastLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState('');
  const pickupLocation = currentOrder
    ? {
      lat: currentOrder.pickupLat,
      lng: currentOrder.pickupLng,
    }
    : null;

  const mapRegion: Region = {
    latitude: lastLocation?.lat ?? pickupLocation?.lat ?? 41.311081,
    longitude: lastLocation?.lng ?? pickupLocation?.lng ?? 69.240562,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let subscription: { remove: () => void } | null = null;

    const startLocationWatch = async () => {
      try {
        subscription = await watchDriverLocation((location) => {
          setLastLocation(location);
          sendDriverLocation({
            orderId,
            ...location,
          });
        });
      } catch (err) {
        console.log('DRIVER LOCATION ERROR:', err);
        setError('Location permission or GPS is unavailable.');
      }
    };

    void startLocationWatch();

    return () => {
      subscription?.remove();
    };
  }, [orderId]);

  const updateStatus = async (
    nextStatus: OrderStatus.Arrived | OrderStatus.Started | OrderStatus.Completed,
  ) => {
    if (!orderId) {
      return;
    }

    try {
      setError('');

      const updatedOrder =
        nextStatus === OrderStatus.Arrived
          ? await markOrderArrived(orderId)
          : nextStatus === OrderStatus.Started
            ? await startOrderTrip(orderId)
            : await completeOrderTrip(orderId);

      orderStore.setActiveOrder(updatedOrder);
      setCurrentOrder(updatedOrder);
    } catch (err) {
      console.log('ORDER STATUS ERROR:', err);
      setError('Could not update order status.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={mapRegion} region={mapRegion}>
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

        {lastLocation ? (
          <Marker
            coordinate={{
              latitude: lastLocation.lat,
              longitude: lastLocation.lng,
            }}
            title="Driver"
            pinColor="green"
          />
        ) : null}
      </MapView>

      <View style={styles.card}>
        <Text style={styles.title}>Active Order</Text>
        <Text style={styles.label}>Order ID</Text>
        <Text style={styles.value}>{orderId ?? 'No active order'}</Text>
        <Text style={styles.label}>Route</Text>
        <Text style={styles.value}>
          {currentOrder ? `${currentOrder.from} -> ${currentOrder.to}` : 'Open an order first'}
        </Text>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{currentOrder?.status ?? 'waiting'}</Text>
        <Text style={styles.label}>Last Sent Location</Text>
        <Text style={styles.value}>
          {lastLocation
            ? `${lastLocation.lat.toFixed(6)}, ${lastLocation.lng.toFixed(6)}`
            : 'Waiting for GPS'}
        </Text>

        <View style={styles.actions}>
          <Button
            title="Arrived"
            onPress={() => void updateStatus(OrderStatus.Arrived)}
            disabled={!orderId || currentOrder?.status === OrderStatus.Completed}
          />
          <Button
            title="Start Trip"
            onPress={() => void updateStatus(OrderStatus.Started)}
            disabled={!orderId || currentOrder?.status === OrderStatus.Completed}
          />
          <Button
            title="Complete Trip"
            onPress={() => void updateStatus(OrderStatus.Completed)}
            disabled={!orderId || currentOrder?.status === OrderStatus.Completed}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
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
  card: {
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
  actions: {
    gap: 8,
    marginTop: 12,
  },
  error: {
    marginTop: 16,
    color: '#b00020',
  },
});
