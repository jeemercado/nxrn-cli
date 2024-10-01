import { useFocusEffect } from '@react-navigation/core';
import React, { ReactElement, useEffect } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated from 'react-native-reanimated';
import { Edge, SafeAreaProviderProps, SafeAreaView } from 'react-native-safe-area-context';

import CONFIG from '../../../config';
import { tw } from '../../../tailwind';
import { Box } from '../../atoms';

type Props = SafeAreaProviderProps & {
  scrollViewRef?: React.RefObject<KeyboardAwareScrollView>;
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

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(KeyboardAwareScrollView);

export function ScreenContainer(props: Props) {
  const {
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
    <SafeAreaView edges={edges} style={[tw`flex-1 bg-gray-50 dark:bg-gray-900`, style]}>
      {hasScroll ? (
        <AnimatedKeyboardAwareScrollView
          ref={scrollViewRef}
          contentContainerStyle={defaultContainerStyle}
          enableResetScrollToCoords={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          scrollEventThrottle={16}
          onScroll={onScroll}
        >
          {children}
        </AnimatedKeyboardAwareScrollView>
      ) : (
        <Box style={defaultContainerStyle}>{children}</Box>
      )}
    </SafeAreaView>
  );
}
