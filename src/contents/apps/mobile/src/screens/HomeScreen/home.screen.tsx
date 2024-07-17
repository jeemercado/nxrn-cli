import React from 'react';

import { ScreenContainer, Text } from '../../components';
import { PrivateScreenProps, Screens } from '../../routes';

export function HomeScreen(props: PrivateScreenProps<Screens.HOME>) {
  return (
    <ScreenContainer>
      <Text>Home</Text>
    </ScreenContainer>
  );
}
