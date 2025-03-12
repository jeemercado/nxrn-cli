import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors, tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps;

export function ScreenLoader(props: Props) {
  const { style } = props;

  return (
    <View style={[tw`h-full w-full items-center justify-center bg-gray-50 p-8`, style]}>
      <ActivityIndicator color={colors.primary[400]} />
    </View>
  );
}
