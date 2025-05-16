import React from 'react';
import { Dimensions, View } from 'react-native';

import { Skeleton } from '@/components/atoms/Skeleton';
import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

const SPACING = 2;
const screenWidth = Dimensions.get('window').width;

type Props = DefaultComponentProps & {
  count: number;
  isLoading: boolean;
};

export function ListLoadingItemComponent(props: Props) {
  const { count, isLoading, style } = props;
  const itemWidth = (screenWidth - (count + 1) * SPACING) / count;

  return (
    <View style={[style]}>
      <View style={[tw`gap-2`, style]}>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} isLoading={isLoading}>
            {isLoading && <View style={tw`h-[${itemWidth}px] w-full`} />}
          </Skeleton>
        ))}
      </View>
    </View>
  );
}

export function ListLoadingHorizontalItemComponent(props: Props) {
  const { count, isLoading, style } = props;
  const itemWidth = (screenWidth - (count + 1) * SPACING) / count;

  return (
    <View style={[style]}>
      <View style={[tw`flex-row gap-2`, style]}>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} isLoading={isLoading}>
            {isLoading && <View style={tw`h-[${itemWidth}px] w-[${itemWidth}px]`} />}
          </Skeleton>
        ))}
      </View>
    </View>
  );
}
