# Capacitor Mobile Setup Guide

This document explains how to set up and build AviationPro for iOS and Android using Capacitor.

## Prerequisites

### macOS (for iOS development)
- Xcode 14.0 or later
- CocoaPods (installed via Ruby)
- Node.js 16+

### All Platforms
- Node.js 16 or later
- npm or yarn
- Capacitor CLI: `npm install -g @capacitor/cli`

### Android Development
- Android Studio with SDK API Level 24 or later
- JDK 11 or later
- ANDROID_SDK_ROOT environment variable set

## Installation Steps

### 1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install --save-dev @capacitor/core @capacitor/cli
```

### 2. Initialize Capacitor

```bash
# From the project root
npx cap init

# When prompted:
# App name: AviationPro
# App Package ID: com.aviationpro.app
# Use the provided capacitor.config.ts as reference
```

### 3. Add Platforms

```bash
# Add iOS
npx cap add ios

# Add Android
npx cap add android
```

### 4. Install Essential Plugins

```bash
# Splash Screen
npm install @capacitor/splash-screen

# File system (for data export)
npm install @capacitor/filesystem

# Share (for CSV export to other apps)
npm install @capacitor/share

# Battery status (for future watch integration)
npm install @capacitor/battery

# App (for version info)
npm install @capacitor/app
```

### 5. Build the Web App

```bash
npm run build
```

## Development Workflow

### Web Development
```bash
# Run the web dev server
npm run dev

# In another terminal, run Capacitor in live reload mode
npx cap serve
```

### iOS Development

```bash
# Sync the build to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Select "AviationPro" target
# 2. Choose a simulator or connected device
# 3. Click the play button to build and run
```

### Android Development

```bash
# Sync the build to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# In Android Studio:
# 1. Let Gradle sync
# 2. Click "Run" (green play button)
# 3. Select an emulator or connected device
```

## Build for Production

### iOS
```bash
# Build the web app
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Select "Any iOS Device (arm64)" from the device selector
# 2. Go to Product > Archive
# 3. Follow the Xcode archiving workflow
```

### Android
```bash
# Build the web app
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# In Android Studio:
# 1. Go to Build > Generate Signed Bundle/APK
# 2. Follow the wizard to create a release key
# 3. Choose AAB (for Play Store) or APK (for direct distribution)
```

## Useful Commands

```bash
# Check Capacitor status
npx cap doctor

# Sync web build to all platforms
npx cap sync

# Sync to specific platform
npx cap sync ios
npx cap sync android

# Update plugin dependencies
npx cap update

# List installed plugins
npx cap plugin list
```

## File Structure

After initialization, you'll have:

```
AviationPro/
├── ios/              # iOS native project
│   └── App/          # Xcode project
├── android/          # Android native project
│   └── app/          # Android Studio project
├── dist/             # Built web app (output of npm run build)
├── capacitor.config.ts
└── package.json
```

## Offline-First Architecture

Capacitor inherits the offline-first architecture:
- All data stored in IndexedDB (persistent across app sessions)
- localStorage fallback for legacy data
- No required internet connection for core features
- Weather data cached for 30 minutes
- Optional syncing with remote servers (future)

## Plugin Configuration

### Splash Screen
The splash screen is configured in `capacitor.config.ts`:
```typescript
SplashScreen: {
  launchAutoHide: true,
  launchShowDuration: 3000,
}
```

### Native Plugins
Future plugins can be configured by adding them to the `plugins` section in `capacitor.config.ts`.

## Troubleshooting

### iOS Build Fails
```bash
# Clear iOS build
rm -rf ios/Pods ios/Podfile.lock

# Reinstall
npx cap sync ios
```

### Android Build Fails
```bash
# Clear Android build
rm -rf android/.gradle android/build

# Reinstall
npx cap sync android
```

### Plugin Not Found
```bash
# Reinstall plugins
npm install
npx cap sync
npx cap update
```

## Next Steps

1. **Testing**: Use native debuggers (Xcode for iOS, Android Studio for Android)
2. **App Store**: Follow App Store Connect and Google Play guidelines
3. **Updates**: Implement dynamic update strategy using Capacitor
4. **Native Features**: Add additional plugins as needed (camera, geolocation, etc.)
5. **Smartwatch**: Later add WatchKit (iOS) and Wear OS (Android) companion apps

## Resources

- [Capacitor Documentation](https://capacitorjs.com)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [iOS Build Guide](https://capacitorjs.com/docs/ios)
- [Android Build Guide](https://capacitorjs.com/docs/android)
