import React, { useRef } from 'react';
import { TextInput } from 'react-native';

export function useTextInputChangeFocus(): [React.MutableRefObject<TextInput>, () => void] {
  const ref = useRef() as React.MutableRefObject<TextInput>;

  function changeFocus() {
    ref?.current?.focus();
  }

  return [ref, changeFocus];
}
