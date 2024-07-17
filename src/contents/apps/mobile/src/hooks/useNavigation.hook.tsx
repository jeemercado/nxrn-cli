import { ParamListBase, useNavigation as RNUseNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { PrivateStackParams, PublicStackParams } from '../routes';

export function useNavigation<T extends PublicStackParams | PrivateStackParams | ParamListBase>() {
  return RNUseNavigation<StackNavigationProp<T, keyof T>>();
}
