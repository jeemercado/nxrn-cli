import {
  TEXT_INPUT_LINE_HEIGHT,
  TEXT_INPUT_MIN_HEIGHT,
} from '@/components/atoms/TextInput/constants';

export function getTextInputHeightAdjustment(numberOfNewLines: number) {
  if (numberOfNewLines < 2) {
    return TEXT_INPUT_MIN_HEIGHT;
  }

  return TEXT_INPUT_MIN_HEIGHT + (numberOfNewLines - 2) * TEXT_INPUT_LINE_HEIGHT;
}
