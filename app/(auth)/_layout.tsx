import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="user/login" />
      <Stack.Screen name="user/signup" />
      <Stack.Screen name="artist/login" />
      <Stack.Screen name="artist/signup" />
    </Stack>
  );
}
