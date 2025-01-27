import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';
import { Typography } from '../Typography';

type Props = DefaultComponentProps & {
  children?: React.ReactNode;
  isRequired?: boolean;
  label?: string;
  textStyle?: StyleProp<TextStyle>;
};

export function InputLayout(props: Props) {
  const { children, error, isRequired, label, style, textStyle } = props;

  return (
    <View style={[style]}>
      {label && (
        <Typography style={[tw`mb-2 text-gray-600`, textStyle]}>
          {label}
          {isRequired && <Typography style={tw`text-red-600`}>{isRequired && '*'}</Typography>}
        </Typography>
      )}
      {children}
      {!!error && (
        <View style={tw`items-end`}>
          <Typography style={tw`text-right text-red-500`}>{error}</Typography>
        </View>
      )}
    </View>
  );
}
