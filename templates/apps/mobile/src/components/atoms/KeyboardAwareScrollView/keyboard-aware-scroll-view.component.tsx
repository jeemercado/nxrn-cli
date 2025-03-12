import React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated from 'react-native-reanimated';

import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps & {
  children?: React.ReactNode;
  scrollViewRef?: React.RefObject<RNKeyboardAwareScrollView>;
  containerStyle?: StyleProp<ViewStyle>;
  extraBottomPadding?: number;
  refreshControl?: React.ReactElement<RefreshControlProps> | undefined;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const defaultStyle = tw`grow`;

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(RNKeyboardAwareScrollView);

export function KeyboardAwareScrollView(props: Props) {
  const {
    children,
    containerStyle,
    extraBottomPadding,
    onScroll,
    refreshControl,
    scrollViewRef,
    style,
  } = props;

  const defaultContainerStyle = [
    defaultStyle,
    containerStyle,
    // eslint-disable-next-line no-magic-numbers
    extraBottomPadding && tw`pb-[${extraBottomPadding + 50}px]`,
  ];

  return (
    <AnimatedKeyboardAwareScrollView
      ref={scrollViewRef}
      contentContainerStyle={[defaultContainerStyle, containerStyle]}
      enableResetScrollToCoords={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      scrollEventThrottle={16}
      style={style}
      onScroll={onScroll}
    >
      {children}
    </AnimatedKeyboardAwareScrollView>
  );
}
