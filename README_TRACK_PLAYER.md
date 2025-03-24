# NowPlayingTest with react-native-track-player

> **Note:** This document is part of a series of migration guides. For an overview and reading order, see [READ_ME_FIRST.md](./READ_ME_FIRST.md).

This project demonstrates how to use react-native-track-player to play a streaming audio source and display it in the iOS Now Playing widget.

## Overview

The app has been migrated from using expo-av to react-native-track-player to provide better support for the iOS Now Playing widget. The implementation includes:

- A service file for handling playback events
- Utility functions for track player operations
- A React context for track player state
- UI components that use the track player context

## Building and Running the App

### Prerequisites

- Node.js and npm
- Xcode (for iOS)
- A physical iOS device (for testing the Now Playing widget)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the iOS app:
   ```bash
   npx expo prebuild -p ios
   cd ios
   pod install
   ```

3. Open the Xcode project:
   ```bash
   open NowPlayingTest.xcworkspace
   ```

4. In Xcode:
   - Select your team in the Signing & Capabilities section
   - Connect your iOS device
   - Select your device from the device dropdown
   - Click the Run button to build and run the app on your device

## Testing the Now Playing Widget

1. Launch the app on your iOS device
2. Press the "Play Stream" button to start playback
3. Lock your screen or go to the home screen
4. Swipe down from the top-right corner to open Control Center
5. The Now Playing widget should appear with the stream information
6. You can also check the Lock Screen for the Now Playing controls

## Troubleshooting

If the Now Playing widget doesn't appear:

1. Make sure you're testing on a physical iOS device, not a simulator
2. Check the console logs for any errors
3. Ensure the app has the "Audio, AirPlay, and Picture in Picture" background mode enabled in Xcode
4. Try restarting the app and the device

## Implementation Details

### Key Files

- `utils/trackPlayerService.js`: Service for handling playback events
- `utils/trackPlayerUtils.js`: Utility functions for track player operations
- `context/TrackPlayerContext.tsx`: React context for track player state
- `app/_layout.tsx`: App entry point that registers the playback service
- `app/(tabs)/index.tsx`: Home screen with playback controls

### How It Works

1. The app registers the playback service when it starts
2. The TrackPlayerProvider sets up the player and provides state to components
3. When the user presses the play button, the app adds the stream to the queue and starts playback
4. The playback service handles remote control events (play, pause, stop)
5. When metadata is received from the stream, it updates the Now Playing information

## Migration from expo-av

For details on the migration from expo-av to react-native-track-player, see the [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) file.

## Next Steps

- Test the app on a physical iOS device
- Verify that the Now Playing widget appears and displays the correct information
- Check that the remote control events (play, pause, stop) work correctly
- If everything works as expected, consider migrating the BalearicFmRadio app to use react-native-track-player

## Technical Implementation Details

For detailed technical implementation learnings, best practices, and code examples, please refer to the [MEDIA_PLAYER_LEARNINGS.md](./MEDIA_PLAYER_LEARNINGS.md) document. This document contains in-depth information about:

- Proper TrackPlayer initialization
- Metadata handling
- Now Playing widget integration
- Error handling and debugging
- Xcode configuration

The MEDIA_PLAYER_LEARNINGS.md document is intended for developers who want to understand the technical details of the implementation.
