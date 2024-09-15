import React, { useEffect, useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextStyle,
} from 'react-native';

import {
  colors,
  defaultInputContainerStyle,
  defaultInputTextStyle,
  disabledInputStyle,
  focusedInputStyle,
} from '../../../tailwind';
import { DefaultComponentProps } from '../../../types';
import { Box } from '../Box';

import { DefaultNameInputProps, DefaultTextAreaInputProps } from './constants';

export const TEXT_INPUT_MIN_HEIGHT = 100;
export const TEXT_INPUT_LINE_HEIGHT = 21;

export function getTextInputHeightAdjustment(numberOfNewLines: number) {
  if (numberOfNewLines < 2) {
    return TEXT_INPUT_MIN_HEIGHT;
  }

  return TEXT_INPUT_MIN_HEIGHT + (numberOfNewLines - 2) * TEXT_INPUT_LINE_HEIGHT;
}

export type TextInputProps = DefaultComponentProps &
  RNTextInputProps & {
    textInputRef?: React.RefObject<RNTextInput>;
    textStyle?: StyleProp<TextStyle>;
  };

export function TextInput(props: TextInputProps) {
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
    <Box
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
        placeholderTextColor={colors.gray[600]}
        selectionColor={colors.primary[400]}
        style={[defaultInputTextStyle, textStyle]}
        value={value}
        onBlur={handleOnBlur}
        onChangeText={handleOnChangeText}
        onFocus={handleOnFocus}
        {...extraProps}
      />
    </Box>
  );
}

export function TextInputArea(props: TextInputProps) {
  const {
    numberOfLines = DefaultTextAreaInputProps.numberOfLines as number,
    onChangeText,
    textStyle,
    value,
    ...extraProps
  } = props;
  const [numberOfNewLines, setNumberOfNewLines] = useState<number>(numberOfLines);

  function handleOnChangeText(text: string) {
    onChangeText?.(text);
  }
  useEffect(() => {
    if (!value) {
      return;
    }

    const newLines = value.split(/\r\n|\r|\n/).length;

    if (numberOfNewLines !== newLines) {
      setNumberOfNewLines(newLines);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <TextInput
      {...DefaultTextAreaInputProps}
      multiline
      numberOfLines={numberOfLines}
      textStyle={[
        textStyle,
        {
          height: getTextInputHeightAdjustment(numberOfNewLines),
          minHeight: TEXT_INPUT_MIN_HEIGHT,
          textAlignVertical: 'top',
        },
      ]}
      value={value}
      onChangeText={handleOnChangeText}
      {...extraProps}
    />
  );
}
