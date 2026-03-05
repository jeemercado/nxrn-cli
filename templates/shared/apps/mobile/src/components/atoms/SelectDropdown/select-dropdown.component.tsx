/* eslint-disable max-params */
/* eslint-disable no-magic-numbers */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';

import { Modal, Typography } from '@/components';
import { ChevronDownIcon, ChevronRightIcon } from '@/icons';
import { colors, defaultInputContainerStyle, defaultInputTextStyle, tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

const DROPDOWN_OFFSET = 8;
const MAX_MENU_HEIGHT = 320;
const OPTION_ROW_HEIGHT = 48;

type DropdownOption = {
  id: string;
  label: string;
};

type DropdownLayout = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type Props = DefaultComponentProps & {
  label?: string;
  options: DropdownOption[];
  placeholder?: string;
  selectedId?: string;
  onSelect: (id: string) => void;
};

type OptionItemProps = {
  isLast: boolean;
  isSelected: boolean;
  label: string;
  onPress: () => void;
};

function OptionItem(props: OptionItemProps) {
  const { isLast, isSelected, label, onPress } = props;

  return (
    <Pressable
      style={[
        tw`flex-row items-center justify-between px-4 py-3`,
        !isLast && tw`dark:border-divider border-b border-gray-200`,
      ]}
      onPress={onPress}
    >
      <View style={tw`flex-1`}>
        <Typography
          style={[
            tw`text-base`,
            isSelected ? tw`text-primary-500 font-medium` : tw`dark:text-foreground text-gray-800`,
          ]}
        >
          {label}
        </Typography>
      </View>
    </Pressable>
  );
}

export function SelectDropdown(props: Props) {
  const { label, onSelect, options, placeholder = 'Select', selectedId, style } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dropdownLayout, setDropdownLayout] = useState<DropdownLayout | null>(null);
  const triggerRef = useRef<View>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.id === selectedId),
    [options, selectedId],
  );
  const selectedLabel = selectedOption?.label ?? placeholder;
  const lastIndex = options.length - 1;

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback(
    (optionId: string) => {
      onSelect(optionId);
      setIsOpen(false);
    },
    [onSelect],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownLayout({ height, width, x, y });
    });
  }, [isOpen]);

  const optionPressHandlers = useMemo(() => {
    const handlers: Record<string, () => void> = {};

    options.forEach((option) => {
      handlers[option.id] = () => handleSelect(option.id);
    });

    return handlers;
  }, [handleSelect, options]);

  function renderOption(option: DropdownOption, index: number) {
    const handlePress = optionPressHandlers[option.id];

    return (
      <OptionItem
        key={option.id}
        isLast={index === lastIndex}
        isSelected={option.id === selectedId}
        label={option.label}
        onPress={handlePress}
      />
    );
  }

  function renderMenu() {
    if (!dropdownLayout) {
      return null;
    }

    const screenHeight = Dimensions.get('window').height;
    const estimatedMenuHeight = Math.min(MAX_MENU_HEIGHT, options.length * OPTION_ROW_HEIGHT);
    const spaceBelow = screenHeight - (dropdownLayout.y + dropdownLayout.height) - DROPDOWN_OFFSET;
    const spaceAbove = dropdownLayout.y - DROPDOWN_OFFSET;
    const canOpenBelow = spaceBelow >= estimatedMenuHeight;
    const canOpenAbove = spaceAbove >= estimatedMenuHeight;
    const shouldOpenBelow =
      canOpenBelow || (!canOpenBelow && !canOpenAbove && spaceBelow >= spaceAbove);
    const preferredTop = shouldOpenBelow
      ? dropdownLayout.y + dropdownLayout.height + DROPDOWN_OFFSET
      : dropdownLayout.y - estimatedMenuHeight - DROPDOWN_OFFSET;
    const clampedTop = Math.min(
      Math.max(0, preferredTop),
      Math.max(0, screenHeight - estimatedMenuHeight - DROPDOWN_OFFSET),
    );

    return (
      <View
        style={[
          tw`dark:border-divider dark:bg-sheet absolute z-50 max-h-80 rounded-xl border border-gray-200 bg-white`,
          {
            elevation: 5,
            left: dropdownLayout.x,
            shadowColor: colors.gray[900],
            shadowOffset: {
              height: 2,
              width: 0,
            },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            top: clampedTop,
            width: dropdownLayout.width,
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={tw`max-h-80`}>
          {options.map(renderOption)}
        </ScrollView>
      </View>
    );
  }

  return (
    <>
      {label && (
        <Typography style={tw`mb-1 text-sm font-medium text-gray-700 dark:text-gray-300`}>
          {label}
        </Typography>
      )}
      <Pressable
        ref={triggerRef}
        style={[
          defaultInputContainerStyle,
          tw`dark:border-divider dark:bg-surface items-center justify-between`,
          style,
        ]}
        onPress={handleToggle}
      >
        <View style={tw`flex-1`}>
          <Typography
            style={[
              defaultInputTextStyle,
              tw`dark:text-foreground`,
              !selectedOption && tw`dark:text-placeholder text-gray-400`,
            ]}
          >
            {selectedLabel}
          </Typography>
        </View>
        {isOpen ? (
          <ChevronDownIcon height={20} style={tw`dark:text-subtitle text-gray-500`} width={20} />
        ) : (
          <ChevronRightIcon height={20} style={tw`dark:text-subtitle text-gray-500`} width={20} />
        )}
      </Pressable>

      <Modal
        containerStyle={tw`flex-1 p-0`}
        isVisible={isOpen}
        onBackButtonPress={handleClose}
        onBackdropPress={handleClose}
      >
        <View pointerEvents="box-none" style={tw`flex-1`}>
          {renderMenu()}
        </View>
      </Modal>
    </>
  );
}
