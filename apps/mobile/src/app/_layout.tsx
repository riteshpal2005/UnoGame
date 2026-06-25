import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import '../global.css';

const DeepSlateTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0F172A',
    card: '#0F172A',
    border: '#334155',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DeepSlateTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: '#0F172A' } }}>
        <Stack.Screen name="index" options={{ title: 'Lobby', headerShown: false }} />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: 'Settings', 
            headerStyle: { backgroundColor: '#0F172A' },
            headerTintColor: '#F8FAFC',
            headerShadowVisible: false
          }} 
        />
        <Stack.Screen name="cardTest" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
