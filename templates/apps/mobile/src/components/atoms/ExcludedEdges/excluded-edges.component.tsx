import React from 'react';
import { Platform } from 'react-native';
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';

type Props = DefaultComponentProps & {
  children?: React.ReactNode;
  excludedEdges?: Edge[];
};

const safeAreaViewEdges: Edge[] = Platform.select({
  android: ['left', 'right', 'bottom'],
  default: [],
  ios: ['left', 'right', 'bottom', 'top'],
});

export function ExcludedEdges(props: Props) {
  const { children, excludedEdges = [] } = props;
  const insets = useSafeAreaInsets();
  const { style } = props;
  const edges =
    excludedEdges.length > 0
      ? safeAreaViewEdges.filter((edge) => !excludedEdges.includes(edge))
      : safeAreaViewEdges;

  function getExcludedEdgesStyles() {
    return excludedEdges.map((edge) => tw`-${edge}-[${insets[edge]}px]`);
  }

  return (
    <SafeAreaView edges={edges} style={[getExcludedEdgesStyles(), style]}>
      {children}
    </SafeAreaView>
  );
}
