# NowPlayingTest Product Context

## Problem Statement

The BalearicFmRadio app currently uses expo-av for audio playback, which has several limitations:

1. **Limited Now Playing Widget Support**: The current implementation using expo-av has poor support for the iOS Now Playing widget, resulting in inconsistent metadata display and limited control options.

2. **Manual Metadata Handling**: Metadata updates must be handled manually, leading to potential inconsistencies and additional code complexity.

3. **Complex State Management**: The current implementation uses a custom dispatcher pattern with multiple layers, making the code difficult to maintain and extend.

4. **Error Handling Challenges**: Multiple try/catch blocks and error states are required to handle various edge cases.

5. **Limited Background Audio Controls**: expo-av provides limited support for background playback controls.

## User Experience Goals

1. **Seamless Audio Playback**: Users should experience uninterrupted audio playback, even when the app is in the background.

2. **System Integration**: The app should integrate with iOS system controls, allowing users to control playback from:
   - Lock screen
   - Control Center
   - Headphone controls
   - CarPlay

3. **Accurate Metadata Display**: Current track information should be accurately displayed in the Now Playing widget, including:
   - Artist name
   - Track title
   - Artwork

4. **Responsive Controls**: Playback controls should respond immediately to user input, regardless of where they are triggered.

5. **Consistent Experience**: The user experience should be consistent across different interaction points (in-app, widget, Control Center).

## Target Users

1. **BalearicFmRadio Listeners**: People who use the app to listen to live streams and podcasts.

2. **iOS Users**: Specifically targeting users on iOS devices who expect system-level integration.

3. **Mobile Listeners**: Users who listen while on the go, often with the app in the background.

## Use Cases

1. **Live Stream Playback**:
   - User opens the app and taps "Play" to start the live stream
   - User puts the phone in their pocket while listening
   - User controls playback from lock screen or Control Center

2. **Podcast Playback**:
   - User selects a podcast episode to play
   - User navigates away from the app while listening
   - User uses system controls to pause/resume playback

3. **Switching Between Content**:
   - User is listening to a podcast and decides to switch to the live stream
   - User uses in-app or system controls to make the switch

4. **Metadata Viewing**:
   - User wants to see what's currently playing without unlocking their phone
   - User checks the lock screen or Control Center to view track information

## Success Metrics

1. **Technical Success**:
   - Now Playing widget appears consistently
   - Metadata updates correctly
   - Background playback works reliably
   - System controls function as expected

2. **User Experience Success**:
   - Seamless transition between app and system controls
   - Accurate and timely metadata display
   - Responsive playback controls
   - Consistent behavior across different interaction points

## Constraints

1. **Backward Compatibility**: The migration must maintain compatibility with existing features and user expectations.

2. **Performance**: The implementation must not significantly impact app performance or battery life.

3. **Maintenance**: The solution should be easier to maintain than the current implementation.

4. **iOS Limitations**: The implementation must work within the constraints of iOS background execution and audio session management.
