# NowPlayingTest Migration Strategy

## Migration Overview

The migration from expo-av to react-native-track-player is designed to be incremental and non-disruptive. The strategy focuses on maintaining backward compatibility while introducing new functionality.

## Migration Principles

1. **Incremental Approach**: The migration is divided into phases, allowing for testing and validation at each step.

2. **Backward Compatibility**: The new implementation maintains compatibility with the existing API to minimize disruption.

3. **Clear Separation**: New code is clearly separated from old code to avoid confusion and facilitate maintenance.

4. **Comprehensive Documentation**: Each step of the migration is documented to ensure clarity and reproducibility.

5. **Thorough Testing**: Each phase includes testing to ensure functionality is maintained.

## Migration Phases

### Phase 1: Add TrackPlayer Dependencies

This phase focuses on adding the necessary dependencies and preparing the project for the migration.

**Tasks:**
- Add react-native-track-player dependency
- Update iOS configuration for background audio
- Create new TrackPlayer files with basic structure

**Files to Create:**
```
utils/
  trackPlayer/
    index.ts                  // Re-exports everything for easy imports
    setup.ts                  // Player setup and initialization
    types.ts                  // Shared type definitions
```

### Phase 2: Implement Core TrackPlayer Functionality

This phase implements the core functionality for live stream playback.

**Tasks:**
- Create TrackPlayerContext with basic state management
- Implement TrackPlayer Service for handling playback events
- Implement TrackPlayer Utilities for live stream playback

**Files to Create:**
```
utils/
  trackPlayer/
    playback.ts               // Core playback functions
    metadata.ts               // Metadata fetching and handling
    service.ts                // Playback service implementation
    events.ts                 // Event handling

context/
  TrackPlayerContext/
    index.tsx                 // Main context and provider
    state.ts                  // State management
```

### Phase 3: Integrate Podcast Playback

This phase adds podcast playback functionality to the TrackPlayer implementation.

**Tasks:**
- Add podcast playback to TrackPlayerUtils
- Update TrackPlayerContext with podcast functionality

**Files to Create/Update:**
```
utils/
  trackPlayer/
    queue.ts                  // Queue management for podcasts
```

### Phase 3.5: Implement UI-Focused Queue

This phase implements a UI-focused queue for visual feedback while using TrackPlayer's native queue for technical aspects.

**Tasks:**
- Implement queue state management
- Create queue utility functions
- Integrate queue with TrackPlayerContext

**Files to Create/Update:**
```
context/
  TrackPlayerContext/
    hooks.ts                  // Custom hooks for accessing player features
```

### Phase 4: Implement Compatibility Layer

This phase creates a compatibility layer to maintain backward compatibility with the existing API.

**Tasks:**
- Create compatibility layer for backward compatibility
- Update components to use the new API

**Files to Create:**
```
context/
  TrackPlayerContext/
    compatibility.tsx         // Compatibility layer
```

### Phase 5: Testing and Refinement

This phase focuses on testing and refining the implementation.

**Tasks:**
- Test live stream playback
- Test podcast playback
- Test background playback
- Test edge cases
- Refine implementation based on testing results

## Naming Strategy

The migration uses a hybrid naming approach:

1. **New Namespace**: All new functions and components are placed in a new namespace (TrackPlayer) to avoid conflicts.

2. **Similar Function Names**: New functions have similar names to old functions to maintain familiarity.

3. **Compatibility Layer**: The compatibility layer provides functions with the same names as the old API.

4. **Deprecation Markers**: Old functions are marked as deprecated to encourage migration to the new API.

**Example:**
```typescript
// Old API
const playLiveStream = async () => {
  // Implementation using expo-av
};

// New API
const playerPlayLiveStream = async () => {
  // Implementation using react-native-track-player
};

// Compatibility layer
const playLiveStream = async () => {
  console.warn('playLiveStream is deprecated. Use playerPlayLiveStream instead.');
  return playerPlayLiveStream();
};
```

## File Organization Strategy

The migration uses a modular file structure to improve maintainability:

```
utils/
  trackPlayer/
    index.ts                  // Re-exports everything for easy imports
    setup.ts                  // Player setup and initialization
    metadata.ts               // Metadata fetching and handling
    playback.ts               // Core playback functions
    queue.ts                  // Queue management
    types.ts                  // Shared type definitions
    events.ts                 // Event handling
    service.ts                // Playback service implementation
  
context/
  TrackPlayerContext/
    index.tsx                 // Main context and provider
    hooks.ts                  // Custom hooks for accessing player features
    state.ts                  // State management
    compatibility.tsx         // Compatibility layer
```

## Queue Implementation Strategy

The migration uses a hybrid approach for queue management:

1. **TrackPlayer's Native Queue**: Used for technical aspects of playback.

2. **UI-Focused Queue**: Maintained for visual feedback and user interaction.

3. **Synchronization**: The two queues are kept in sync through the TrackPlayerContext.

**Example:**
```typescript
// Add a track to the queue
const enqueueTrack = async (track) => {
  // Add to TrackPlayer's native queue
  await TrackPlayer.add(track);
  
  // Update UI queue
  setQueue((prevQueue) => [...prevQueue, track]);
};
```

## Metadata Handling Strategy

The migration maintains the existing metadata structure:

1. **Live Streams**: Artist name goes in title field, song title in description.

2. **Podcasts**: Standard title/artist/description mapping.

**Example:**
```typescript
// Create a stream track
const createStreamTrack = (metadata) => ({
  id: 'balearic-fm-stream',
  url: STREAM_URL,
  title: metadata?.title || 'Balearic FM',
  artist: metadata?.artist || 'Balearic FM',
  description: metadata?.description || 'Live radio stream',
  artwork: metadata?.artwork || DEFAULT_ARTWORK_URL,
  duration: 0,
  isLiveStream: true,
});
```

## Error Handling Strategy

The migration implements a comprehensive error handling strategy:

1. **Try/Catch Blocks**: All TrackPlayer operations are wrapped in try/catch blocks.

2. **Detailed Error Logging**: Errors are logged with detailed information.

3. **Graceful Degradation**: The implementation gracefully handles error cases.

4. **Defensive Programming**: The implementation uses defensive programming techniques to prevent errors.

**Example:**
```typescript
const playStream = async () => {
  try {
    await TrackPlayer.reset();
    const track = createStreamTrack(currentMetadata);
    await TrackPlayer.add(track);
    await TrackPlayer.play();
    return true;
  } catch (error) {
    console.error('Error playing stream:', error);
    return false;
  }
};
```

## Testing Strategy

The migration includes a comprehensive testing strategy:

1. **Unit Testing**: Individual functions and components are tested in isolation.

2. **Integration Testing**: The interaction between components is tested.

3. **End-to-End Testing**: The complete flow is tested from user interaction to playback.

4. **Edge Case Testing**: Edge cases and error scenarios are tested.

**Example Test Cases:**
- Play live stream and verify Now Playing widget appears
- Play podcast and verify metadata is displayed correctly
- Test background playback and verify it continues
- Test error handling when network is unavailable
