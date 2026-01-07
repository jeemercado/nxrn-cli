import { TextInputProps } from 'react-native';

export const TEXT_INPUT_MIN_HEIGHT = 56;
export const TEXT_INPUT_LINE_HEIGHT = 21;

export const DefaultPhonePadInputProps: TextInputProps = {
  keyboardAppearance: 'dark',
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardType: 'phone-pad',
  numberOfLines: 1,
};

export const DefaultNumberPadInputProps: TextInputProps = {
  keyboardAppearance: 'dark',
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardType: 'number-pad',
  numberOfLines: 1,
};

export const DefaultNumericInputProps: TextInputProps = {
  keyboardAppearance: 'dark',
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardType: 'numeric',
  numberOfLines: 1,
};

export const DefaultNameInputProps: TextInputProps = {
  keyboardAppearance: 'dark',
  autoCapitalize: 'words',
  autoCorrect: true,
  keyboardType: 'default',
  numberOfLines: 1,
};

export const DefaultEmailInputProps: TextInputProps = {
  keyboardAppearance: 'dark',
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardType: 'email-address',
  numberOfLines: 1,
};

export const DefaultTextAreaInputProps: TextInputProps = {
  keyboardAppearance: 'dark',
  autoCapitalize: 'sentences',
  autoCorrect: true,
  keyboardType: 'default',
  numberOfLines: 3,
};
