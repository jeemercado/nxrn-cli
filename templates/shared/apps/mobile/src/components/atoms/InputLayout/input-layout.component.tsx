import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';

import { Typography } from '@/components/atoms/Typography';
import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps & {
  children?: React.ReactNode;
  isRequired?: boolean;
  label?: string;
  subtitle?: string;
  textStyle?: StyleProp<TextStyle>;
};

export function InputLayout(props: Props) {
  const { children, error, isRequired, label, style, subtitle, textStyle } = props;

  return (
    <View style={[style]}>
      {label && (
        <Typography style={[tw`mb-2 text-gray-600 dark:text-gray-300`, textStyle]}>
          {label}
          {isRequired && <Typography style={tw`text-red-600`}>{isRequired && '*'}</Typography>}
        </Typography>
      )}
      {children}
      {!!error && (
        <View style={tw`mt-1 items-start`}>
          <Typography style={tw`text-right text-xs text-red-500`}>{error}</Typography>
        </View>
      )}
      {!!subtitle && !error && (
        <View style={tw`mt-1 items-start`}>
          <Typography style={tw`dark:text-subtitle text-right text-xs text-gray-400`}>
            {subtitle}
          </Typography>
        </View>
      )}
    </View>
  );
}
