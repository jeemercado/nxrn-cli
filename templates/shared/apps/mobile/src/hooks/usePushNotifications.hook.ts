import { useEffect } from 'react';
import { AppState, AppStateStatus, Linking } from 'react-native';
import { checkNotifications, requestNotifications, RESULTS } from 'react-native-permissions';

import { Alert } from '@/components/atoms';
import { useLocalStorageStore } from '@/stores/local-storage.store';
import { devLog } from '@/utils/log.util';

function showEnableNotificationsAlert() {
  Alert.info({
    actions: [
      { label: 'Later', variant: 'cancel' },
      { label: 'Open Settings', onPress: () => Linking.openSettings() },
    ],
    message: 'Enable notifications to stay updated with important alerts and messages.',
    title: 'Notifications Disabled',
  });
}

function isGranted(status: string): boolean {
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
}

// TODO: Implement once @react-native-firebase/messaging is installed
async function registerFcmToken() {
  devLog('registerFcmToken: Firebase messaging not configured yet');
}

// TODO: Implement once @react-native-firebase/messaging is installed
async function removeFcmToken() {
  devLog('removeFcmToken: Firebase messaging not configured yet');
}

function syncPushNotificationState(status: string) {
  useLocalStorageStore.getState().setPushNotificationsEnabled(isGranted(status));
}

export async function requestPushNotification() {
  const { status } = await checkNotifications();
  syncPushNotificationState(status);

  if (isGranted(status)) {
    await registerFcmToken();

    return;
  }

  const { status: requestStatus } = await requestNotifications([]);

  if (isGranted(requestStatus)) {
    syncPushNotificationState(requestStatus);
    await registerFcmToken();

    return;
  }

  const isBlocked = status === RESULTS.BLOCKED || requestStatus === RESULTS.BLOCKED;
  if (isBlocked) {
    showEnableNotificationsAlert();
  }
}

async function handleAppForeground() {
  const { status } = await checkNotifications();
  syncPushNotificationState(status);

  if (!isGranted(status)) {
    return;
  }

  await registerFcmToken();
}

export async function removeCurrentFcmToken(): Promise<void> {
  try {
    await removeFcmToken();
  } catch (error) {
    devLog('Failed to remove FCM token:', error);
  }
}

export function usePushNotifications(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        return;
      }

      handleAppForeground().catch((error) => {
        devLog('Failed to check notification permission on foreground:', error);
      });
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);
}
