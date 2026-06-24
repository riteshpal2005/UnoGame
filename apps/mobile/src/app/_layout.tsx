import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../src/global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Lobby', headerShown: false }} />
      </Stack>
    </>
  );
}
