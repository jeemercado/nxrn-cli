import { JSX } from 'react';

import { useLocalStorageStore } from '@/stores';

type Props = {
  children: JSX.Element;
};

export function StorageManager(props: Props) {
  const { children } = props;
  const hasHydrated = useLocalStorageStore((state) => state._hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  return children;
}
