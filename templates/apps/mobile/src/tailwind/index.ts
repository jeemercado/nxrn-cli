import plugin from 'tailwindcss/plugin';
import resolveConfig from 'tailwindcss/resolveConfig';
import { create } from 'twrnc';

import tailwindConfig from '../../tailwind.config';

import CONFIG from '@/config';

const theme = resolveConfig(tailwindConfig);

export const tw = create({
  ...tailwindConfig,
  plugins: [
    ...tailwindConfig.plugins,
    plugin(({ addUtilities }) => {
      addUtilities({
        '.box': `border border-[#000]`,
        '.font-black-italic': `font-black-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
        '.font-bold-italic': `font-bold-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
        '.font-extrabold-italic': `font-extrabold-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
        '.font-extralight-italic': `font-extralight-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
        '.font-light-italic': `font-light-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
        '.font-medium-italic': `font-medium-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
        '.font-sans-italic': `font-sans-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
        '.font-semibold-italic': `font-semibold-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
        '.font-thin-italic': `font-thin-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
      });
    }),
  ],
  theme: {
    ...tailwindConfig.theme,
    fontFamily: {
      black: CONFIG.IS_ANDROID ? 'InterBlack' : 'Inter 18pt Black',
      'black-italic': CONFIG.IS_ANDROID ? 'InterBlackItalic' : 'Inter 18pt Black Italic',
      bold: CONFIG.IS_ANDROID ? 'InterBold' : 'Inter 18pt Bold',
      'bold-italic': CONFIG.IS_ANDROID ? 'InterBoldItalic' : 'Inter 18pt Bold Italic',
      extrabold: CONFIG.IS_ANDROID ? 'InterExtraBold' : 'Inter 18pt ExtraBold',
      'extrabold-italic': CONFIG.IS_ANDROID
        ? 'InterExtraBoldItalic'
        : 'Inter 18pt ExtraBold Italic',
      extralight: CONFIG.IS_ANDROID ? 'InterExtraLight' : 'Inter 18pt ExtraLight',
      'extralight-italic': CONFIG.IS_ANDROID
        ? 'InterExtraLightItalic'
        : 'Inter 18pt ExtraLight Italic',
      light: CONFIG.IS_ANDROID ? 'InterLight' : 'Inter 18pt Light',
      'light-italic': CONFIG.IS_ANDROID ? 'InterLightItalic' : 'Inter 18pt Light Italic',
      medium: CONFIG.IS_ANDROID ? 'InterMedium' : 'Inter 18pt Medium',
      'medium-italic': CONFIG.IS_ANDROID ? 'InterMediumItalic' : 'Inter 18pt Medium Italic',
      sans: CONFIG.IS_ANDROID ? 'InterRegular' : 'Inter 18pt Regular',
      'sans-italic': CONFIG.IS_ANDROID ? 'InterItalic' : 'Inter 18pt Italic',
      semibold: CONFIG.IS_ANDROID ? 'InterSemiBold' : 'Inter 18pt SemiBold',
      'semibold-italic': CONFIG.IS_ANDROID ? 'InterSemiBoldItalic' : 'Inter 18pt SemiBold Italic',
      thin: CONFIG.IS_ANDROID ? 'InterThin' : 'Inter 18pt Thin',
      'thin-italic': CONFIG.IS_ANDROID ? 'InterThinItalic' : 'Inter 18pt Thin Italic',
    },
  },
});

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
