import React from 'react';
import { View } from 'react-native';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';

type Props = DefaultComponentProps & {};

export function Divider(props: Props) {
  const { style } = props;

  return <View style={[tw`h-[1px] w-full bg-gray-200`, style]}></View>;
}
