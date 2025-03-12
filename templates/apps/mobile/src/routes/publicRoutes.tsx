import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

import { Screens } from '@/routes';
import { screenOptions } from '@/routes/screen-options';
import { LandingScreen } from '@/screens/LandingScreen/landing.screen';

const PublicStack = createNativeStackNavigator<PublicStackParams>();

export type PublicStackParams = {
  [Screens.LANDING]: undefined;
};

export type PublicScreenProps<T extends keyof PublicStackParams> = NativeStackScreenProps<
  PublicStackParams,
  T
>;

export default function PublicRoutes() {
  return (
    <BottomSheetModalProvider>
      <PublicStack.Navigator initialRouteName={Screens.LANDING} screenOptions={screenOptions}>
        <PublicStack.Screen component={LandingScreen} name={Screens.LANDING} />
      </PublicStack.Navigator>
    </BottomSheetModalProvider>
  );
}
