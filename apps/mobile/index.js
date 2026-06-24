import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

export function App() {
  // Explicitly require the app directory to bypass EXPO_ROUTER_APP_ROOT resolution errors
  const ctx = require.context('./src/app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
