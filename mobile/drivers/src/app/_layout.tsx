import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Driver Login',
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          title: 'Driver Home',
        }}
      />
      <Stack.Screen
        name="available-orders"
        options={{
          title: 'Available Orders',
        }}
      />
      <Stack.Screen
        name="active-order"
        options={{
          title: 'Active Order',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Stack>
  );
}
