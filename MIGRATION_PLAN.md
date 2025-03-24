# Migration Plan: Integrating TrackPlayer into Balearic FM Radio

> **Note:** This document is part of a series of migration guides. For an overview and reading order, see [READ_ME_FIRST.md](./READ_ME_FIRST.md).

This document outlines the plan for migrating the Balearic FM Radio app from its current audio implementation (using expo-av) to the react-native-track-player implementation developed in the NowPlayingTest project.

## Current Implementation Analysis

The Balearic FM Radio app currently uses:

1. **expo-av** for audio playback
2. A custom architecture with:
   - `PlaybackContext.js` - Context provider for playback state
   - `PlaybackDispatcher.ts` - Singleton dispatcher for playback actions
   - `AudioCore.ts` - Core audio functionality using expo-av
   - `PlaybackQueue.ts` - Queue management for podcast episodes
   - `PodcastContext.tsx` - Context provider for podcast feed and episodes

Key limitations of the current implementation:

1. **Limited Now Playing widget support** - The current implementation uses expo-av which has limited support for the iOS Now Playing widget
2. **Manual metadata handling** - Metadata is fetched and updated manually
3. **Complex state management** - Custom dispatcher pattern with multiple layers
4. **Error handling challenges** - Multiple try/catch blocks and error states
5. **No background audio controls** - Limited support for background playback controls

## Migration Strategy

The migration will be implemented in phases to minimize disruption:

### Naming Strategy

To balance backward compatibility with clear separation of implementations, this migration will use a hybrid naming approach:

1. **New namespace with similar function names:**
   - New implementation will live in `TrackPlayerContext` and `trackPlayerUtils`
   - Function names will be similar where behavior is equivalent (e.g., `playLiveStream` → `playStream`)

2. **Compatibility layer:**
   - The existing `PlaybackContext` will be maintained as a thin wrapper
   - It will delegate to the new implementation while preserving the old API

3. **Deprecation markers:**
   - Old functions will be marked as deprecated with JSDoc comments
   - Comments will direct developers to new equivalents

This approach allows for incremental migration while maintaining a clear separation between implementations.

### File Organization Strategy

To ensure better maintainability and code organization, the implementation will use a more modular file structure than presented in the code examples. Here's the recommended file organization:

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

This structure provides several benefits:
1. **Single Responsibility**: Each file has a focused purpose
2. **Better Maintainability**: Smaller files are easier to understand and modify
3. **Improved Testability**: Isolated components are easier to test
4. **Future-Proofing**: Easier to extend or modify specific parts without affecting others

The code examples in this migration plan are presented as larger files for clarity, but should be implemented using this modular structure.

### Phase 1: Add TrackPlayer Dependencies

1. **Add dependencies**:
   ```bash
   npm install react-native-track-player
   ```

2. **Update iOS configuration**:
   - Add background modes to Info.plist
   - Configure audio session category
   - Update entitlements if needed

3. **Create new TrackPlayer files**:
   - `context/TrackPlayerContext.tsx` - New context provider
   - `utils/trackPlayerService.ts` - Playback service
   - `utils/trackPlayerUtils.ts` - Utility functions

### Phase 2: Implement Core TrackPlayer Functionality

1. **Create TrackPlayerContext**:
   ```typescript
   // context/TrackPlayerContext.tsx
   import React, { createContext, useContext, useEffect, useState } from 'react';
   import TrackPlayer, { State, Event } from 'react-native-track-player';
   import { setupTrackPlayer, playStream, stopPlayback, togglePlayback, getPlaybackState } from '../utils/trackPlayerUtils';

   // Track if the service has been registered
   let isServiceRegistered = false;

   // Queue state type for UI feedback
   interface QueueState {
     items: any[];
     processingId: string | null;
   }

   // Register the playback service
   const registerPlaybackService = async () => {
     if (isServiceRegistered) {
       console.log('PlaybackService already registered');
       return;
     }
     
     try {
       console.log('Registering PlaybackService...');
       await TrackPlayer.registerPlaybackService(() => require('../utils/trackPlayerService').PlaybackService);
       isServiceRegistered = true;
       console.log('PlaybackService registered successfully');
     } catch (error) {
       console.error('Failed to register PlaybackService:', error);
     }
   };

   // Context type
   type TrackPlayerContextType = {
     isPlaying: boolean;
     isLoading: boolean;
     currentTrack: any | null;
     queueState: QueueState;
     playLiveStream: () => Promise<void>;
     playPodcast: (track: any) => Promise<void>;
     enqueueTrack: (track: any) => Promise<boolean>;
     togglePlayback: () => Promise<void>;
     stopPlayback: () => Promise<void>;
     clearQueue: () => Promise<void>;
     updateQueueState: (state: QueueState) => void;
   };

   // Create context
   const TrackPlayerContext = createContext<TrackPlayerContextType | undefined>(undefined);

   // Provider component
   export const TrackPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const [isPlaying, setIsPlaying] = useState(false);
     const [isLoading, setIsLoading] = useState(false);
     const [currentTrack, setCurrentTrack] = useState<any | null>(null);
     const [queueState, setQueueState] = useState<QueueState>({
       items: [],
       processingId: null
     });

     // Update queue state
     const updateQueueState = (state: QueueState) => {
       setQueueState(state);
     };

     // Initialize TrackPlayer
     useEffect(() => {
       const setupPlayer = async () => {
         try {
           await registerPlaybackService();
           await setupTrackPlayer();
         } catch (error) {
           console.error('Error setting up TrackPlayer:', error);
         }
       };
       
       setupPlayer();
       
       // Update state periodically
       const intervalId = setInterval(async () => {
         try {
           const state = await getPlaybackState();
           setIsPlaying(state.isPlaying);
           setIsLoading(state.isLoading);
           setCurrentTrack(state.currentTrack);
         } catch (error) {
           console.error('Error updating playback state:', error);
         }
       }, 1000);
       
       return () => {
         clearInterval(intervalId);
       };
     }, []);

     // Listen for track changes to update UI queue
     useEffect(() => {
       const trackChangeListener = TrackPlayer.addEventListener(
         Event.PlaybackTrackChanged,
         async (event) => {
           if (event.nextTrack !== null) {
             // Update processing ID
             const track = await TrackPlayer.getTrack(event.nextTrack);
             if (track) {
               setQueueState(prev => ({
                 ...prev,
                 processingId: track.id
               }));
             }
             
             // Remove previous track from UI queue
             if (event.track !== null) {
               setQueueState(prev => ({
                 ...prev,
                 items: prev.items.filter(item => item.id !== event.track)
               }));
             }
           }
         }
       );
       
       return () => {
         trackChangeListener.remove();
       };
     }, []);

     // Play live stream
     const playLiveStream = async () => {
       try {
         setIsLoading(true);
         // Clear queue when switching to live stream
         setQueueState({
           items: [],
           processingId: null
         });
         await playStream();
       } catch (error) {
         console.error('Error playing live stream:', error);
       } finally {
         setIsLoading(false);
       }
     };

     // Play podcast
     const playPodcast = async (track: any) => {
       try {
         setIsLoading(true);
         await playPodcastTrack(track);
         
         // Update queue state
         setQueueState({
           items: [],
           processingId: track.id || `podcast-${Date.now()}`
         });
       } catch (error) {
         console.error('Error playing podcast:', error);
       } finally {
         setIsLoading(false);
       }
     };

     // Add track to queue
     const enqueueTrack = async (track: any): Promise<boolean> => {
       // Don't queue duplicates
       if (queueState.items.some(item => item.url === track.url)) {
         console.warn('Track already queued, ignoring');
         return false;
       }
       
       // Don't queue currently processing track
       if (track.url === queueState.processingId) {
         console.warn('Track currently processing, ignoring');
         return false;
       }
       
       // Update UI state
       setQueueState(prev => ({
         ...prev,
         items: [...prev.items, track]
       }));
       
       // If nothing is playing, play this track immediately
       const currentTrack = await TrackPlayer.getCurrentTrack();
       if (currentTrack === null) {
         await playPodcast(track);
         return true;
       }
       
       // Otherwise add to TrackPlayer's queue
       await TrackPlayer.add({
         id: track.id || `podcast-${Date.now()}`,
         url: track.enclosure?.['@_url'] || track.url,
         title: track.title || 'Unknown Episode',
         artist: track['itunes:author'] || track.artist || 'Balearic FM',
         artwork: track['itunes:image']?.['@_href'] || track.artwork || DEFAULT_ARTWORK_URL,
         duration: track.duration || 0,
         description: track.description || '',
       });
       
       return true;
     };

     // Clear queue
     const clearQueue = async (): Promise<void> => {
       // Clear UI queue
       setQueueState({
         items: [],
         processingId: null
       });
       
       // Clear TrackPlayer queue
       await TrackPlayer.reset();
     };

     return (
       <TrackPlayerContext.Provider
         value={{
           isPlaying,
           isLoading,
           currentTrack,
           queueState,
           playLiveStream,
           playPodcast,
           enqueueTrack,
           togglePlayback,
           stopPlayback,
           clearQueue,
           updateQueueState
         }}
       >
         {children}
       </TrackPlayerContext.Provider>
     );
   };

   // Hook for using the context
   export const useTrackPlayer = () => {
     const context = useContext(TrackPlayerContext);
     if (!context) {
       throw new Error('useTrackPlayer must be used within a TrackPlayerProvider');
     }
     return context;
   };
   ```

2. **Implement TrackPlayer Service**:
   ```typescript
   // utils/trackPlayerService.ts
   import TrackPlayer, { Event } from 'react-native-track-player';
   import { STREAM_URL, METADATA_URL, DEFAULT_ARTWORK_URL } from './audio/types';
   import { fetchCurrentTrackMetadata } from './trackPlayerUtils';

   // This service needs to be registered for the module to work
   export async function PlaybackService(): Promise<void> {
     try {
       // Remote control events
       TrackPlayer.addEventListener(Event.RemotePlay, async () => {
         try {
           await TrackPlayer.play();
         } catch (error) {
           console.error('Error in RemotePlay handler:', error);
         }
       });

       TrackPlayer.addEventListener(Event.RemotePause, async () => {
         try {
           await TrackPlayer.pause();
         } catch (error) {
           console.error('Error in RemotePause handler:', error);
         }
       });

       TrackPlayer.addEventListener(Event.RemoteStop, async () => {
         try {
           await TrackPlayer.stop();
         } catch (error) {
           console.error('Error in RemoteStop handler:', error);
         }
       });

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
             description: metadata.description,
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
         try {
           // The stream metadata event only includes title and artist
           // We need to fetch the artwork separately
           const title = metadata.title || 'Balearic FM';
           const artist = metadata.artist || 'Live Stream';
           
           // Update with the basic metadata first
           await TrackPlayer.updateNowPlayingMetadata({
             title,
             artist,
             description: title, // Use title as description initially (since title contains artist name)
             artwork: DEFAULT_ARTWORK_URL, // Use default artwork initially
           });
           
           // Then fetch complete metadata including artwork
           updateNowPlayingMetadata();
         } catch (error) {
           console.error('Error updating metadata:', error);
         }
       });
     } catch (error) {
       console.error('Error setting up PlaybackService:', error);
     }
   }
   ```

3. **Implement TrackPlayer Utilities**:
   ```typescript
   // utils/trackPlayerUtils.ts
   import TrackPlayer, { Capability, State } from 'react-native-track-player';
   import { STREAM_URL, METADATA_URL, DEFAULT_ARTWORK_URL } from './audio/types';

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
           Capability.SeekTo,
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

   // Fetch current track metadata from API
   export const fetchCurrentTrackMetadata = async (): Promise<{
     title: string;
     artist: string;
     description: string;
     artwork: string;
   } | null> => {
     try {
       console.log('Fetching current track metadata from API...');
       const response = await fetch(METADATA_URL, {
         headers: {
           'User-Agent': 'BalearicFM-ReactNative/1.0.0',
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
           title: 'Balearic FM',
           artist: 'Balearic FM',
           description: 'Live radio stream',
           artwork: DEFAULT_ARTWORK_URL
         };
       }
       
       // Extract the song data from the correct location
       const songData = responseData.now_playing.song;
       
       // Extract metadata following the existing BalearicFmRadio pattern:
       // - Artist goes in title field
       // - Song title goes in description field
       // - Artist is repeated in artist field
       const title = songData.artist || 'Balearic FM';
       const artist = songData.artist || 'Balearic FM';
       const description = songData.title || 'Live radio stream';
       const artworkUrl = songData.art || DEFAULT_ARTWORK_URL;
       
       return { title, artist, description, artwork: artworkUrl };
     } catch (error) {
       console.error('Error fetching track metadata:', error);
       return null;
     }
   };

   // Play the stream
   export const playStream = async (): Promise<boolean> => {
     try {
       // Reset the player to make sure there are no conflicts
       await TrackPlayer.reset();

       // Try to fetch current track metadata
       let metadata = null;
       try {
         metadata = await fetchCurrentTrackMetadata();
       } catch (error) {
         console.error('Error fetching initial metadata:', error);
       }

       // Add the stream to the queue with metadata if available
       await TrackPlayer.add({
         id: 'balearic-fm-stream',
         url: STREAM_URL,
         title: metadata?.title || 'Balearic FM',
         artist: metadata?.artist || 'Balearic FM',
         description: metadata?.description || 'Live radio stream',
         artwork: metadata?.artwork || DEFAULT_ARTWORK_URL,
         duration: 0, // Live stream has no duration
         isLiveStream: true,
       });

       // Start playing
       await TrackPlayer.play();
       console.log('Stream playback started');
       return true;
     } catch (error) {
       console.error('Error playing stream:', error);
       return false;
     }
   };

   // Stop playback
   export const stopPlayback = async (): Promise<boolean> => {
     try {
       await TrackPlayer.stop();
       await TrackPlayer.reset();
       console.log('Stream playback stopped');
       return true;
     } catch (error) {
       console.error('Error stopping playback:', error);
       return false;
     }
   };

   // Toggle playback
   export const togglePlayback = async (): Promise<boolean> => {
     try {
       const state = await TrackPlayer.getState();
       const isPlaying = state === State.Playing;
       
       if (isPlaying) {
         await TrackPlayer.pause();
       } else {
         // If there's no track in the queue, add the stream
         const queue = await TrackPlayer.getQueue();
         if (queue.length === 0) {
           await playStream();
         } else {
           await TrackPlayer.play();
         }
       }
       return true;
     } catch (error) {
       console.error('Error toggling playback:', error);
       return false;
     }
   };

   // Get the current playback state
   export const getPlaybackState = async (): Promise<{
     isPlaying: boolean;
     isLoading: boolean;
     currentTrack: any | null;
   }> => {
     try {
       const state = await TrackPlayer.getState();
       const isPlaying = state === State.Playing;
       const isBuffering = state === State.Buffering;
       const currentTrack = await TrackPlayer.getCurrentTrack();
       
       return {
         isPlaying,
         isLoading: isBuffering,
         currentTrack: currentTrack ? await TrackPlayer.getTrack(currentTrack) : null,
       };
     } catch (error) {
       console.error('Error getting playback state:', error);
       return {
         isPlaying: false,
         isLoading: false,
         currentTrack: null,
       };
     }
   };
   ```

### Phase 3: Integrate Podcast Playback

1. **Add podcast playback to TrackPlayerUtils**:
   ```typescript
   // Add to utils/trackPlayerUtils.ts
   
   // Play a podcast episode
   export const playPodcast = async (track: any): Promise<boolean> => {
     try {
       // Reset the player to make sure there are no conflicts
       await TrackPlayer.reset();

       // Add the podcast to the queue
       await TrackPlayer.add({
         id: track.id || `podcast-${Date.now()}`,
         url: track.enclosure?.['@_url'] || track.url,
         title: track.title || 'Unknown Episode',
         artist: track['itunes:author'] || track.artist || 'Balearic FM',
         artwork: track['itunes:image']?.['@_href'] || track.artwork || DEFAULT_ARTWORK_URL,
         duration: track.duration || 0,
         description: track.description || '',
       });

       // Start playing
       await TrackPlayer.play();
       console.log('Podcast playback started');
       return true;
     } catch (error) {
       console.error('Error playing podcast:', error);
       return false;
     }
   };
   
   // Seek to position
   export const seekTo = async (position: number): Promise<boolean> => {
     try {
       await TrackPlayer.seekTo(position);
       return true;
     } catch (error) {
       console.error('Error seeking:', error);
       return false;
     }
   };
   ```

### Phase 4: Implement Compatibility Layer

To maintain backward compatibility while encouraging migration to the new API, we'll implement a compatibility layer:

```typescript
// context/PlaybackContext.js (updated)
import React, { createContext, useContext } from 'react';
import { useTrackPlayer } from './TrackPlayerContext';

const PlaybackContext = createContext();

export const PlaybackProvider = ({ children }) => {
  const {
    isPlaying,
    isLoading,
    currentTrack,
    queueState,
    playLiveStream,
    playPodcast,
    enqueueTrack,
    togglePlayback,
    stopPlayback,
    clearQueue,
    updateQueueState,
  } = useTrackPlayer();
  
  // Compatibility methods with old names
  /** @deprecated Use useTrackPlayer().playLiveStream instead */
  const playLiveStream = async () => {
    return playLiveStream();
  };
  
  /** @deprecated Use useTrackPlayer().playPodcast instead */
  const playTrack = async (track) => {
    return playPodcast(track);
  };
  
  /** @deprecated Use useTrackPlayer() methods instead */
  const dispatchPlayback = async (action) => {
    switch (action.type) {
      case 'PLAY_LIVE':
        return playLiveStream();
      case 'PLAY_PODCAST':
        return enqueueTrack(action.payload);
      case 'TOGGLE_PLAYBACK':
        return togglePlayback();
      case 'STOP':
        return stopPlayback();
      case 'CLEAR_QUEUE':
        return clearQueue();
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  };
  
  // Map new state to old state structure
  const playbackState = {
    isPlaying,
    isLoading,
    currentSource: currentTrack?.isLiveStream ? 'live' : 'podcast',
    currentTrack,
    metadataPoller: null, // No longer needed
    queueState: {
      items: queueState.items,
      currentPosition: 0,
      processingUrl: queueState.processingId
    }
  };
  
  return (
    <PlaybackContext.Provider
      value={{
        playbackState,
        playLiveStream,
        playTrack,
        dispatchPlayback,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

/** @deprecated Use useTrackPlayer instead */
export const usePlayback = () => {
  console.warn('usePlayback is deprecated. Please migrate to useTrackPlayer.');
  return useContext(PlaybackContext);
};
```

### Phase 5: Testing and Refinement

1. **Test live stream playback**:
   - Verify metadata updates
   - Check Now Playing widget
   - Test background playback
   - Verify remote controls

2. **Test podcast playback**:
   - Verify episode playback
   - Check seeking functionality
   - Test background playback
   - Verify remote controls

3. **Test edge cases**:
   - App startup
   - App backgrounding
   - Network interruptions
   - Audio interruptions (calls, etc.)

## Implementation Timeline

1. **Phase 1**: 1 day
2. **Phase 2**: 2 days
3. **Phase 3**: 1 day
4. **Phase 4**: 2 days
5. **Phase 5**: 2 days

Total estimated time: 8 days

## Risks and Mitigations

1. **Risk**: Incompatibility with existing code
   - **Mitigation**: Implement in phases with thorough testing at each step

2. **Risk**: Performance issues with TrackPlayer
   - **Mitigation**: Monitor performance metrics and optimize as needed

3. **Risk**: User experience disruption
   - **Mitigation**: Maintain feature parity and ensure smooth transitions

4. **Risk**: iOS App Store rejection
   - **Mitigation**: Ensure proper background modes and permissions

## Conclusion

This migration plan provides a structured approach to replacing the current expo-av implementation with react-native-track-player. The phased approach allows for incremental testing and validation, minimizing the risk of disruption to the user experience.

The end result will be a more robust audio playback system with better support for the Now Playing widget, background playback, and remote controls.
