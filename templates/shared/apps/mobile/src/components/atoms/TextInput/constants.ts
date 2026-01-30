import { TextInputProps } from 'react-native';

export const TEXT_INPUT_MIN_HEIGHT = 56;
export const TEXT_INPUT_LINE_HEIGHT = 21;

export const DefaultPhonePadInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'phone-pad',
  numberOfLines: 1,
};

export const DefaultNumberPadInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'number-pad',
  numberOfLines: 1,
};

export const DefaultNumericInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'numeric',
  numberOfLines: 1,
};

export const DefaultNameInputProps: TextInputProps = {
  autoCapitalize: 'words',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'default',
  numberOfLines: 1,
};

export const DefaultEmailInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'email-address',
  numberOfLines: 1,
};

export const DefaultTextAreaInputProps: TextInputProps = {
  autoCapitalize: 'sentences',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'default',
  numberOfLines: 3,
};
