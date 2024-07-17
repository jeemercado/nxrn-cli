/* eslint-disable no-magic-numbers */
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { ReactNode, useCallback, useState } from 'react';
import { Keyboard, ModalBaseProps, StyleProp, View, ViewStyle } from 'react-native';
import RNModal from 'react-native-modal';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';

export type ModalProps = DefaultComponentProps &
  ModalBaseProps & {
    children?: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    isVisible: boolean;
    onBackdropPress?: () => void;
    onBackButtonPress?: () => void;
  };

const backdropColor = 'rgba(0, 0, 0, 0.6)';

export function Modal(props: ModalProps) {
  const { children, containerStyle, isVisible, onBackButtonPress, onBackdropPress, style } = props;

  return (
    <RNModal
      backdropColor={backdropColor}
      backdropTransitionOutTiming={0}
      isVisible={isVisible}
      style={[tw`m-0 w-full`, style]}
      onBackButtonPress={onBackButtonPress}
      onBackdropPress={onBackdropPress}
    >
      <BottomSheetModalProvider>
        <View style={[tw`px-4`, containerStyle]}>{children}</View>
      </BottomSheetModalProvider>
    </RNModal>
  );
}

export function useModal() {
  const [isVisible, setVisible] = useState<boolean>(false);

  const showModal = useCallback(() => {
    Keyboard.dismiss();
    setVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    Keyboard.dismiss();
    setVisible(false);
  }, []);

  return {
    hideModal,
    isVisible,
    showModal,
  };
}
