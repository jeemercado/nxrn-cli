import { Atom, SetStateAction, WritableAtom } from 'jotai';
import { StyleProp, ViewStyle } from 'react-native';

export type DefaultComponentProps = {
  error?: string;
  isDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export type DefaultInputComponentProps<T> = DefaultComponentProps & {
  atom?: WritableAtom<T, [SetStateAction<T>], void> | Atom<T>;
  isLoading?: boolean;
};
