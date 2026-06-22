import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDriverSocket } from '@/features/tracking/hooks/useDriverSocket';
import { acceptOrder, getAvailableOrders } from '@/features/orders/services/order.service';
import { orderStore } from '@/features/orders/store/order.store';
import type { Order } from '@/features/orders/types/order';

export default function AvailableOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>(orderStore.getIncomingOrders());
  const [isLoading, setIsLoading] = useState(false);
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
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const availableOrders = await getAvailableOrders();
        orderStore.setIncomingOrders(availableOrders);
        setOrders(availableOrders);
      } catch (err) {
        console.log('AVAILABLE ORDERS ERROR:', err);
        setError('Could not load available orders.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();
  }, []);

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
      console.log('ACCEPT ORDER ERROR:', err);
      setError('Order could not be accepted. It may already be taken.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Orders</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading ? <ActivityIndicator /> : null}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No available orders yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.route}>{`${item.from} -> ${item.to}`}</Text>
            <Text style={styles.meta}>Pickup: {item.pickupLat}, {item.pickupLng}</Text>
            <Text style={styles.meta}>Status: {item.status}</Text>
            <Button title="Accept" onPress={() => void handleAccept(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    color: '#666666',
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  route: {
    fontSize: 17,
    fontWeight: '700',
  },
  meta: {
    color: '#555555',
  },
  error: {
    color: '#b00020',
    marginBottom: 10,
  },
});
