import { useEffect, useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextStyle,
} from 'react-native';

import { DefaultTextAreaInputProps, TEXT_INPUT_MIN_HEIGHT } from './constants';
import { TextInput } from './text-input.component';
import { getTextInputHeightAdjustment } from './util';

import { DefaultComponentProps } from '@/types/component.type';

export type TextInputAreaProps = DefaultComponentProps &
  RNTextInputProps & {
    textInputRef?: React.RefObject<RNTextInput>;
    textStyle?: StyleProp<TextStyle>;
    autoAdjustHeight?: boolean;
  };

export function TextInputArea(props: TextInputAreaProps) {
  const {
    autoAdjustHeight = false,
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
    if (!value || !autoAdjustHeight) {
      return;
    }

    const newLines = value.split(/[\r\n]+/).length;

    if (numberOfNewLines !== newLines) {
      setNumberOfNewLines(newLines);
    }
  }, [value]);

  return (
    <TextInput
      testID="text-input-area"
      {...DefaultTextAreaInputProps}
      multiline
      numberOfLines={numberOfLines}
      showClearButton={false}
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
