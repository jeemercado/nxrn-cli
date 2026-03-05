/* eslint-disable sort-keys */

/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.box': `border border-[#000]`,
      });
    }),
  ],
  theme: {
    // FOR FONTS: This is only for intellisense the real config is in apps/mobile/src/tailwind
    fontFamily: {
      black: 'InterBlack',
      'black-italic': 'InterBlackItalic',
      bold: 'InterBold',
      'bold-italic': 'InterBoldItalic',
      extrabold: 'InterExtraBold',
      'extrabold-italic': 'InterExtraBoldItalic',
      extralight: 'InterExtraLight',
      'extralight-italic': 'InterExtraLightItalic',
      light: 'InterLight',
      'light-italic': 'InterLightItalic',
      medium: 'InterMedium',
      'medium-italic': 'InterMediumItalic',
      sans: 'Inter',
      'sans-italic': 'InterItalic',
      semibold: 'InterSemiBold',
      'semibold-italic': 'InterSemiboldItalic',
      thin: 'InterThin',
      'thin-italic': 'InterThinItalic',
    },
    extend: {
      flex: {
        2: '2 2 0%',
      },
      colors: {
        white: '#ffffff',
        background: '#0f1419',
        disabled: '#6b7280',
        divider: '#3a4556',
        error: '#ef4444',
        foreground: '#f8f9fa',
        muted: '#e1e4e8',
        overlay: '#1e2d3d',
        placeholder: '#8b92a0',
        sheet: '#1a2332',
        subtitle: '#8b92a0',
        success: '#22c55e',
        surface: '#2a3544',
        underlay: '#131a26',
        // https://uicolors.app/create
        gray: {
          50: '#f7f8f8',
          100: '#ebedee',
          200: '#d9dade',
          300: '#b8bac1',
          400: '#91949f',
          500: '#737784',
          600: '#5d606c',
          700: '#4c4e58',
          800: '#41424b',
          900: '#36373d',
          950: '#26272b',
        },
        primary: {
          50: '#f0f7ff',
          100: '#e8f2f8',
          200: '#bbddfc',
          300: '#7fc0fa',
          400: '#3ba1f5',
          500: '#1185e6',
          600: '#0567c4',
          700: '#054f99',
          800: '#094683',
          900: '#0d3c6d',
          950: '#092648',
        },
        secondary: {
          50: '#f1fafe',
          100: '#e3f3fb',
          200: '#bde8f7',
          300: '#88d8f1',
          400: '#48c5e8',
          500: '#21add6',
          600: '#138db6',
          700: '#107094',
          800: '#125f7a',
          900: '#144f66',
          950: '#0e3243',
        },
      },
    },
  },
};
