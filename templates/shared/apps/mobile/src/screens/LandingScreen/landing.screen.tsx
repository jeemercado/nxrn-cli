import React, { useState } from 'react';
import { Image, View } from 'react-native';

import {
  Alert,
  BottomSheet,
  Button,
  DateModalInput,
  DateTextInput,
  Divider,
  InputLayout,
  Modal,
  OutlinedButton,
  ScreenContainer,
  ScreenHeader,
  SelectDropdown,
  Skeleton,
  TextInput,
  Toast,
  Typography,
  useBottomSheet,
  useModal,
} from '@/components';
import { requestPushNotification, useToggleDarkMode } from '@/hooks';
import { PublicScreenProps, Screens } from '@/routes';
import { tw } from '@/tailwind';

const DROPDOWN_OPTIONS = [
  { id: '1', label: 'React Native' },
  { id: '2', label: 'Flutter' },
  { id: '3', label: 'SwiftUI' },
  { id: '4', label: 'Jetpack Compose' },
];

function SectionTitle({ title }: { title: string }) {
  return <Typography style={tw`mb-2 mt-6 text-lg font-semibold`}>{title}</Typography>;
}

export function LandingScreen(_props: PublicScreenProps<Screens.LANDING>) {
  const [textValue, setTextValue] = useState('');
  const [dateModalValue, setDateModalValue] = useState<Date | undefined>();
  const [dateTextValue, setDateTextValue] = useState<Date | undefined>();
  const [selectedDropdown, setSelectedDropdown] = useState<string | undefined>();
  const { hideModal, isVisible: isModalVisible, showModal } = useModal();
  const { closeSheet, expandSheet, sheetRef } = useBottomSheet();
  const { colorScheme, toggleColorScheme } = useToggleDarkMode();
  const isDark = colorScheme === 'dark';

  return (
    <ScreenContainer>
      <ScreenHeader hasBackButton={false} title="Component Showcase" />
      <View style={tw`px-4 pb-8`}>
        {/* Logo */}
        <View style={tw`mt-4 items-center`}>
          <Image source={require('@/assets/images/logo.png')} style={{ height: 80, width: 80 }} />
        </View>

        {/* Theme Toggle */}
        <SectionTitle title="Theme" />
        <Button
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onPress={toggleColorScheme}
        />

        <Button
          style={tw`mt-3`}
          title="Request Push Notifications"
          onPress={() => requestPushNotification()}
        />

        <Divider style={tw`mt-4`} />

        {/* Typography */}
        <SectionTitle title="Typography" />
        <Typography style={tw`text-2xl font-bold`}>Heading Bold</Typography>
        <Typography style={tw`text-lg font-semibold`}>Subheading Semibold</Typography>
        <Typography style={tw`text-base`}>Body text regular</Typography>
        <Typography style={tw`text-sm text-gray-500`}>Caption text</Typography>

        <Divider style={tw`mt-4`} />

        {/* Buttons */}
        <SectionTitle title="Buttons" />
        <View style={tw`gap-3`}>
          <Button title="Primary Button" onPress={() => {}} />
          <Button isLoading title="Loading Button" onPress={() => {}} />
          <Button isDisabled title="Disabled Button" onPress={() => {}} />
          <OutlinedButton title="Outlined Button" onPress={() => {}} />
        </View>

        <Divider style={tw`mt-4`} />

        {/* TextInput */}
        <SectionTitle title="Text Input" />
        <View style={tw`gap-3`}>
          <InputLayout isRequired label="Name">
            <TextInput
              placeholder="Enter your name"
              value={textValue}
              onChangeText={setTextValue}
            />
          </InputLayout>
          <InputLayout error="This field is required" label="With Error">
            <TextInput placeholder="Something went wrong" value="" onChangeText={() => {}} />
          </InputLayout>
        </View>

        <Divider style={tw`mt-4`} />

        {/* Select Dropdown */}
        <SectionTitle title="Select Dropdown" />
        <InputLayout label="Framework">
          <SelectDropdown
            options={DROPDOWN_OPTIONS}
            placeholder="Choose a framework"
            selectedId={selectedDropdown}
            onSelect={setSelectedDropdown}
          />
        </InputLayout>

        <Divider style={tw`mt-4`} />

        {/* Date Inputs */}
        <SectionTitle title="Date Modal Input" />
        <InputLayout label="Birthday">
          <DateModalInput
            maximumDate={new Date()}
            placeholder="Pick a date"
            value={dateModalValue}
            onChange={setDateModalValue}
          />
        </InputLayout>

        <SectionTitle title="Date Text Input" />
        <InputLayout label="Date of Birth">
          <DateTextInput value={dateTextValue} onChange={setDateTextValue} />
        </InputLayout>

        <Divider style={tw`mt-4`} />

        {/* Skeleton */}
        <SectionTitle title="Skeleton" />
        <View style={tw`gap-2`}>
          <Skeleton isLoading>
            <View style={tw`h-5 w-3/4 rounded`} />
          </Skeleton>
          <Skeleton isLoading>
            <View style={tw`h-5 w-1/2 rounded`} />
          </Skeleton>
          <Skeleton isLoading>
            <View style={tw`h-10 w-full rounded-xl`} />
          </Skeleton>
        </View>

        <Divider style={tw`mt-4`} />

        {/* Alert */}
        <SectionTitle title="Alerts" />
        <View style={tw`gap-3`}>
          <Button
            title="Show Error Alert"
            onPress={() =>
              Alert.error({
                message: 'Something went wrong. Please try again.',
                title: 'Request Failed',
              })
            }
          />
          <Button
            title="Show Success Alert"
            onPress={() =>
              Alert.success({
                title: 'Profile Updated',
              })
            }
          />
          <Button
            title="Show Warning Alert"
            onPress={() =>
              Alert.warning({
                actions: [
                  { label: 'Cancel', variant: 'cancel' },
                  { label: 'Delete', onPress: () => {} },
                ],
                message: 'This action cannot be undone.',
                title: 'Delete Account',
              })
            }
          />
        </View>

        <Divider style={tw`mt-4`} />

        {/* Toast */}
        <SectionTitle title="Toasts" />
        <View style={tw`gap-3`}>
          <Button title="Success Toast" onPress={() => Toast.success('Profile saved')} />
          <Button title="Error Toast" onPress={() => Toast.error('Something went wrong')} />
          <Button title="Info Toast" onPress={() => Toast.info('New version available')} />
          <Button title="Warning Toast" onPress={() => Toast.warning('Check your connection')} />
        </View>

        <Divider style={tw`mt-4`} />

        {/* Modal */}
        <SectionTitle title="Modal" />
        <Button title="Open Modal" onPress={showModal} />
        <Modal isVisible={isModalVisible} onBackButtonPress={hideModal} onBackdropPress={hideModal}>
          <View pointerEvents="box-none" style={tw`flex-1 items-center justify-center`}>
            <View style={tw`dark:bg-sheet mx-8 w-[85%] rounded-2xl bg-white p-6`}>
              <Typography style={tw`text-lg font-semibold`}>Modal Title</Typography>
              <Typography style={tw`dark:text-subtitle mt-2 text-sm text-gray-500`}>
                This is a custom modal with any content you want.
              </Typography>
              <Button style={tw`mt-4`} title="Close" onPress={hideModal} />
            </View>
          </View>
        </Modal>

        <Divider style={tw`mt-4`} />

        {/* Bottom Sheet */}
        <SectionTitle title="Bottom Sheet" />
        <Button title="Open Bottom Sheet" onPress={expandSheet} />
        <BottomSheet
          backgroundStyle={tw`dark:bg-sheet bg-white`}
          sheetRef={sheetRef}
          snapPoints={['40%']}
        >
          <View style={tw`p-6`}>
            <Typography style={tw`text-lg font-semibold`}>Bottom Sheet</Typography>
            <Typography style={tw`dark:text-subtitle mt-2 text-sm text-gray-500`}>
              Swipe down or tap the backdrop to dismiss.
            </Typography>
            <Button style={tw`mt-4`} title="Close" onPress={closeSheet} />
          </View>
        </BottomSheet>
      </View>
    </ScreenContainer>
  );
}
