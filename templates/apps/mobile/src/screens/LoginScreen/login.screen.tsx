import React from 'react';

import { ScreenContainer, Text } from '../../components';
import { PublicScreenProps, Screens } from '../../routes';
import { tw } from '../../tailwind';

export function LoginScreen(props: PublicScreenProps<Screens.LOGIN>) {
  return (
    <ScreenContainer style={tw`bg-gray-50`}>
      <Text>Login</Text>
    </ScreenContainer>
  );
}
