import { BottomSheetTextInput as RNBottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextInputFocusEventData,
  TextStyle,
  View,
} from 'react-native';

import { CrossIcon } from '@/icons';
import {
  colors,
  defaultInputContainerStyle,
  defaultInputTextStyle,
  disabledInputStyle,
  focusedInputStyle,
  tw,
} from '@/tailwind';
import { DefaultComponentProps } from '@/types/component.type';
import { DefaultNameInputProps } from './constants';

export type BottomSheetTextInputProps = DefaultComponentProps &
  RNTextInputProps & {
    textInputRef?: React.RefObject<RNTextInput>;
    textStyle?: StyleProp<TextStyle>;
    showClearButton?: boolean;
    onClearButtonPress?: () => void;
  };

export function BottomSheetTextInput(props: BottomSheetTextInputProps) {
  const {
    isDisabled = false,
    multiline = false,
    onChangeText,
    placeholder,
    style,
    textInputRef,
    textStyle,
    value,
    showClearButton = true,
    onClearButtonPress,
    onFocus,
    onBlur,
    ...extraProps
  } = props;
  const [isClearButtonVisible, setIsClearButtonVisible] = useState<boolean>(false);
  const [isFocused, setFocused] = useState<boolean>(false);

  function handleOnChangeText(text: string) {
    onChangeText?.(text);

    if (showClearButton) {
      setIsClearButtonVisible(text.length > 0);
    }
  }

  function handleOnClearPress() {
    handleOnChangeText?.('');
    onClearButtonPress?.();
  }

  function handleOnFocus(e: NativeSyntheticEvent<TextInputFocusEventData>) {
    setFocused(true);

    const shouldShowClearButton = showClearButton && value?.length;
    if (shouldShowClearButton) {
      setIsClearButtonVisible(true);
    }
    onFocus?.(e);
  }

  function handleOnBlur(e: NativeSyntheticEvent<TextInputFocusEventData>) {
    setFocused(false);

    const shouldShowClearButton = showClearButton && value?.length;
    if (shouldShowClearButton) {
      setIsClearButtonVisible(false);
    }
    onBlur?.(e);
  }

  return (
    <View
      style={[
        defaultInputContainerStyle,
        focusedInputStyle(isFocused),
        disabledInputStyle(isDisabled),
        style,
      ]}
    >
      <RNBottomSheetTextInput
        {...DefaultNameInputProps}
        ref={textInputRef as unknown as any}
        editable={!isDisabled}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[500]}
        selectionColor={colors.primary}
        style={[defaultInputTextStyle, textStyle]}
        value={value}
        onBlur={handleOnBlur}
        onChangeText={handleOnChangeText}
        onFocus={handleOnFocus}
        {...extraProps}
      />
      {isClearButtonVisible && (
        <Pressable
          hitSlop={30}
          testID="clear-button"
          style={tw`items-center justify-center`}
          onPress={handleOnClearPress}
        >
          <CrossIcon />
        </Pressable>
      )}
    </View>
  );
}
