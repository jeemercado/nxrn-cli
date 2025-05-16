import { useFocusEffect } from '@react-navigation/core';
import React, { ReactElement } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControlProps,
  StatusBar,
  StatusBarStyle,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Edge, SafeAreaProviderProps, SafeAreaView } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from '@/components';
import CONFIG from '@/config';
import { tw } from '@/tailwind';

type Props = SafeAreaProviderProps & {
  barStyle?: StatusBarStyle;
  scrollViewRef?: React.RefObject<RNKeyboardAwareScrollView | null>;
  containerStyle?: StyleProp<ViewStyle>;
  excludedEdges?: Edge[];
  extraBottomPadding?: number;
  hasScroll?: boolean;
  refreshControl?: ReactElement;
  shouldShowStatusBar?: boolean;
  shouldBeTranslucent?: boolean;
  statusBarColor?: string;
  useSafeAreaView?: boolean;
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
    useSafeAreaView = true,
  } = props;
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

  if (!useSafeAreaView) {
    return (
      <View style={[tw`flex-1 bg-white`, style]}>
        {hasScroll ? (
          <KeyboardAwareScrollView
            containerStyle={defaultContainerStyle}
            refreshControl={refreshControl as ReactElement<RefreshControlProps>}
            scrollViewRef={scrollViewRef}
            onScroll={onScroll}
          >
            {children}
          </KeyboardAwareScrollView>
        ) : (
          <View style={defaultContainerStyle}>{children}</View>
        )}
      </View>
    );
  }

  const edges =
    excludedEdges.length > 0
      ? safeAreaViewEdges.filter((edge) => !excludedEdges.includes(edge))
      : safeAreaViewEdges;

  return (
    <SafeAreaView edges={edges} style={[tw`flex-1 bg-white`, style]}>
      {hasScroll ? (
        <KeyboardAwareScrollView
          containerStyle={defaultContainerStyle}
          refreshControl={refreshControl as ReactElement<RefreshControlProps>}
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
