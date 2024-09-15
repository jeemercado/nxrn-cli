import React from 'react';

import {
  BottomSheet,
  Box,
  Button,
  OutlinedButton,
  ScreenContainer,
  ScreenHeader,
  Typography,
  useBottomSheet,
} from '../../components';
import { useToggleDarkMode } from '../../hooks';
import { PublicScreenProps, Screens } from '../../routes';
import { tw } from '../../tailwind';

export function LandingScreen(props: PublicScreenProps<Screens.LANDING>) {
  const toggleDarkMode = useToggleDarkMode();
  const { expandSheet, sheetRef } = useBottomSheet();

  return (
    <ScreenContainer>
      <ScreenHeader title="Landing" onExtraActionPress={toggleDarkMode} />
      <Box style={tw`mx-4`}>
        <Box row style={tw`gap-2`}>
          <Button title="Show Bottom Sheet" onPress={expandSheet} />
          <OutlinedButton title="Login" />
        </Box>
      </Box>
      <BottomSheet sheetRef={sheetRef}>
        <Box>
          <Typography>Bottom Sheet</Typography>
        </Box>
      </BottomSheet>
    </ScreenContainer>
  );
}
