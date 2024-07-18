import CONFIG from '../config';

const areGesturesEnabled = CONFIG.IS_IOS;

export const screenOptions = {
  gestureEnabled: areGesturesEnabled,
  gestureResponseDistance: 350,
  headerShown: false,
};
