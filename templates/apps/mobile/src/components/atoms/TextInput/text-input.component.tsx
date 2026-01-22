import React, { useState } from 'react';
import {
  Pressable,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';

import { DefaultNameInputProps } from './constants';

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

export type TextInputProps = DefaultComponentProps &
  RNTextInputProps & {
    textInputRef?: React.RefObject<RNTextInput>;
    textStyle?: StyleProp<TextStyle>;
    showClearButton?: boolean;
    onClearButtonPress?: () => void;
  };

export function TextInput(props: TextInputProps) {
  const {
    isDisabled = false,
    multiline = false,
    onChangeText,
    onClearButtonPress,
    placeholder,
    showClearButton = true,
    style,
    textInputRef,
    textStyle,
    value,
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

  function handleOnFocus() {
    setFocused(true);

    const shouldShowClearButton = showClearButton && value?.length;
    if (shouldShowClearButton) {
      setIsClearButtonVisible(true);
    }
  }

  function handleOnBlur() {
    setFocused(false);

    const shouldShowClearButton = showClearButton && value?.length;
    if (shouldShowClearButton) {
      setIsClearButtonVisible(false);
    }
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
      <RNTextInput
        {...DefaultNameInputProps}
        ref={textInputRef}
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
          style={tw`items-center justify-center`}
          testID="clear-button"
          onPress={handleOnClearPress}
        >
          <CrossIcon style={tw`text-gray-400`} />
        </Pressable>
      )}
    </View>
  );
}
