/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@env' {
  export const IS_LIVE: any;
  export const STORAGE_KEY: any;
  export const API_BASE_URL: any;
}
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.config';
declare module 'twrnc';
