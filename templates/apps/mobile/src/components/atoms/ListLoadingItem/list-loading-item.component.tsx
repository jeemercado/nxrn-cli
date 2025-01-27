import React from 'react';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';
import { Skeleton } from '../Skeleton';
import { View } from 'react-native';

type Props = DefaultComponentProps & {
  isLoading: boolean;
};

export function ListLoadingItemComponent(props: Props) {
  const { isLoading, style } = props;

  return (
    <View style={[style]}>
      <View style={[tw`gap-2`, style]}>
        <Skeleton isLoading={isLoading}>
          {isLoading && <View style={tw`h-[100px] w-full`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <View style={tw`h-[100px] w-full`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <View style={tw`h-[100px] w-full`} />}
        </Skeleton>
      </View>
    </View>
  );
}

export function ListLoadingHorizontalItemComponent(props: Props) {
  const { isLoading, style } = props;

  return (
    <View style={[style]}>
      <View style={[tw`flex-row gap-2`, style]}>
        <Skeleton isLoading={isLoading}>
          {isLoading && <View style={tw`h-[200px] w-[100px]`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <View style={tw`h-[200px] w-[100px]`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <View style={tw`h-[200px] w-[100px]`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <View style={tw`h-[200px] w-[100px]`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <View style={tw`h-[200px] w-[100px]`} />}
        </Skeleton>
      </View>
    </View>
  );
}
