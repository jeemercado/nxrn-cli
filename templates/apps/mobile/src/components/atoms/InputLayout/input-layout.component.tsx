import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';
import { Text } from '../Text';

type Props = DefaultComponentProps & {
  children: React.ReactNode;
  isRequired?: boolean;
  label?: string;
  textStyle?: StyleProp<TextStyle>;
};

export function InputLayout(props: Props) {
  const { children, error, isRequired, label, style, textStyle } = props;

  return (
    <View style={[style]}>
      {label && (
        <Text style={[tw`mb-2 text-gray-600`, textStyle]}>
          {label}
          {isRequired && <Text style={tw`text-red-600`}>{isRequired && '*'}</Text>}
        </Text>
      )}
      {children}
      {!!error && (
        <View style={tw`items-end`}>
          <Text style={tw`text-right text-red-500`}>{error}</Text>
        </View>
      )}
    </View>
  );
}
