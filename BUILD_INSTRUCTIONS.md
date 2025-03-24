y# NowPlayingTest Build Instructions

This document provides instructions for building and running the NowPlayingTest app, including automated build processes using VS Code tasks and npm scripts.

## Prerequisites

- Node.js and npm installed
- Xcode installed (for iOS builds)
- CocoaPods installed (`sudo gem install cocoapods`)
- Physical iOS device for testing the Now Playing widget

## Automated Build Options

### Option 1: VS Code Tasks

VS Code tasks have been configured to automate the build process. To use them:

1. Open the Command Palette (`Cmd+Shift+P`)
2. Type "Tasks: Run Task" and select it
3. Choose one of the following tasks:

#### Available Tasks

- **Expo iOS Full Setup**: Runs prebuild, pod install, and starts the development server
- **Expo iOS Full Setup with Xcode**: Runs prebuild, pod install, opens Xcode, and starts the development server
- **Expo iOS Release Build**: Runs prebuild and pod install (for release builds in Xcode)
- **Prebuild iOS**: Only runs the prebuild step
- **Pod Install**: Only runs pod install
- **Start Dev Server**: Only starts the development server
- **Open Xcode Workspace**: Only opens the Xcode workspace

#### Keyboard Shortcut

You can also use `Cmd+Shift+B` to run the default build task (Expo iOS Full Setup).

### Option 2: npm Scripts

Two npm scripts have been added to package.json for automating the build process:

```bash
# Development build with dev server
npm run ios-setup

# Release build directly to device
npm run ios-release
```

## Manual Build Process

If you prefer to run the commands manually:

1. **Prebuild the iOS project**:
   ```bash
   npx expo prebuild -p ios --clean
   ```

2. **Install CocoaPods dependencies**:
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Start the development server**:
   ```bash
   npx expo start --dev-client
   ```

4. **Open Xcode and build to device**:
   ```bash
   open ios/NowPlayingTest.xcworkspace
   ```

## Testing the Now Playing Widget

For the Now Playing widget to work properly, you need to:

1. Build the app in Release mode (for best results)
2. Run on a physical iOS device (not a simulator)
3. Play the audio stream
4. Lock the screen or go to the home screen
5. Check the Now Playing widget in Control Center

### Building in Release Mode

In Xcode:
1. Click on the scheme selector (next to the Run button)
2. Select "Edit Scheme..."
3. Change the Build Configuration from "Debug" to "Release"
4. Run the app on your device

## Troubleshooting

- **Build errors**: Try cleaning the build folder in Xcode (Product > Clean Build Folder)
- **Pod install issues**: Try `pod repo update` before running pod install
- **Now Playing widget not appearing**: Make sure you're testing on a physical device and that the app has background audio capabilities enabled
