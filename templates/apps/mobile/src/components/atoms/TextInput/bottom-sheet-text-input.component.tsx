import { BottomSheetTextInput as RNBottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';

import { DefaultNameInputProps } from '@/components/atoms/TextInput/constants';
import {
  colors,
  defaultInputContainerStyle,
  defaultInputTextStyle,
  disabledInputStyle,
  focusedInputStyle,
} from '@/tailwind';
import { DefaultComponentProps } from '@/types';

export type BottomSheetTextInputProps = DefaultComponentProps &
  RNTextInputProps & {
    textInputRef?: React.RefObject<RNTextInput>;
    textStyle?: StyleProp<TextStyle>;
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
    ...extraProps
  } = props;
  const [isFocused, setFocused] = useState<boolean>(false);

  function handleOnChangeText(text: string) {
    onChangeText?.(text);
  }

  function handleOnFocus() {
    setFocused(true);
  }

  function handleOnBlur() {
    setFocused(false);
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
        placeholderTextColor={colors.gray[600]}
        selectionColor={colors.primary[400]}
        style={[defaultInputTextStyle, textStyle]}
        value={value}
        onBlur={handleOnBlur}
        onChangeText={handleOnChangeText}
        onFocus={handleOnFocus}
        {...extraProps}
      />
    </View>
  );
}
