/* eslint-disable no-magic-numbers */
import React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ScrollView as RNScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps & {
  children?: React.ReactNode;
  scrollViewRef?: React.RefObject<RNScrollView | null>;
  containerStyle?: StyleProp<ViewStyle>;
  extraBottomPadding?: number;
  refreshControl?: React.ReactElement<RefreshControlProps> | undefined;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const defaultStyle = tw`grow`;

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
    extraBottomPadding && tw`pb-[${extraBottomPadding + 50}px]`,
  ];

  return (
    <RNKeyboardAwareScrollView
      ref={scrollViewRef}
      bottomOffset={100}
      contentContainerStyle={[defaultContainerStyle, containerStyle]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      scrollEventThrottle={16}
      ScrollViewComponent={RNScrollView}
      style={style}
      onScroll={onScroll}
    >
      {children}
    </RNKeyboardAwareScrollView>
  );
}
