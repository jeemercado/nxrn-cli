/* eslint-disable no-magic-numbers */
import React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControlProps,
  ScrollView as NativeScrollView,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps &
  ScrollViewProps & {
    children?: React.ReactNode;
    scrollViewRef?: React.RefObject<NativeScrollView | null>;
    containerStyle?: StyleProp<ViewStyle>;
    extraBottomPadding?: number;
    refreshControl?: React.ReactElement<RefreshControlProps> | undefined;
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    bottomOffset?: number;
    disableScrollOnKeyboardHide?: boolean;
    extraKeyboardSpace?: number;
    ScrollViewComponent?: React.ComponentType<ScrollViewProps>;
  };

const defaultStyle = tw`grow`;

export function KeyboardAwareScrollView(props: Props) {
  const {
    bottomOffset = 150,
    children,
    containerStyle,
    extraBottomPadding,
    isDisabled = false,
    onScroll,
    refreshControl,
    scrollViewRef,
    style,
    ...rest
  } = props;

  const defaultContainerStyle = [
    defaultStyle,
    containerStyle,
    extraBottomPadding && tw`pb-[${extraBottomPadding + 50}px]`,
  ];

  // Android: gesture-handler ScrollView doesn't support RefreshControl properly.
  // Fall back to RN's built-in ScrollView when refreshControl is provided on Android.
  const ScrollViewComponent =
    refreshControl && Platform.OS === 'android' ? NativeScrollView : GHScrollView;

  return (
    <RNKeyboardAwareScrollView
      ref={scrollViewRef}
      bottomOffset={bottomOffset}
      contentContainerStyle={[defaultContainerStyle, containerStyle]}
      enabled={!isDisabled}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      scrollEventThrottle={16}
      ScrollViewComponent={ScrollViewComponent}
      showsVerticalScrollIndicator={false}
      style={style}
      onScroll={onScroll}
      {...rest}
    >
      {children}
    </RNKeyboardAwareScrollView>
  );
}
