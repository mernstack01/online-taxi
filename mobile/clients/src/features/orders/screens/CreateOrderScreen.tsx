import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createOrder } from '@/features/orders/services/order.service';
import { orderStore } from '@/features/tracking/store/order.store';

export default function CreateOrderScreen() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [pickupLat, setPickupLat] = useState('');
  const [pickupLng, setPickupLng] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateOrder = async () => {
    setError('');

    const lat = Number(pickupLat);
    const lng = Number(pickupLng);

    if (from.trim().length < 2 || to.trim().length < 2 || Number.isNaN(lat) || Number.isNaN(lng)) {
      setError('From, to, pickupLat and pickupLng are required.');
      return;
    }

    try {
      setIsLoading(true);

      const order = await createOrder({
        from: from.trim(),
        to: to.trim(),
        pickupLat: lat,
        pickupLng: lng,
      });

      orderStore.setActiveOrder(order);
      router.push({
        pathname: '/tracking',
        params: {
          orderId: order.id,
        },
      });
    } catch (err) {
      console.log('CREATE ORDER ERROR:', err);
      setError('Order creation failed. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Order</Text>

      <TextInput value={from} onChangeText={setFrom} placeholder="From" style={styles.input} />
      <TextInput value={to} onChangeText={setTo} placeholder="To" style={styles.input} />
      <TextInput
        value={pickupLat}
        onChangeText={setPickupLat}
        placeholder="Pickup latitude"
        keyboardType="decimal-pad"
        style={styles.input}
      />
      <TextInput
        value={pickupLng}
        onChangeText={setPickupLng}
        placeholder="Pickup longitude"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Create Order" onPress={handleCreateOrder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    color: '#b00020',
    textAlign: 'center',
  },
});
