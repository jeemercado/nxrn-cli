/* eslint-disable no-magic-numbers */
import React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ScrollView as RNScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps &
  ScrollViewProps & {
    children?: React.ReactNode;
    scrollViewRef?: React.RefObject<RNScrollView | null>;
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

  return (
    <RNKeyboardAwareScrollView
      ref={scrollViewRef}
      bottomOffset={bottomOffset}
      contentContainerStyle={[defaultContainerStyle, containerStyle]}
      enabled={!isDisabled}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      scrollEventThrottle={16}
      ScrollViewComponent={RNScrollView}
      style={style}
      onScroll={onScroll}
      {...rest}
    >
      {children}
    </RNKeyboardAwareScrollView>
  );
}
