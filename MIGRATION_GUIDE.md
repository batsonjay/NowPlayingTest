# Migration Guide: expo-av to react-native-track-player

This document outlines the changes made to the NowPlayingTest project to migrate from expo-av to react-native-track-player, and the implications for migrating the BalearicFmRadio app.

## Overview of Changes

1. **Added Dependencies**
   - Added `react-native-track-player` package

2. **New Files Created**
   - `utils/trackPlayerService.js`: Service for handling playback events
   - `utils/trackPlayerUtils.js`: Utility functions for track player operations
   - `context/TrackPlayerContext.tsx`: React context for track player state

3. **Modified Files**
   - `app/_layout.tsx`: Updated to use TrackPlayerProvider and register the playback service
   - `app/(tabs)/index.tsx`: Updated to use the TrackPlayer context

## Key API Differences

### Initialization

**expo-av**:
```javascript
// No explicit initialization required
const sound = new Audio.Sound();
```

**react-native-track-player**:
```javascript
// Setup required before use
await TrackPlayer.setupPlayer();
await TrackPlayer.updateOptions({
  capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
  // ...other options
});
```

### Playing Audio

**expo-av**:
```javascript
await sound.loadAsync({ uri: STREAM_URL });
await sound.playAsync();
```

**react-native-track-player**:
```javascript
await TrackPlayer.reset();
await TrackPlayer.add({
  id: 'stream',
  url: STREAM_URL,
  title: 'Title',
  artist: 'Artist',
  // ...other metadata
});
await TrackPlayer.play();
```

### Stopping Audio

**expo-av**:
```javascript
await sound.stopAsync();
await sound.unloadAsync();
```

**react-native-track-player**:
```javascript
await TrackPlayer.stop();
await TrackPlayer.reset(); // Optional: clear the queue
```

### Event Handling

**expo-av**:
```javascript
sound.setOnPlaybackStatusUpdate((status) => {
  // Handle status updates
});
```

**react-native-track-player**:
```javascript
// In a separate service file
TrackPlayer.addEventListener(Event.PlaybackState, (state) => {
  // Handle state changes
});

TrackPlayer.addEventListener(Event.PlaybackMetadataReceived, (metadata) => {
  // Handle metadata updates
});
```

### Now Playing Metadata

**expo-av**:
```javascript
// Limited support for Now Playing metadata
await sound.setStatusAsync({
  progressUpdateIntervalMillis: 1000,
  shouldPlay: true,
  // ...other status options
});
```

**react-native-track-player**:
```javascript
// Full support for Now Playing metadata
await TrackPlayer.updateNowPlayingMetadata({
  title: 'Track Title',
  artist: 'Artist Name',
  artwork: 'https://example.com/artwork.jpg',
  // ...other metadata
});
```

## Implications for BalearicFmRadio

### Architecture Changes

1. **AudioCore Class**
   - The `AudioCore` class would be replaced with react-native-track-player's API
   - The `configureAudioSession` method would be replaced with TrackPlayer's setup and options

2. **PlaybackDispatcher**
   - The `PlaybackDispatcher` would need significant refactoring to use track-player's event system
   - The state management would be simplified as track-player handles more internally

3. **Queue Management**
   - The custom queue system would be replaced with track-player's built-in queue

### Migration Steps for BalearicFmRadio

1. **Install Dependencies**
   ```bash
   npm install react-native-track-player
   ```

2. **Create Service File**
   - Create a service file similar to `utils/trackPlayerService.js`
   - Register the service in the app entry point

3. **Create Track Player Utilities**
   - Create utility functions for common operations
   - Map the current dispatcher actions to track player functions

4. **Update PlaybackContext**
   - Modify the context to use track player instead of expo-av
   - Update the state management to use track player events

5. **Update UI Components**
   - Update any components that use the PlaybackContext to work with the new API

### Benefits of Migration

1. **Full Now Playing Widget Support**
   - Proper integration with iOS Now Playing widget
   - Better background playback handling

2. **Simplified Code**
   - Less custom code for audio handling
   - Better error handling and recovery

3. **Better User Experience**
   - More reliable playback
   - Better integration with system controls

### Potential Challenges

1. **API Differences**
   - Different approach to queue management
   - Different event system

2. **Custom Features**
   - May need to reimplement some custom features
   - Ensure podcast playback position tracking works similarly

3. **Error Handling**
   - Need to ensure robust error handling is maintained

## Testing Recommendations

1. Test basic playback functionality
2. Test background playback
3. Test Now Playing widget integration
4. Test error recovery
5. Test with different network conditions

## Conclusion

Migrating from expo-av to react-native-track-player will provide better Now Playing widget support and a more robust audio playback experience. The migration will require significant changes to the audio handling code, but the benefits in terms of user experience and code maintainability will be worth the effort.
