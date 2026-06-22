import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useDriverSocket } from '@/features/tracking/hooks/useDriverSocket';
import { acceptOrder, getAvailableOrders } from '@/features/orders/services/order.service';
import { orderStore } from '@/features/orders/store/order.store';
import type { Order } from '@/features/orders/types/order';
import { connectDriverSocket, disconnectDriverSocket } from '@/services/socket';

type Point = {
  latitude: number;
  longitude: number;
};

export default function HomeScreen() {
  const [isOnline, setIsOnline] = useState(true);
  const [orders, setOrders] = useState<Order[]>(orderStore.getIncomingOrders());
  const [driverLocation, setDriverLocation] = useState<Point | null>(null);
  const [error, setError] = useState('');

  useDriverSocket({
    onNewOrder: (order) => {
      orderStore.upsertIncomingOrder(order);
      setOrders(orderStore.getIncomingOrders());
    },
    onOrderCancelled: ({ orderId }) => {
      orderStore.removeIncomingOrder(orderId);
      setOrders(orderStore.getIncomingOrders());
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (permission.status === 'granted') {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          setDriverLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }

        const availableOrders = await getAvailableOrders();
        orderStore.setIncomingOrders(availableOrders);
        setOrders(availableOrders);
      } catch (err) {
        console.log('DRIVER HOME ERROR:', err);
        setError('Could not load driver map or orders.');
      }
    };

    void load();
  }, []);

  const region = useMemo(
    () => ({
      latitude: driverLocation?.latitude ?? 41.3111,
      longitude: driverLocation?.longitude ?? 69.2797,
      latitudeDelta: 0.035,
      longitudeDelta: 0.035,
    }),
    [driverLocation],
  );

  const toggleOnline = async (value: boolean) => {
    setIsOnline(value);

    if (value) {
      await connectDriverSocket();
    } else {
      disconnectDriverSocket();
    }
  };

  const handleAccept = async (orderId: string) => {
    try {
      setError('');
      const order = await acceptOrder(orderId);
      orderStore.setActiveOrder(order);
      orderStore.removeIncomingOrder(orderId);
      setOrders(orderStore.getIncomingOrders());
      router.push({
        pathname: './active-order',
        params: {
          orderId,
        },
      });
    } catch (err) {
      console.log('DRIVER HOME ACCEPT ERROR:', err);
      setError('Order could not be accepted.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation>
        {driverLocation ? (
          <Marker coordinate={driverLocation} title="You" pinColor="#2563eb" />
        ) : null}
        {orders.map((order) => (
          <Marker
            key={order.id}
            coordinate={{ latitude: order.pickupLat, longitude: order.pickupLng }}
            title={`${order.from} -> ${order.to}`}
            pinColor="#f97316"
          />
        ))}
      </MapView>

      <View style={styles.topBar}>
        <Text style={styles.title}>Driver</Text>
        <View style={styles.toggle}>
          <Text style={styles.toggleText}>{isOnline ? 'Online' : 'Offline'}</Text>
          <Switch value={isOnline} onValueChange={(value) => void toggleOnline(value)} />
        </View>
      </View>

      <View style={styles.panel}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FlatList
          horizontal
          data={orders}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No incoming orders.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.route}>{`${item.from} -> ${item.to}`}</Text>
              <Text style={styles.meta}>
                Pickup: {item.pickupLat.toFixed(5)}, {item.pickupLng.toFixed(5)}
              </Text>
              <Button title="Accept Order" onPress={() => void handleAccept(item.id)} />
            </View>
          )}
        />

        <View style={styles.actions}>
          <Button title="Available Orders" onPress={() => router.push('./available-orders')} />
          <Button title="Active Order" onPress={() => router.push('./active-order')} />
          <Button title="Profile" onPress={() => router.push('./profile')} />
        </View>
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
  topBar: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleText: {
    fontWeight: '700',
  },
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    gap: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    width: 260,
    marginRight: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 10,
    padding: 12,
  },
  route: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: '#555555',
  },
  empty: {
    paddingVertical: 12,
    color: '#666666',
  },
  error: {
    color: '#b00020',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
