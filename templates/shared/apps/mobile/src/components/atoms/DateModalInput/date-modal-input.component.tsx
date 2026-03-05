import dayjs from 'dayjs';
import React, { ReactNode, useState } from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { DatePicker } from '@/components/atoms/DatePicker';
import { Typography } from '@/components/atoms/Typography';
import { defaultInputContainerStyle, defaultInputTextStyle, tw } from '@/tailwind';

const DEFAULT_FORMAT = 'MMMM D, YYYY';

type Props = {
  error?: string;
  format?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  renderRight?: (value: Date) => ReactNode;
  value: Date | undefined;
};

export function DateModalInput(props: Props) {
  const {
    error,
    format = DEFAULT_FORMAT,
    maximumDate,
    minimumDate,
    onChange,
    placeholder = 'Select a date',
    renderRight,
    value,
  } = props;
  const [showDatePicker, setShowDatePicker] = useState(false);

  const containerStyle: StyleProp<ViewStyle> = [
    defaultInputContainerStyle,
    tw`dark:border-divider dark:bg-surface items-center`,
    error && tw`border-red-500`,
  ];

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        style={containerStyle}
        onPress={() => setShowDatePicker(true)}
      >
        <Typography
          style={[defaultInputTextStyle, tw`dark:text-foreground`, !value && tw`text-placeholder`]}
        >
          {value ? dayjs(value).format(format) : placeholder}
        </Typography>
        {value && renderRight?.(value)}
      </TouchableOpacity>
      <DatePicker
        date={value || new Date()}
        isVisible={showDatePicker}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        mode="date"
        onCancel={() => setShowDatePicker(false)}
        onConfirm={(selectedDate) => {
          setShowDatePicker(false);
          onChange(selectedDate);
        }}
      />
    </>
  );
}
