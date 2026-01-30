import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export function useAppState() {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState<boolean>(appState.current === 'active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current === 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return appStateVisible;
}
