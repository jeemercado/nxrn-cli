import { useFocusEffect } from '@react-navigation/core';
import React, { ReactElement, useEffect } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated from 'react-native-reanimated';
import { Edge, SafeAreaProviderProps, SafeAreaView } from 'react-native-safe-area-context';

import CONFIG from '../../../config';
import { tw } from '../../../tailwind';

type Props = SafeAreaProviderProps & {
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

const defaultStyle = tw.style('grow', {
  paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight - 1 : 0,
});

const safeAreaViewEdges: Edge[] = Platform.select({
  android: ['left', 'right', 'bottom'],
  default: [],
  ios: ['left', 'right', 'bottom', 'top'],
});

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(KeyboardAwareScrollView);

export function ScreenContainer(props: Props): JSX.Element {
  const {
    children,
    containerStyle,
    excludedEdges = [],
    extraBottomPadding = 0,
    hasScroll = true,
    onScroll,
    refreshControl,
    shouldBeTranslucent = false,
    shouldShowStatusBar = true,
    statusBarColor = 'transparent',
    style,
  } = props;
  const edges =
    excludedEdges.length > 0
      ? safeAreaViewEdges.filter((edge) => !excludedEdges.includes(edge))
      : safeAreaViewEdges;

  useEffect(() => {
    if (CONFIG.IS_ANDROID) {
      StatusBar.setBackgroundColor(statusBarColor);
    }
  }, [statusBarColor]);

  useFocusEffect(() => {
    StatusBar.setHidden(!shouldShowStatusBar);
    if (CONFIG.IS_ANDROID) {
      StatusBar.setBackgroundColor(statusBarColor);
      StatusBar.setTranslucent(!shouldBeTranslucent);
    }
  });

  const defaultContainerStyle = [
    defaultStyle,
    containerStyle,
    // eslint-disable-next-line no-magic-numbers
    extraBottomPadding && tw`pb-[${extraBottomPadding + 50}px]`,
  ];

  return (
    <SafeAreaView edges={edges} style={[tw`flex-1 bg-gray-50`, style]}>
      {hasScroll ? (
        <AnimatedKeyboardAwareScrollView
          contentContainerStyle={defaultContainerStyle}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          scrollEventThrottle={16}
          onScroll={onScroll}
        >
          {children}
        </AnimatedKeyboardAwareScrollView>
      ) : (
        <View style={defaultContainerStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}
