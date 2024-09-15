import React from 'react';

import { ScreenContainer, Typography } from '../../components';
import { PrivateScreenProps, Screens } from '../../routes';

export function HomeScreen(props: PrivateScreenProps<Screens.HOME>) {
  return (
    <ScreenContainer>
      <Typography>Home</Typography>
    </ScreenContainer>
  );
}
