import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

import { tw } from '../../../tailwind';

type Props = TextProps & {
  numberOfLines?: number;
};

export function Text(props: Props): JSX.Element {
  const { numberOfLines = 0, style, ...extraProps } = props;

  const shouldTruncateTextProps: TextProps =
    numberOfLines > 0 ? { ellipsizeMode: 'tail', numberOfLines } : {};

  return (
    <RNText
      {...shouldTruncateTextProps}
      style={[tw`text-black-950 font-sans text-base font-normal`, style]}
      {...extraProps}
    />
  );
}
