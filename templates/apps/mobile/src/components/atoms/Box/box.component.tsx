import React from 'react';
import { View, ViewProps } from 'react-native';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';

type Props = DefaultComponentProps &
  ViewProps & {
    row?: boolean;
  };

export function Box(props: Props) {
  const { row, style, ...rest } = props;

  return (
    <View
      style={[tw`bg-gray-50 dark:bg-gray-900`, row && tw`flex-row items-center`, style]}
      {...rest}
    />
  );
}
