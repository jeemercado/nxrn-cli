import { DarkTheme, DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import BootSplash from 'react-native-bootsplash';

import { Routes } from '@/routes';
import PrivateRoutes from '@/routes/privateRoutes';
import PublicRoutes from '@/routes/publicRoutes';
import { screenOptions } from '@/routes/screen-options';
import { useLocalStorageStore } from '@/stores';
import { colors } from '@/tailwind';

const RootStack = createNativeStackNavigator();

export const noAnimation = {
  animationEnabled: false,
};

const lightNavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.white,
  },
};

const darkNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
  },
};

export default function ApplicationRoutes() {
  // const { isLoading } = useAuth();
  // const isUserAuthenticated = useLocalStorageState((state) => !!state.accessToken);
  const isUserAuthenticated = false;
  const initialRouteName = isUserAuthenticated ? Routes.PRIVATE : Routes.PUBLIC;
  const colorScheme = useLocalStorageStore((s) => s.colorScheme);
  const isDark = colorScheme === 'dark';

  const navigationTheme = useMemo(
    () => (isDark ? darkNavigationTheme : lightNavigationTheme),
    [isDark],
  );

  // if (isLoading) {
  //   return <ScreenLoader />;
  // }

  const screens = isUserAuthenticated ? (
    <RootStack.Screen component={PrivateRoutes} name={Routes.PRIVATE} />
  ) : (
    <RootStack.Screen component={PublicRoutes} name={Routes.PUBLIC} />
  );

  return (
    <NavigationContainer
      theme={navigationTheme}
      onReady={() => {
        BootSplash.hide();
      }}
    >
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
