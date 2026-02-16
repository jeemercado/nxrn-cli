/* eslint-disable no-magic-numbers */
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { useCallback, useState } from 'react';
import { Keyboard, Pressable, Modal as RNBuiltInModal, StyleProp, ViewStyle } from 'react-native';
import RNModal from 'react-native-modal';

import CONFIG from '@/config';
import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

export type ModalProps = DefaultComponentProps & {
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  isVisible: boolean;
  onBackButtonPress?: () => void;
  onBackdropPress?: () => void;
};

const FADE_IN_DURATION = 200;
const FADE_OUT_DURATION = 150;
function IOSModal(props: ModalProps) {
  const { children, isVisible, onBackButtonPress, onBackdropPress, style } = props;

  return (
    <RNModal
      animationIn="fadeIn"
      animationInTiming={FADE_IN_DURATION}
      animationOut="fadeOut"
      animationOutTiming={FADE_OUT_DURATION}
      backdropColor="transparent"
      backdropOpacity={0}
      backdropTransitionOutTiming={FADE_OUT_DURATION}
      isVisible={isVisible}
      style={[tw`m-0`, style]}
      onBackButtonPress={onBackButtonPress}
      onBackdropPress={onBackdropPress}
    >
      <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
    </RNModal>
  );
}

function AndroidModal(props: ModalProps) {
  const { children, isVisible, onBackButtonPress, onBackdropPress, style } = props;

  return (
    <RNBuiltInModal
      transparent
      animationType="fade"
      style={[tw`m-0`, style]}
      visible={isVisible}
      onRequestClose={onBackButtonPress}
    >
      <Pressable style={tw`flex-1 bg-black/60`} onPress={onBackdropPress}>
        <Pressable style={tw`flex-1`}>
          <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
        </Pressable>
      </Pressable>
    </RNBuiltInModal>
  );
}

export function Modal(props: ModalProps) {
  if (CONFIG.IS_IOS) {
    return <IOSModal {...props} />;
  }

  return <AndroidModal {...props} />;
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
