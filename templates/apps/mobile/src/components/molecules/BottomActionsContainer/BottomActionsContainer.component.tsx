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
      style={[tw`absolute bottom-0 left-0 right-0`, style]}
      {...rest}
    >
      {children}
    </SafeAreaView>
  );
}
