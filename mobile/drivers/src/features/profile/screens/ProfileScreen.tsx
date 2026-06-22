import { Button, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { logout } from '@/features/auth/services/auth.service';

export default function ProfileScreen() {
  const handleLogout = async () => {
    await logout();
    router.replace('./login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Profile</Text>
      <Text style={styles.subtitle}>Driver realtime session is active.</Text>
      <Button title="Logout" onPress={() => void handleLogout()} />
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
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginVertical: 16,
    color: '#555555',
    textAlign: 'center',
  },
});
