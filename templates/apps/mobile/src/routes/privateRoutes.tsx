import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import React from 'react';

import { HomeScreen } from '../screens/HomeScreen/home.screen';

import { screenOptions } from './screen-options';
import { Screens } from './screens.enum';

const PrivateStack = createStackNavigator<PrivateStackParams>();

export type PrivateStackParams = {
  [Screens.HOME]: undefined;
};

export type PrivateScreenProps<T extends keyof PrivateStackParams> = StackScreenProps<
  PrivateStackParams,
  T
>;

export type PrivateTabScreenProps<T extends keyof PrivateStackParams> = MaterialTopTabScreenProps<
  PrivateStackParams,
  T
>;

export default function PrivateRoutes(): JSX.Element {
  return (
    <PrivateStack.Navigator initialRouteName={Screens.HOME} screenOptions={screenOptions}>
      <PrivateStack.Screen component={HomeScreen} name={Screens.HOME} />
    </PrivateStack.Navigator>
  );
}
