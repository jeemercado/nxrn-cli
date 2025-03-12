import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps & {
  children?: React.ReactNode;
  isLoading: boolean;
};

export function Skeleton(props: Props) {
  const { children, isLoading, style } = props;
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: withRepeat(withTiming(opacity.value, { duration: 500 }), -1, true),
    }),
    [],
  );

  React.useEffect(() => {
    opacity.value = 0.5; // Start the animation
  }, []);

  if (!isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }

  return (
    <Animated.View style={[tw`rounded-lg bg-gray-200`, animatedStyle, style]}>
      <View style={tw`opacity-0`}>{children}</View>
    </Animated.View>
  );
}
