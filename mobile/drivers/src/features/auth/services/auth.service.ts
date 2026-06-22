import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';

type LoginResponse = {
  accessToken: string;
};

export const login = async (phone: string, password: string) => {
  const res = await api.post<LoginResponse>('/auth/login', {
    phone,
    password,
  });

  const token = res.data.accessToken;

  await AsyncStorage.setItem('token', token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;

  return res.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  delete api.defaults.headers.common.Authorization;
};
