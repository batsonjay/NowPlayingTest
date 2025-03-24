import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
// Import TrackPlayer with a try/catch at runtime
import TrackPlayer, { Event, State, Capability } from 'react-native-track-player';
import { STREAM_URL, DEFAULT_ARTWORK_URL } from '../utils/audio/types';

// Define the context type
type TrackPlayerContextType = {
  isPlaying: boolean;
  isLoading: boolean;
  currentTrack: any | null;
  playStream: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  togglePlayback: () => Promise<void>;
};

// Create the context with default values
const TrackPlayerContext = createContext<TrackPlayerContextType>({
  isPlaying: false,
  isLoading: false,
  currentTrack: null,
  playStream: async () => {},
  stopPlayback: async () => {},
  togglePlayback: async () => {},
});

// Custom hook to use the track player context
export const useTrackPlayer = () => useContext(TrackPlayerContext);

// Track if the player has been set up
let isPlayerSetup = false;

// Provider component
export const TrackPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Setup the player when the component mounts
  useEffect(() => {
    let isMounted = true;
    let appStateSubscription: any = null;
    let playbackStateListener: any = null;
    let trackChangeListener: any = null;

    const setup = async () => {
      try {
        console.log('Setting up TrackPlayer...');
        
        // If player is already set up, skip initialization
        if (isPlayerSetup) {
          console.log('TrackPlayer already set up, skipping initialization');
          setIsPlayerReady(true);
          
          // Update the state based on the current playback state
          const state = await getPlaybackState();
          if (isMounted) {
            setIsPlaying(state.isPlaying);
            setIsLoading(state.isLoading);
            setCurrentTrack(state.currentTrack);
          }
          return;
        }
        
        // Check if TrackPlayer is already initialized
        try {
          const state = await TrackPlayer.getState();
          console.log('TrackPlayer already initialized, state:', state);
          
          // Reset the player to make sure there are no conflicts
          await TrackPlayer.reset();
          isPlayerSetup = true;
          setIsPlayerReady(true);
          return;
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
          // Media controls capabilities
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SeekTo,
          ],
          // Capabilities that will show up when the notification is in the compact form
          compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
          
          // Icons for the notification
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
          ],
          
          // Notification color (Android only)
          color: 0x3A6794,
        });

        if (!isMounted) return;
        
        console.log('TrackPlayer setup successful');
        isPlayerSetup = true;
        setIsPlayerReady(true);
        
        // Only set up event listeners after the player is ready
        try {
          // Handle app state changes
          const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
              // Update the state when the app comes to the foreground
              getPlaybackState().then((state) => {
                if (isMounted) {
                  setIsPlaying(state.isPlaying);
                  setIsLoading(state.isLoading);
                  setCurrentTrack(state.currentTrack);
                }
              }).catch(err => console.error('Error getting playback state:', err));
            }
          };

          // Subscribe to app state changes
          appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

          // Subscribe to playback state changes
          playbackStateListener = TrackPlayer.addEventListener(
            Event.PlaybackState,
            async (event) => {
              if (!isMounted) return;
              try {
                // Update the state based on the playback state
                const state = await getPlaybackState();
                setIsPlaying(state.isPlaying);
                setIsLoading(state.isLoading);
              } catch (error) {
                console.error('Error in playback state listener:', error);
              }
            }
          );

          // Subscribe to track changes
          trackChangeListener = TrackPlayer.addEventListener(
            Event.PlaybackTrackChanged,
            async (event) => {
              if (!isMounted) return;
              try {
                // Update the current track
                const state = await getPlaybackState();
                setCurrentTrack(state.currentTrack);
              } catch (error) {
                console.error('Error in track change listener:', error);
              }
            }
          );
          
          // Update the state based on the current playback state
          const state = await getPlaybackState();
          if (isMounted) {
            setIsPlaying(state.isPlaying);
            setIsLoading(state.isLoading);
            setCurrentTrack(state.currentTrack);
          }
        } catch (listenerError) {
          console.error('Error setting up event listeners:', listenerError);
        }
      } catch (error) {
        console.error('Error setting up TrackPlayer:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
      }
    };

    // Run setup
    setup();

    // Cleanup
    return () => {
      console.log('Cleaning up TrackPlayer resources');
      isMounted = false;
      
      // Safely remove event listeners
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
      
      if (playbackStateListener) {
        playbackStateListener.remove();
      }
      
      if (trackChangeListener) {
        trackChangeListener.remove();
      }
    };
  }, []);

  // Get the current playback state
  const getPlaybackState = async (): Promise<{
    isPlaying: boolean;
    isLoading: boolean;
    currentTrack: any | null;
  }> => {
    try {
      const state = await TrackPlayer.getState();
      const isPlaying = state === State.Playing;
      const isBuffering = state === State.Buffering;
      const currentTrackIndex = await TrackPlayer.getCurrentTrack();
      
      return {
        isPlaying,
        isLoading: isBuffering,
        currentTrack: currentTrackIndex !== null ? await TrackPlayer.getTrack(currentTrackIndex) : null,
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

  // Play the stream
  const handlePlayStream = async () => {
    if (!isPlayerReady) {
      console.error('TrackPlayer not ready');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Reset the player to make sure there are no conflicts
      await TrackPlayer.reset();

      // Add the stream to the queue
      await TrackPlayer.add({
        id: 'balearic-fm-stream',
        url: STREAM_URL,
        title: 'Balearic FM',
        artist: 'Live Stream',
        artwork: DEFAULT_ARTWORK_URL,
        duration: 0, // Live stream has no duration
        isLiveStream: true,
      });

      // Start playing
      await TrackPlayer.play();
      console.log('Stream playback started');
      
      // Update the state
      const state = await getPlaybackState();
      setIsPlaying(state.isPlaying);
      setIsLoading(state.isLoading);
      setCurrentTrack(state.currentTrack);
    } catch (error) {
      console.error('Error playing stream:', error);
      setIsLoading(false);
    }
  };

  // Stop playback
  const handleStopPlayback = async () => {
    if (!isPlayerReady) {
      console.error('TrackPlayer not ready');
      return;
    }
    
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      console.log('Stream playback stopped');
      
      // Update the state
      setIsPlaying(false);
      setCurrentTrack(null);
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  // Toggle playback
  const handleTogglePlayback = async () => {
    if (!isPlayerReady) {
      console.error('TrackPlayer not ready');
      return;
    }
    
    try {
      if (isLoading) return;
      
      setIsLoading(true);
      
      const state = await TrackPlayer.getState();
      const isPlaying = state === State.Playing;
      
      if (isPlaying) {
        await TrackPlayer.pause();
      } else {
        // If there's no track in the queue, add the stream
        const queue = await TrackPlayer.getQueue();
        if (queue.length === 0) {
          await handlePlayStream();
        } else {
          await TrackPlayer.play();
        }
      }
      
      // Update the state
      const newState = await getPlaybackState();
      setIsPlaying(newState.isPlaying);
      setIsLoading(newState.isLoading);
      setCurrentTrack(newState.currentTrack);
    } catch (error) {
      console.error('Error toggling playback:', error);
      setIsLoading(false);
    }
  };

  // Context value
  const contextValue: TrackPlayerContextType = {
    isPlaying,
    isLoading,
    currentTrack,
    playStream: handlePlayStream,
    stopPlayback: handleStopPlayback,
    togglePlayback: handleTogglePlayback,
  };

  return (
    <TrackPlayerContext.Provider value={contextValue}>
      {children}
    </TrackPlayerContext.Provider>
  );
};

export default TrackPlayerContext;
