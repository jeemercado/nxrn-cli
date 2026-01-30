import { StyleProp, ViewStyle } from 'react-native';

export type DefaultComponentProps = {
  error?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
};
