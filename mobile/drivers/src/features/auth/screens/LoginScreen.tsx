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
import { login } from '@/features/auth/services/auth.service';
import { connectDriverSocket } from '@/services/socket';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (phone.trim().length < 9 || password.length < 6) {
      setError("Telefon yoki parol noto'g'ri kiritilgan.");
      return;
    }

    try {
      setIsLoading(true);
      await login(phone.trim(), password);
      await connectDriverSocket();
      router.replace('./home');
    } catch (err) {
      console.log('DRIVER LOGIN ERROR:', err);
      setError('Driver login failed. Check credentials and role.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Login</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Phone"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading ? <ActivityIndicator /> : <Button title="Login" onPress={handleLogin} />}
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
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    color: '#b00020',
    textAlign: 'center',
  },
});
