import React, { JSX } from 'react';
import { Text as RNText, TextProps } from 'react-native';

import { tw } from '@/tailwind';

type Props = TextProps & {
  numberOfLines?: number;
};

export function Typography(props: Props): JSX.Element {
  const { numberOfLines = 0, style, ...extraProps } = props;

  const shouldTruncateTextProps: TextProps =
    numberOfLines > 0 ? { ellipsizeMode: 'tail', numberOfLines } : {};

  return (
    <RNText
      {...shouldTruncateTextProps}
      style={[tw`font-sans text-base font-normal text-black`, style]}
      {...extraProps}
    />
  );
}
