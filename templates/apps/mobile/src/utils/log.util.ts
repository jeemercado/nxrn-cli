/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* global __DEV__ */
import SimpleToast from 'react-native-simple-toast';

export const devLog = (message?: any, ...optionalParams: any[]) => {
  if (__DEV__) {
    console.log(message, ...optionalParams);
  }
};

export const logToast = (message?: any, ...optionalParams: any[]) => {
  if (__DEV__) {
    devLog(message, ...optionalParams);
    SimpleToast.show(message, SimpleToast.SHORT);
  }
};

export const toast = (message: string) => {
  SimpleToast.show(message, SimpleToast.SHORT);
};

export function comingSoon() {
  toast('Feature coming soon');
}

export const prettyJSON = (obj: any) => JSON.stringify(obj, null, 2);

export const startTimer = () => Date.now();

export const endTimer = (startTime: number, label = 'total duration', enableDebug = false) => {
  const endTime = Date.now();
  const duration = endTime - startTime;

  if (enableDebug) {
    devLog(`${label}: ${duration}ms`);
  }

  return duration;
};
