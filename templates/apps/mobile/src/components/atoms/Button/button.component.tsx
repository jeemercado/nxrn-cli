import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

import { colors, disabledInputStyle, tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types/component.type';
import { Box } from '../Box';
import { Typography } from '../Typography';

type Props = DefaultComponentProps &
  TouchableOpacityProps & {
    activityIndicatorColor?: string;
    buttonStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    isLoading?: boolean;
    textStyle?: StyleProp<TextStyle>;
    title?: string;
  };

const ACTIVE_OPACITY = 0.5;

export function Button(props: Props) {
  const {
    activeOpacity = ACTIVE_OPACITY,
    activityIndicatorColor = colors.white,
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
  const display = children ?? (
    <Typography style={[tw`font-medium text-white`, textStyle]}>{title}</Typography>
  );

  return (
    <TouchableOpacity activeOpacity={activeOpacity} disabled={disabled} style={[style]} {...rest}>
      <Box
        style={[
          tw`bg-primary-700 items-center justify-center rounded-xl p-3`,
          buttonStyle,
          disabledInputStyle(disabled),
        ]}
      >
        {isLoading ? <ActivityIndicator color={activityIndicatorColor} /> : display}
      </Box>
    </TouchableOpacity>
  );
}

export function OutlinedButton(props: Props) {
  const { ...rest } = props;

  return (
    <Button
      {...rest}
      buttonStyle={tw`border-primary-700 border-2 bg-white`}
      textStyle={tw`text-primary-700`}
    />
  );
}
