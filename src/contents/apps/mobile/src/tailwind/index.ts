import resolveConfig from 'tailwindcss/resolveConfig';
import { create } from 'twrnc';

import tailwindConfig from '../../tailwind.config';

const theme = resolveConfig(tailwindConfig);

export const tw = create(tailwindConfig);

export const errorContainerStyle = (err: boolean) => err && tw`border-red-600`;

export const disabledInputStyle = (isDisabled: boolean) => isDisabled && tw`opacity-20`;

export const focusedInputStyle = (isFocused: boolean) => isFocused && tw`border-primary-400`;

export const errorTextStyle = (err: boolean) => err && tw`text-red-600`;

export const defaultInputContainerStyle = tw`rounded-xl border border-gray-900 px-3`;
export const defaultInputTextStyle = tw`py-2 font-normal text-gray-950`;

export const colors = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...((theme.theme as any).colors as any),
};
