import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useClientSocket } from '@/features/tracking/hooks/useClientSocket';
import { createOrder } from '@/features/orders/services/order.service';
import { orderStore } from '@/features/tracking/store/order.store';

type Point = {
  latitude: number;
  longitude: number;
};

export default function HomeScreen() {
  const [currentLocation, setCurrentLocation] = useState<Point | null>(null);
  const [pickupLocation, setPickupLocation] = useState<Point | null>(null);
  const [from, setFrom] = useState('Current location');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useClientSocket({});

  useEffect(() => {
    const loadLocation = async () => {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setError('Location permission is required for map ordering.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const point = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setCurrentLocation(point);
      setPickupLocation(point);
    };

    void loadLocation();
  }, []);

  const region = useMemo(
    () => ({
      latitude: pickupLocation?.latitude ?? currentLocation?.latitude ?? 41.3111,
      longitude: pickupLocation?.longitude ?? currentLocation?.longitude ?? 69.2797,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    }),
    [currentLocation, pickupLocation],
  );

  const handleCreateOrder = async () => {
    setError('');

    if (!pickupLocation || from.trim().length < 2 || to.trim().length < 2) {
      setError('Pickup and destination are required.');
      return;
    }

    try {
      setIsLoading(true);

      const order = await createOrder({
        from: from.trim(),
        to: to.trim(),
        pickupLat: pickupLocation.latitude,
        pickupLng: pickupLocation.longitude,
      });

      orderStore.setActiveOrder(order);
      router.push({
        pathname: '/tracking',
        params: {
          orderId: order.id,
        },
      });
    } catch (err) {
      console.log('CLIENT HOME CREATE ORDER ERROR:', err);
      setError('Order creation failed. Check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation
        onPress={(event) => setPickupLocation(event.nativeEvent.coordinate)}
      >
        {currentLocation ? (
          <Marker coordinate={currentLocation} title="You" pinColor="#2563eb" />
        ) : null}
        {pickupLocation ? (
          <Marker coordinate={pickupLocation} title="Pickup" pinColor="#16a34a" />
        ) : null}
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.title}>Taxi Client</Text>
        <TextInput value={from} onChangeText={setFrom} placeholder="From" style={styles.input} />
        <TextInput value={to} onChangeText={setTo} placeholder="Where to?" style={styles.input} />
        {pickupLocation ? (
          <Text style={styles.meta}>
            Pickup: {pickupLocation.latitude.toFixed(5)}, {pickupLocation.longitude.toFixed(5)}
          </Text>
        ) : (
          <Text style={styles.meta}>Tap the map to select pickup.</Text>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Button title="Create Order" onPress={handleCreateOrder} />
        )}

        <View style={styles.actions}>
          <Button title="Tracking" onPress={() => router.push('/tracking')} />
          <Button title="Profile" onPress={() => router.push('/profile')} />
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
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    gap: 10,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6d6d6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  meta: {
    color: '#555555',
    fontSize: 12,
  },
  error: {
    color: '#b00020',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
});
