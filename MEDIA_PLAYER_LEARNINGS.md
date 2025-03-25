# Media Player Implementation Learnings

> **Note:** This document is part of a series of migration guides. For an overview and reading order, see [READ_ME_FIRST.md](./READ_ME_FIRST.md).

This document summarizes the key learnings from implementing a functional Now Playing widget in the NowPlayingTest project, and how these lessons can be applied to the Balearic FM Radio app.

## Key Learnings

### 1. Proper TrackPlayer Initialization

- **Module-level state tracking**: Use module-level variables (e.g., `isPlayerSetup`, `isServiceRegistered`) to prevent multiple initialization attempts.
- **Defensive error handling**: Wrap all TrackPlayer operations in try/catch blocks to prevent crashes.
- **Initialization sequence**: Follow a strict initialization sequence:
  1. Register the playback service
  2. Setup the player
  3. Configure capabilities
  4. Add tracks to the queue
  5. Start playback

### 2. Metadata Handling

- **API structure awareness**: Understand the exact structure of your metadata API response to correctly extract information.
- **Fallback values**: Always provide fallback values for title, artist, and artwork.
- **Periodic updates**: Set up a timer to periodically fetch fresh metadata.
- **Event-based updates**: Use the `PlaybackMetadataReceived` event to trigger metadata updates.
- **Complete metadata**: Ensure you're providing complete metadata including artwork URLs.

### 3. Now Playing Widget Integration

- **Artwork requirements**: The Now Playing widget requires high-quality artwork to display properly.
- **Release mode**: Build in Release mode for best Now Playing widget performance.
- **Background modes**: Ensure the app has the "Audio, AirPlay, and Picture in Picture" background mode enabled.
- **Proper cleanup**: Clean up resources (like intervals) when playback stops.

### 4. Error Handling and Debugging

- **Detailed logging**: Log each step of the process for easier debugging.
- **Specific error handling**: Handle specific error cases differently.
- **State checking**: Always check the current state before performing operations.
- **Graceful degradation**: Provide fallback behavior when errors occur.

### 5. Xcode Configuration

- **Team signing**: Ensure consistent team signing settings.
- **Build configuration**: Default to Release mode for production-quality performance.
- **Workspace settings**: Use shared workspace settings to maintain consistency.

## Implementation Details

### TrackPlayer Service Registration

```typescript
// Track if the service has been registered
let isServiceRegistered = false;

// Register the playback service
const registerPlaybackService = async () => {
  if (isServiceRegistered) {
    console.log('PlaybackService already registered');
    return;
  }
  
  try {
    console.log('Registering PlaybackService...');
    await TrackPlayer.registerPlaybackService(() => PlaybackService);
    isServiceRegistered = true;
    console.log('PlaybackService registered successfully');
  } catch (error) {
    console.error('Failed to register PlaybackService:', error);
  }
};
```

### TrackPlayer Setup

```typescript
// Track if the player has been set up
let isPlayerSetup = false;

// Configure the track player
export const setupTrackPlayer = async (): Promise<boolean> => {
  // If player is already set up, return true
  if (isPlayerSetup) {
    console.log('TrackPlayer already set up, skipping initialization');
    return true;
  }
  
  try {
    console.log('Setting up TrackPlayer...');
    
    // Check if TrackPlayer is already initialized
    try {
      const state = await TrackPlayer.getState();
      console.log('TrackPlayer already initialized, state:', state);
      
      // Reset the player to make sure there are no conflicts
      await TrackPlayer.reset();
      isPlayerSetup = true;
      return true;
    } catch (stateError) {
      // TrackPlayer is not initialized yet, continue with setup
      console.log('TrackPlayer not initialized yet, setting up...');
    }

    // Setup the player with default options
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });

    // Add capabilities to the player
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
      color: 0x3A6794,
    });

    console.log('TrackPlayer setup complete');
    isPlayerSetup = true;
    return true;
  } catch (error) {
    console.error('Error setting up TrackPlayer:', error);
    return false;
  }
};
```

### Metadata Fetching

```typescript
// Fetch current track metadata from API
export const fetchCurrentTrackMetadata = async (): Promise<{
  title: string;
  artist: string;
  artwork: string;
} | null> => {
  try {
    console.log('Fetching current track metadata from API...');
    const response = await fetch(METADATA_URL, {
      headers: {
        'User-Agent': 'AppName/1.0.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // The API returns an array, so we need to get the first item
    const responseData = data[0];
    
    if (!responseData || !responseData.now_playing || !responseData.now_playing.song) {
      console.error('Invalid API response structure:', data);
      return {
        title: 'Default Title',
        artist: 'Default Artist',
        artwork: DEFAULT_ARTWORK_URL
      };
    }
    
    // Extract the song data from the correct location
    const songData = responseData.now_playing.song;
    
    // Extract title, artist, and artwork
    const title = songData.title || 'Default Title';
    const artist = songData.artist || 'Default Artist';
    const artworkUrl = songData.art || DEFAULT_ARTWORK_URL;
    
    return { title, artist, artwork: artworkUrl };
  } catch (error) {
    console.error('Error fetching track metadata:', error);
    return null;
  }
};
```

### Playback Service Event Handling

```typescript
// Function to update the Now Playing metadata
const updateNowPlayingMetadata = async () => {
  try {
    // Fetch metadata from API
    const metadata = await fetchCurrentTrackMetadata();
    if (!metadata) return;
    
    // Update the track metadata
    await TrackPlayer.updateNowPlayingMetadata({
      title: metadata.title,
      artist: metadata.artist,
      artwork: metadata.artwork,
    });
    
    return metadata;
  } catch (error) {
    console.error('Error updating Now Playing metadata:', error);
    return null;
  }
};

// Initial metadata fetch
updateNowPlayingMetadata();

// Set up a timer to periodically fetch metadata
const metadataInterval = setInterval(updateNowPlayingMetadata, 30000); // Every 30 seconds

// Clean up the interval when the service is destroyed
TrackPlayer.addEventListener(Event.RemoteStop, () => {
  if (metadataInterval) {
    clearInterval(metadataInterval);
  }
});

// Handle metadata updates from the stream
TrackPlayer.addEventListener(Event.PlaybackMetadataReceived, async (metadata) => {
  console.log('Event.PlaybackMetadataReceived', metadata);
  
  try {
    // The stream metadata event only includes title and artist
    // We need to fetch the artwork separately
    const title = metadata.title || 'Default Title';
    const artist = metadata.artist || 'Default Artist';
    
    // Update with the basic metadata first
    await TrackPlayer.updateNowPlayingMetadata({
      title,
      artist,
      artwork: DEFAULT_ARTWORK_URL, // Use default artwork initially
    });
    
    // Then fetch complete metadata including artwork
    updateNowPlayingMetadata();
  } catch (error) {
    console.error('Error updating metadata:', error);
  }
});
```

## Next Steps

The next step is to examine the Balearic FM Radio app's current media player implementation and create a migration plan to incorporate these learnings.
