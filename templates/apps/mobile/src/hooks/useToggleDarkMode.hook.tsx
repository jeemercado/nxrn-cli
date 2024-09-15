import { useAppColorScheme } from 'twrnc';

import { tw } from '../tailwind';

export function useToggleDarkMode() {
  const [, toggleColorScheme] = useAppColorScheme(tw);

  return toggleColorScheme;
}
