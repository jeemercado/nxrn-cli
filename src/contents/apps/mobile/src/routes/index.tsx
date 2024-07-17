import { DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';

import CONFIG from '../config';
import { colors } from '../tailwind';

import PrivateRoutes from './privateRoutes';
import PublicRoutes from './publicRoutes';
import { Routes } from './routes.enum';
import { screenOptions } from './screen-options';

const RootStack = createStackNavigator();

export const noAnimation = {
  animationEnabled: false,
};

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.gray[50],
  },
};

export default function ApplicationRoutes(): JSX.Element {
  // const { isLoading } = useAuth();
  // const isUserAuthenticated = useLocalStorageState((state) => !!state.accessToken);
  const isUserAuthenticated = false;
  const initialRouteName = isUserAuthenticated ? Routes.PRIVATE : Routes.PUBLIC;

  useEffect(() => {
    StatusBar.setHidden(false);
    if (CONFIG.IS_ANDROID) {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
  }, []);

  // if (isLoading) {
  //   return <ScreenLoader />;
  // }

  const screens = isUserAuthenticated ? (
    <RootStack.Screen component={PrivateRoutes} name={Routes.PRIVATE} />
  ) : (
    <RootStack.Screen component={PublicRoutes} name={Routes.PUBLIC} />
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator initialRouteName={initialRouteName} screenOptions={screenOptions}>
        {screens}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export type { PrivateScreenProps, PrivateStackParams } from './privateRoutes';
export type { PublicScreenProps, PublicStackParams } from './publicRoutes';
export * from './routes.enum';
export * from './screen-options';
export * from './screens.enum';
