import React from 'react';
import { InputAccessoryView, Keyboard, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { KeyboardHideIcon } from '@/icons';
import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types/component.type';

type Props = DefaultComponentProps & {
  nativeID: string;
};

export function KeyboardAccessory(props: Props) {
  const { nativeID } = props;

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View style={tw`flex-row items-center justify-end bg-[#313132] px-2`}>
        <Button buttonStyle={tw`my-2 rounded-lg bg-[#717172]`} onPress={() => Keyboard.dismiss()}>
          <KeyboardHideIcon style={tw`text-white`} />
        </Button>
      </View>
    </InputAccessoryView>
  );
}
