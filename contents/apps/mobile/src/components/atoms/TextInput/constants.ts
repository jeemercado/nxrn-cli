import { TextInputProps } from 'react-native';

export const DefaultPhonePadInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: false,
  keyboardType: 'phone-pad',
  numberOfLines: 1,
};

export const DefaultNumberPadInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: false,
  keyboardType: 'number-pad',
  numberOfLines: 1,
};

export const DefaultNumericInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: false,
  keyboardType: 'numeric',
  numberOfLines: 1,
};

export const DefaultNameInputProps: TextInputProps = {
  autoCapitalize: 'words',
  autoCorrect: false,
  keyboardType: 'default',
  numberOfLines: 1,
};

export const DefaultEmailInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: false,
  keyboardType: 'email-address',
  numberOfLines: 1,
};

export const DefaultTextAreaInputProps: TextInputProps = {
  autoCapitalize: 'sentences',
  autoCorrect: false,
  keyboardType: 'default',
  numberOfLines: 3,
};
