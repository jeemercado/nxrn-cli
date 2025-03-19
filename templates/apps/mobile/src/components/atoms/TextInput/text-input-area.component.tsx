import { useState, useEffect } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextStyle,
} from 'react-native';

import { TextInput } from '@/components/atoms/TextInput';
import {
  DefaultTextAreaInputProps,
  TEXT_INPUT_MIN_HEIGHT,
} from '@/components/atoms/TextInput/constants';
import { getTextInputHeightAdjustment } from '@/components/atoms/TextInput/util';
import { DefaultComponentProps } from '@/types';

export type TextInputAreaProps = DefaultComponentProps &
  RNTextInputProps & {
    textInputRef?: React.RefObject<RNTextInput>;
    textStyle?: StyleProp<TextStyle>;
  };

export function TextInputArea(props: TextInputAreaProps) {
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
