import React from 'react';

import { ScreenContainer, ScreenHeader } from '@/components';
import { PublicScreenProps, Screens } from '@/routes';
import { toast } from '@/utils';

export function LandingScreen(props: PublicScreenProps<Screens.LANDING>) {
  function toastHi() {
    toast('Hi!');
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Landing" onExtraActionPress={toastHi} />
    </ScreenContainer>
  );
}
