import React from 'react';
import { ActivityIndicator } from 'react-native';

import { colors, tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types/component.type';
import { Box } from '../Box';

type Props = DefaultComponentProps;

export function ScreenLoader(props: Props) {
  const { style } = props;

  return (
    <Box style={[tw`h-full w-full items-center justify-center bg-gray-50 p-8`, style]}>
      <ActivityIndicator color={colors.primary[400]} />
    </Box>
  );
}
