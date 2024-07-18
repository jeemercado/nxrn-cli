import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';

import { colors, disabledInputStyle, tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types/component.type';
import { Text } from '../Text';

type Props = DefaultComponentProps &
  TouchableOpacityProps & {
    buttonStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    isLoading?: boolean;
    textStyle?: StyleProp<TextStyle>;
    title?: string;
  };

const ACTIVE_OPACITY = 0.5;

export function OutlinedButton(props: Props): JSX.Element {
  const {
    activeOpacity = ACTIVE_OPACITY,
    buttonStyle,
    children,
    isDisabled = false,
    isLoading = false,
    style,
    textStyle,
    title = 'Button',
    ...rest
  } = props;
  const disabled = isDisabled || isLoading;
  const display = children ? (
    children
  ) : (
    <Text style={[tw`text-primary-700 font-medium`, textStyle]}>{title}</Text>
  );

  return (
    <TouchableOpacity activeOpacity={activeOpacity} disabled={disabled} style={[style]} {...rest}>
      <View
        style={[
          tw`border-primary-700 items-center justify-center rounded-md border-2 bg-white p-4`,
          buttonStyle,
          disabledInputStyle(disabled),
        ]}
      >
        {isLoading ? <ActivityIndicator color={colors.primary[100]} /> : display}
      </View>
    </TouchableOpacity>
  );
}
