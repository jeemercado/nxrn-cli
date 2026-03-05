import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgProps } from 'react-native-svg';

import { ToastManagerRef, ToastOptions, ToastVariant } from './toast-manager.types';
import { Toast } from './toast.service';

import { Typography } from '@/components/atoms/Typography';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon } from '@/icons';
import { colors, tw } from '@/tailwind';

type QueuedToast = ToastOptions & {
  variant: ToastVariant;
};

type VariantConfig = {
  color: string;
  icon: React.FC<SvgProps>;
};

const ANIMATION_DURATION = 300;
const DEFAULT_DURATION = 3000;
const ICON_SIZE = 20;
const BOTTOM_PADDING_OFFSET = 16;

const VARIANT_CONFIG: Record<ToastVariant, VariantConfig> = {
  error: { color: colors.error, icon: XCircleIcon },
  info: { color: colors.secondary[500], icon: InfoIcon },
  success: { color: colors.success, icon: CheckCircleIcon },
  warning: { color: colors.primary[500], icon: AlertTriangleIcon },
};

export function ToastManager() {
  const [queue, setQueue] = useState<QueuedToast[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const currentToast = queue[0];

  const handleDismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setQueue((prev) => prev.slice(1));
  }, []);

  useEffect(() => {
    const ref: ToastManagerRef = {
      show: (variant: ToastVariant, options: ToastOptions) => {
        setQueue((prev) => [...prev, { ...options, variant }]);
      },
    };
    Toast.setRef(ref);
  }, []);

  useEffect(() => {
    if (!currentToast) {
      return;
    }

    const duration = currentToast.duration ?? DEFAULT_DURATION;
    timerRef.current = setTimeout(() => {
      setQueue((prev) => prev.slice(1));
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentToast]);

  if (!currentToast) {
    return null;
  }

  const config = VARIANT_CONFIG[currentToast.variant];
  const IconComponent = config.icon;

  return (
    <View pointerEvents="box-none" style={tw`absolute bottom-10 left-6 right-6 z-50 items-center`}>
      <Animated.View
        key={`${currentToast.variant}-${currentToast.message}`}
        entering={SlideInDown.duration(ANIMATION_DURATION)}
        exiting={SlideOutDown.duration(ANIMATION_DURATION)}
        style={[tw`mx-4 w-full max-w-sm`, { paddingBottom: insets.bottom + BOTTOM_PADDING_OFFSET }]}
      >
        <Pressable
          style={tw`dark:border-divider dark:bg-sheet flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm`}
          onPress={handleDismiss}
        >
          <View style={tw`mr-3`}>
            <IconComponent color={config.color} height={ICON_SIZE} width={ICON_SIZE} />
          </View>
          <Typography
            numberOfLines={2}
            style={tw`dark:text-foreground flex-1 text-sm font-medium text-gray-800`}
          >
            {currentToast.message}
          </Typography>
        </Pressable>
      </Animated.View>
    </View>
  );
}
