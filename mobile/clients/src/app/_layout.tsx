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
          title: 'Login',
        }}
      />

      <Stack.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />

      <Stack.Screen
        name="order"
        options={{
          title: 'Create Order',
        }}
      />

      <Stack.Screen
        name="tracking"
        options={{
          title: 'Tracking',
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
