import React from 'react';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';
import { Box } from '../Box';
import { Skeleton } from '../Skeleton';

type Props = DefaultComponentProps & {
  isLoading: boolean;
};

export function ListLoadingItemComponent(props: Props) {
  const { isLoading, style } = props;

  return (
    <Box style={[style]}>
      <Box style={[tw`gap-2`, style]}>
        <Skeleton isLoading={isLoading}>
          {isLoading && <Box style={tw`h-[100px] w-full`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <Box style={tw`h-[100px] w-full`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <Box style={tw`h-[100px] w-full`} />}
        </Skeleton>
      </Box>
    </Box>
  );
}

export function ListLoadingHorizontalItemComponent(props: Props) {
  const { isLoading, style } = props;

  return (
    <Box style={[style]}>
      <Box style={[tw`flex-row gap-2`, style]}>
        <Skeleton isLoading={isLoading}>
          {isLoading && <Box style={tw`h-[200px] w-[100px]`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <Box style={tw`h-[200px] w-[100px]`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <Box style={tw`h-[200px] w-[100px]`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <Box style={tw`h-[200px] w-[100px]`} />}
        </Skeleton>
        <Skeleton isLoading={isLoading}>
          {isLoading && <Box style={tw`h-[200px] w-[100px]`} />}
        </Skeleton>
      </Box>
    </Box>
  );
}
