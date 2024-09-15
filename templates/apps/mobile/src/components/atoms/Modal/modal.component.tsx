/* eslint-disable no-magic-numbers */
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { useCallback, useState } from 'react';
import { Keyboard, ModalBaseProps, StyleProp, ViewStyle } from 'react-native';
import RNModal from 'react-native-modal';

import { tw } from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';
import { Box } from '../Box';

export type ModalProps = DefaultComponentProps &
  ModalBaseProps & {
    children?: React.ReactNode;
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
        <Box style={[tw`px-4`, containerStyle]}>{children}</Box>
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
