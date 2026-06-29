import { useEffect } from 'react';
import { AppState } from 'react-native';
import { allowScreenCaptureAsync } from 'expo-screen-capture';
import PantallaMapa from './src/screens/PantallaMapa';

export default function App() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        allowScreenCaptureAsync().catch(() => {});
      }
    });
    allowScreenCaptureAsync().catch(() => {});
    return () => subscription.remove();
  }, []);

  return <PantallaMapa />;
}
