/* eslint-disable no-magic-numbers */
import { Canvas, Fill, LinearGradient, vec } from '@shopify/react-native-skia';
import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { useLocalStorageStore } from '@/stores';
import { colors } from '@/tailwind';

type Props = {
  variant?: 'bottomSheet' | 'login' | 'welcome';
};

const DARK_GRADIENTS: Record<string, string[]> = {
  bottomSheet: [colors.sheet, colors.background],
  login: [colors.secondary[950], colors.background, colors.secondary[950]],
  welcome: [colors.background, colors.secondary[950], colors.background],
};

const LIGHT_GRADIENTS: Record<string, string[]> = {
  bottomSheet: [colors.gray[100], colors.white],
  login: [colors.gray[50], colors.white, colors.gray[50]],
  welcome: [colors.white, colors.gray[50], colors.white],
};

export function GradientBackground(props: Props) {
  const { variant = 'login' } = props;
  const colorScheme = useLocalStorageStore((s) => s.colorScheme);
  const isDark = colorScheme === 'dark';
  const { height, width } = useWindowDimensions();

  const gradientColors = isDark ? DARK_GRADIENTS[variant] : LIGHT_GRADIENTS[variant];

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {/* Base linear gradient */}
      <Fill>
        <LinearGradient
          colors={gradientColors}
          end={vec(width / 2, height)}
          start={vec(width / 2, 0)}
        />
      </Fill>
    </Canvas>
  );
}
