# React Native Mobile App Starter with NX

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📦 Introduction

A comprehensive React Native mobile application starter kit built with Nx workspace. This package provides a carefully curated set of tools and libraries to streamline your mobile app development process with React Native 0.78.0 and the New Architecture.

<h2 id="🛠-usage">🛠 Usage</h2>
<p>Generate a new Nx workspace with the React Native preset:</p>
<pre><code class="language-bash">npx nx-react-native-cli@latest create
</code></pre>

## 🚀 Features

### Core Technologies
- **Yarn**: Fast, reliable, and secure dependency management
- **React Native 0.78.0**: Latest version with New Architecture support
- **TypeScript**: Strongly typed JavaScript for better code quality
- **Nx Workspace**: Powerful monorepo tooling for scalable development
- **TailwindCSS via TWRNC**: Utility-first CSS framework for fast UI development

### UI & Animation
- **React Native Reanimated**: Powerful animations for smooth user experiences
- **React Native Gesture Handler**: Fluid gesture-based interactions
- **React Native SVG**: SVG support for vector graphics
- **Lottie**: Beautiful animations with minimal effort
- **@shopify/react-native-skia**: High-performance 2D graphics
- **@gorhom/bottom-sheet**: Customizable bottom sheet component

### Navigation
- **React Navigation v7**: Complete navigation solution with native stack, material top tabs, and stack navigators

### State Management
- **Zustand**: Simple, fast state management
- **Jotai**: Primitive and flexible state management
- **React Query (TanStack Query)**: Data fetching and server state management
- **React Hook Form**: Performant, flexible form handling

### Storage & Persistence
- **React Native MMKV**: High-performance key-value storage
- **TanStack Query Persistence**: Persist and rehydrate query cache

### Data Validation
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Connect Zod with React Hook Form

### Developer Experience
- **ESLint & Prettier**: Code quality and formatting
- **Jest & Testing Library**: Comprehensive testing setup
- **Husky**: Git hooks for code quality
- **Fastlane**: Automated deployment for iOS and Android

## 🚀 Getting Started

### Running the Application

To get started with development, follow these simple commands:

```bash
# Start the Metro bundler
npm run serve:mobile

# Build and run on Android
npm run android

# Open the iOS project in Xcode for building and running
npm run xcode
```

These commands will help you:
- `serve:mobile`: Start the Metro bundler which compiles your JavaScript code
- `android`: Build and install the app on an Android device or emulator
- `xcode`: Open the iOS project in Xcode where you can build and run on iOS simulators or physical devices

## 📄 License

MIT
 
## 🙏 Acknowledgements

This project uses various open-source libraries and tools. We're grateful to the maintainers and contributors of these projects.
