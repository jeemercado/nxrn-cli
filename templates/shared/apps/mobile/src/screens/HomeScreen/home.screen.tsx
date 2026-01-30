import React from 'react';

import { ScreenContainer, Typography } from '@/components';
import { PrivateScreenProps } from '@/routes';
import { Screens } from '@/routes/screens.enum';

export function HomeScreen(props: PrivateScreenProps<Screens.HOME>) {
  return (
    <ScreenContainer>
      <Typography>Home</Typography>
    </ScreenContainer>
  );
}
