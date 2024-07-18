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
    fontFamily: {
      sans: ['Roboto'],
    },
    extend: {
      flex: {
        2: '2 2 0%',
      },
      colors: {
        // https://uicolors.app/create
        black: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#000000',
        },
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
