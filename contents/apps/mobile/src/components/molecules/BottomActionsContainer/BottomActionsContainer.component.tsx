import React from 'react';
import { ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';

type Props = DefaultComponentProps &
  ViewProps & {
    children: React.ReactNode;
  };

export function BottomActionsContainer(props: Props) {
  const { children, style, ...rest } = props;

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[
        tw`border-geyser-200 absolute bottom-0 left-0 right-0 flex flex-col gap-y-2 border-b-0 border-t bg-gray-50 p-4`,
        style,
      ]}
      {...rest}
    >
      {children}
    </SafeAreaView>
  );
}
