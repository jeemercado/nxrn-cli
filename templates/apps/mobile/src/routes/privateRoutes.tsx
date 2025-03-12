import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

import { Screens } from '@/routes';
import { screenOptions } from '@/routes/screen-options';
import { HomeScreen } from '@/screens/HomeScreen/home.screen';

const PrivateStack = createNativeStackNavigator<PrivateStackParams>();

export type PrivateStackParams = {
  [Screens.HOME]: undefined;
};

export type PrivateScreenProps<T extends keyof PrivateStackParams> = NativeStackScreenProps<
  PrivateStackParams,
  T
>;

export type PrivateTabScreenProps<T extends keyof PrivateStackParams> = MaterialTopTabScreenProps<
  PrivateStackParams,
  T
>;

export default function PrivateRoutes() {
  return (
    <BottomSheetModalProvider>
      <PrivateStack.Navigator initialRouteName={Screens.HOME} screenOptions={screenOptions}>
        <PrivateStack.Screen component={HomeScreen} name={Screens.HOME} />
      </PrivateStack.Navigator>
    </BottomSheetModalProvider>
  );
}
