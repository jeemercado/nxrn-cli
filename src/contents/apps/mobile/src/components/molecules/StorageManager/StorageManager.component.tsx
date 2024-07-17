import { ReactNode } from 'react';

import { useLocalStorageState } from '../../../stores';

type Props = {
  children: ReactNode;
};

export function StorageManager(props: Props) {
  const { children } = props;
  const hasHydrated = useLocalStorageState((state) => state._hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  return children;
}
