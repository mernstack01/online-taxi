import { useDriverSocket } from '@/features/tracking/hooks/useDriverSocket';
import { router } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  useDriverSocket({});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Home</Text>
      <Text style={styles.subtitle}>You are connected to the driver realtime room.</Text>
      <View style={styles.actions}>
        <Button title="Available Orders" onPress={() => router.push('./available-orders')} />
        <Button title="Active Order" onPress={() => router.push('./active-order')} />
        <Button title="Profile" onPress={() => router.push('./profile')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginVertical: 16,
    color: '#555555',
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
});
