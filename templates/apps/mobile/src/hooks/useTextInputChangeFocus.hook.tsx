import React, { useRef } from 'react';
import { TextInput } from 'react-native';

export function useTextInputChangeFocus(): [React.RefObject<TextInput>, () => void] {
  const ref = useRef<TextInput>(null) as React.RefObject<TextInput>;

  function changeFocus() {
    ref?.current?.focus();
  }

  return [ref, changeFocus];
}
