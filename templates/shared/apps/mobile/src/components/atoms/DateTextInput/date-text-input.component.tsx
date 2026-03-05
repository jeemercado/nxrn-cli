import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { ReactNode, Ref, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleProp, TextInput, ViewStyle } from 'react-native';

import { Typography } from '@/components/atoms/Typography';
import CONFIG from '@/config';
import {
  defaultInputContainerStyle,
  defaultInputTextStyle,
  focusedInputStyle,
  tw,
} from '@/tailwind';

dayjs.extend(customParseFormat);

const DATE_FORMAT = 'MM/DD/YYYY';
const GUIDE_TEMPLATE = 'MM/DD/YYYY';
const MAX_DIGITS = 8;
const MONTH_SEPARATOR_INDEX = 2;
const DAY_SEPARATOR_INDEX = 4;

const fontFamily = CONFIG.IS_IOS ? { fontFamily: 'Menlo' } : { fontFamily: 'monospace' };

type Props = {
  error?: string;
  onChange: (date: Date | undefined) => void;
  onValidationError?: (error: string | undefined) => void;
  ref?: Ref<TextInput>;
  renderRight?: (date: Date) => ReactNode;
  value: Date | undefined;
};

const MONTH_FIRST_DIGIT_INDEX = 0;
const MONTH_SECOND_DIGIT_INDEX = 1;
const DAY_FIRST_DIGIT_INDEX = 2;
const DAY_SECOND_DIGIT_INDEX = 3;
const YEAR_FIRST_DIGIT_INDEX = 4;
const MAX_MONTH_FIRST_DIGIT = 1;
const MAX_DAY_FIRST_DIGIT = 3;

function isDigitValid(digit: string, index: number, previous: string): boolean {
  const d = Number(digit);

  if (index === MONTH_FIRST_DIGIT_INDEX) {
    return d <= MAX_MONTH_FIRST_DIGIT;
  }

  if (index === MONTH_SECOND_DIGIT_INDEX) {
    return previous[0] === '0' ? d >= 1 : d <= MONTH_SEPARATOR_INDEX;
  }

  if (index === DAY_FIRST_DIGIT_INDEX) {
    return d <= MAX_DAY_FIRST_DIGIT;
  }

  if (index === DAY_SECOND_DIGIT_INDEX) {
    return previous[MONTH_SEPARATOR_INDEX] === '3' ? d <= 1 : d >= 0;
  }

  if (index === YEAR_FIRST_DIGIT_INDEX) {
    return d === 1 || d === MONTH_SEPARATOR_INDEX;
  }

  return true;
}

function filterValidDigits(raw: string): string {
  let result = '';

  for (let i = 0; i < raw.length && result.length < MAX_DIGITS; i += 1) {
    if (isDigitValid(raw[i], result.length, result)) {
      result += raw[i];
    }
  }

  return result;
}

function extractDigits(date: Date | undefined): string {
  if (!date) {
    return '';
  }

  return dayjs(date).format(DATE_FORMAT).replace(/\D/g, '');
}

function buildFilledPortion(digits: string): string {
  let result = '';

  for (let i = 0; i < digits.length && i < MAX_DIGITS; i += 1) {
    if (i === MONTH_SEPARATOR_INDEX || i === DAY_SEPARATOR_INDEX) {
      result += '/';
    }
    result += digits[i];
  }

  return result;
}

function buildGuideSuffix(digits: string): string {
  const filled = buildFilledPortion(digits);

  return GUIDE_TEMPLATE.slice(filled.length);
}

function parseDate(digits: string): Date | undefined {
  if (digits.length !== MAX_DIGITS) {
    return undefined;
  }

  const masked = buildFilledPortion(digits);
  const parsed = dayjs(masked, DATE_FORMAT, true);

  if (parsed.isValid()) {
    return parsed.toDate();
  }

  return undefined;
}

export function DateTextInput(props: Props) {
  const { error, onChange, onValidationError, ref, renderRight, value } = props;
  const [digits, setDigits] = useState(() => extractDigits(value));
  const [isFocused, setIsFocused] = useState(false);
  const [invalidDateError, setInvalidDateError] = useState<string | undefined>();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!ref) {
      return;
    }

    if (typeof ref === 'function') {
      ref(inputRef.current);
    } else {
      (ref as React.MutableRefObject<TextInput | null>).current = inputRef.current;
    }
  }, [ref]);

  const filledPortion = buildFilledPortion(digits);
  const guideSuffix = buildGuideSuffix(digits);
  const parsedDate = parseDate(digits);
  const displayError = invalidDateError || error;

  const containerStyle: StyleProp<ViewStyle> = [
    defaultInputContainerStyle,
    tw`dark:border-divider dark:bg-surface items-center`,
    focusedInputStyle(isFocused),
    displayError && tw`border-red-500`,
  ];

  const handleChangeText = useCallback(
    (text: string) => {
      const rawDigits = text.replace(/\D/g, '');
      const newDigits = filterValidDigits(rawDigits);
      setDigits(newDigits);

      if (newDigits.length === MAX_DIGITS) {
        const masked = buildFilledPortion(newDigits);
        const parsed = dayjs(masked, DATE_FORMAT, true);

        if (parsed.isValid()) {
          setInvalidDateError(undefined);
          onValidationError?.(undefined);
          onChange(parsed.toDate());

          return;
        }

        const errorMsg = 'Please enter a valid date';
        setInvalidDateError(errorMsg);
        onValidationError?.(errorMsg);
      } else {
        setInvalidDateError(undefined);
        onValidationError?.(undefined);
      }

      onChange(undefined);
    },
    [onChange, onValidationError],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handlePress = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Pressable style={containerStyle} onPress={handlePress}>
      <TextInput
        ref={inputRef}
        keyboardType="number-pad"
        style={[
          defaultInputTextStyle,
          tw`dark:text-foreground`,
          { ...fontFamily, opacity: 0, position: 'absolute' },
        ]}
        value={digits}
        onBlur={handleBlur}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
      />
      <Typography style={[defaultInputTextStyle, tw`dark:text-foreground`, fontFamily]}>
        {filledPortion}
        <Typography style={[tw`text-placeholder`, { ...fontFamily }]}>{guideSuffix}</Typography>
      </Typography>
      {parsedDate && renderRight?.(parsedDate)}
    </Pressable>
  );
}
