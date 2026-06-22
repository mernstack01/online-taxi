import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectSocket } from '@/services/socket';

export default function Index() {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      await connectSocket();
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  };

  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}
