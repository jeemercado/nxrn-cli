import React from 'react';
import { View } from 'react-native';

import {
  BottomSheet,
  Button,
  Divider,
  OutlinedButton,
  ScreenContainer,
  ScreenHeader,
  Typography,
  useBottomSheet,
} from '@/components';
import { ArrowLeftIcon, HomeIcon } from '@/icons';
import { PublicScreenProps, Screens } from '@/routes';
import { tw } from '@/tailwind';
import { toast } from '@/utils';

export function LandingScreen(props: PublicScreenProps<Screens.LANDING>) {
  const { expandSheet, sheetRef } = useBottomSheet();

  function toastHi() {
    toast('Hi!');
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Landing" onExtraActionPress={toastHi} />
      <ArrowLeftIcon />
      <Divider />
      <HomeIcon />
      <View style={tw`mx-4`}>
        <View style={tw`gap-2`}>
          <Button title="Show Bottom Sheet" onPress={expandSheet} />
          <OutlinedButton title="Login" />
        </View>
      </View>
      <BottomSheet sheetRef={sheetRef}>
        <View>
          <Typography>Bottom Sheet</Typography>
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}
