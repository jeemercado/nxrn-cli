import React from 'react';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';
import { Box } from '../Box';

type Props = DefaultComponentProps & {};

export function Divider(props: Props) {
  const { style } = props;

  return <Box style={[tw`h-[1px] w-full bg-gray-200`, style]}></Box>;
}
