/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-magic-numbers */
import {
  BottomSheetBackdropProps,
  BottomSheetHandle,
  BottomSheetHandleProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { FC, RefObject, useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, StyleProp, ViewStyle } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';

export type BottomSheetProps = DefaultComponentProps & {
  backgroundStyle?: StyleProp<Omit<ViewStyle, 'left' | 'right' | 'position' | 'top' | 'bottom'>>;
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  enableDismissOnPressBackdrop?: boolean;
  enableDynamicSizing?: boolean;
  enablePanDownToClose?: boolean;
  handleComponent?: FC<BottomSheetHandleProps> | null;
  onExpand?: () => void;
  sheetRef: RefObject<BottomSheetModal>;
  snapPoints?: string[];
};

const DEFAULT_SNAP_POINTS = ['25%', '50%', '100%'];

const CustomBackdrop = ({
  animatedIndex,
  enableDismissOnPressBackdrop = true,
  sheetRef,
  style,
}: BottomSheetBackdropProps & {
  enableDismissOnPressBackdrop?: boolean;
  sheetRef: RefObject<BottomSheetModal>;
}) => {
  function handleDismiss() {
    if (enableDismissOnPressBackdrop) {
      sheetRef.current?.close();
    }
  }

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [-1, 0, 1],
      [0, 0.5, 0.75],
      Extrapolation.CLAMP,
    );
    const pointerEvents = opacity > 0.25 ? 'auto' : 'none';

    return {
      opacity,
      pointerEvents,
    };
  });

  // styles
  const containerStyle = useMemo(
    () => [style, tw`bg-black-950/60`, containerAnimatedStyle],
    [style, containerAnimatedStyle],
  );

  return (
    <Animated.View style={containerStyle}>
      <TouchableWithoutFeedback style={tw`h-full w-full`} onPress={handleDismiss} />
    </Animated.View>
  );
};

export function BottomSheet(props: BottomSheetProps) {
  const {
    backgroundStyle,
    children,
    contentContainerStyle,
    enableDismissOnPressBackdrop = true,
    enableDynamicSizing = false,
    enablePanDownToClose = true,
    handleComponent = BottomSheetHandle,
    sheetRef,
    snapPoints = DEFAULT_SNAP_POINTS,
    style,
  } = props;
  const points = enableDynamicSizing ? undefined : snapPoints;

  function renderBackdrop(backdropProps: BottomSheetBackdropProps) {
    return (
      <CustomBackdrop
        {...backdropProps}
        enableDismissOnPressBackdrop={enableDismissOnPressBackdrop}
        sheetRef={sheetRef}
      />
    );
  }

  return (
    <BottomSheetModal
      ref={sheetRef}
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={[tw`bg-gray-50`, backgroundStyle]}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose={enablePanDownToClose}
      handleComponent={handleComponent}
      handleIndicatorStyle={tw`bg-gray-50`}
      handleStyle={tw`rounded-tl-xl rounded-tr-xl`}
      keyboardBehavior="interactive"
      snapPoints={points}
      style={[
        tw`rounded-md`,
        {
          elevation: 10,
        },
        style,
      ]}
    >
      <BottomSheetScrollView contentContainerStyle={contentContainerStyle}>
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

export function useBottomSheet() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const sheetRef = useRef<BottomSheetModal>(null);

  const expandSheet = useCallback(() => {
    Keyboard.dismiss();
    sheetRef.current?.present();
    setIsVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    Keyboard.dismiss();
    sheetRef.current?.close();
    setIsVisible(false);
  }, []);

  return { closeSheet, expandSheet, isVisible, sheetRef };
}
