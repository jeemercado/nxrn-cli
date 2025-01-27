import React from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';

import { GearIcon } from '../../../icons';
import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types/component.type';
import { Typography } from '../../atoms/Typography';
import { BackButton } from '../BackButton';

type Props = DefaultComponentProps & {
  hasBackButton?: boolean;
  extraActionComponent?: React.ReactNode;
  title: string;
  titleStyle?: StyleProp<ViewStyle>;
  onBackPress?: () => void;
  onExtraActionPress?: () => void;
};

const ACTIVE_OPACITY = 0.5;
export function ScreenHeader(props: Props) {
  const {
    extraActionComponent,
    hasBackButton = true,
    onBackPress,
    onExtraActionPress,
    style,
    title,
    titleStyle,
  } = props;

  const hasExtraActionComponent = onExtraActionPress;
  const extraActionComponentDisplay = hasExtraActionComponent && (
    <TouchableOpacity
      activeOpacity={ACTIVE_OPACITY}
      style={tw`z-10 h-[48px] w-[48px]`}
      onPress={onExtraActionPress}
    >
      <View style={[tw`flex-1 items-center justify-center rounded-full`, style]}>
        {extraActionComponent ? (
          extraActionComponent
        ) : (
          <GearIcon height={25} style={tw`text-black-950`} width={25} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[tw`h-[64px] border border-transparent`, style]}>
      <View style={[tw`flex-row items-center justify-between border border-transparent p-4 pt-2`]}>
        {hasBackButton && <BackButton style={tw`z-10`} onPress={onBackPress} />}
        <Typography
          style={[
            tw`text-primary-700 absolute inset-x-0 top-4 text-center text-xl font-medium`,
            titleStyle,
          ]}
        >
          {title}
        </Typography>
        {extraActionComponentDisplay}
      </View>
    </View>
  );
}
