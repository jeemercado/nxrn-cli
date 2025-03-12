import { useFocusEffect } from '@react-navigation/core';
import React, { ReactElement } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  StatusBarStyle,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Edge, SafeAreaProviderProps, SafeAreaView } from 'react-native-safe-area-context';

import CONFIG from '../../../config';
import { tw } from '../../../tailwind';
import { KeyboardAwareScrollView } from '../../atoms';

type Props = SafeAreaProviderProps & {
  barStyle?: StatusBarStyle;
  scrollViewRef?: React.RefObject<RNKeyboardAwareScrollView>;
  containerStyle?: StyleProp<ViewStyle>;
  excludedEdges?: Edge[];
  extraBottomPadding?: number;
  hasScroll?: boolean;
  refreshControl?: ReactElement;
  shouldShowStatusBar?: boolean;
  shouldBeTranslucent?: boolean;
  statusBarColor?: string;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const defaultStyle = tw`grow`;

const safeAreaViewEdges: Edge[] = Platform.select({
  android: ['top', 'left', 'right', 'bottom'],
  default: [],
  ios: ['top', 'left', 'right', 'bottom'],
});

export function ScreenContainer(props: Props) {
  const {
    barStyle = 'dark-content',
    children,
    containerStyle,
    excludedEdges = [],
    extraBottomPadding = 0,
    hasScroll = true,
    onScroll,
    refreshControl,
    scrollViewRef,
    shouldBeTranslucent = false,
    shouldShowStatusBar = true,
    statusBarColor = 'transparent',
    style,
  } = props;
  const edges =
    excludedEdges.length > 0
      ? safeAreaViewEdges.filter((edge) => !excludedEdges.includes(edge))
      : safeAreaViewEdges;

  useFocusEffect(() => {
    StatusBar.setHidden(!shouldShowStatusBar);
    if (CONFIG.IS_ANDROID) {
      StatusBar.setBackgroundColor(statusBarColor);
      StatusBar.setTranslucent(!shouldBeTranslucent);
      StatusBar.setBarStyle(barStyle);
    }
  });

  const defaultContainerStyle = [
    defaultStyle,
    containerStyle,
    // eslint-disable-next-line no-magic-numbers
    extraBottomPadding && tw`pb-[${extraBottomPadding + 50}px]`,
  ];

  return (
    <SafeAreaView edges={edges} style={[tw`flex-1 bg-white`, style]}>
      {hasScroll ? (
        <KeyboardAwareScrollView
          containerStyle={defaultContainerStyle}
          refreshControl={refreshControl}
          scrollViewRef={scrollViewRef}
          onScroll={onScroll}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View style={defaultContainerStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}
