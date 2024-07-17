import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import React from 'react';

import { LoginScreen } from '../screens/LoginScreen/login.screen';

import { screenOptions } from './screen-options';
import { Screens } from './screens.enum';

const PublicStack = createStackNavigator<PublicStackParams>();

export type PublicStackParams = {
  [Screens.LOGIN]: undefined;
};

export type PublicScreenProps<T extends keyof PublicStackParams> = StackScreenProps<
  PublicStackParams,
  T
>;

export default function PublicRoutes(): JSX.Element {
  return (
    <PublicStack.Navigator initialRouteName={Screens.LOGIN} screenOptions={screenOptions}>
      <PublicStack.Screen component={LoginScreen} name={Screens.LOGIN} />
    </PublicStack.Navigator>
  );
}
