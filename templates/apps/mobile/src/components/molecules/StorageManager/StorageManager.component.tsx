import { useLocalStorageState } from '../../../stores';

type Props = {
  children: JSX.Element;
};

export function StorageManager(props: Props) {
  const { children } = props;
  const hasHydrated = useLocalStorageState((state) => state._hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  return children;
}
