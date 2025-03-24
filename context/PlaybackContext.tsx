import React, { createContext, useContext, useEffect, useState } from 'react';
import { AudioPlayer } from '../utils/audio/player';
import { PlaybackState, PlaybackContextType } from '../utils/audio/types';

// Create the context with a default value
const PlaybackContext = createContext<PlaybackContextType>({
  playbackState: {
    isPlaying: false,
    isLoading: false,
    currentTrack: null
  },
  playStream: async () => {},
  stopPlayback: async () => {},
  togglePlayback: async () => {}
});

// Custom hook to use the playback context
export const usePlayback = () => useContext(PlaybackContext);

// Provider component
export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isLoading: false,
    currentTrack: null
  });

  // Get the audio player instance
  const audioPlayer = AudioPlayer.getInstance();

  // Set up state change listener
  useEffect(() => {
    const unsubscribe = audioPlayer.addStateChangeListener((isPlaying, isLoading, currentTrack) => {
      setPlaybackState({
        isPlaying,
        isLoading,
        currentTrack
      });
    });

    // Clean up on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Play the stream
  const playStream = async () => {
    try {
      await audioPlayer.playStream();
    } catch (error) {
      console.error('Error playing stream:', error);
    }
  };

  // Stop playback
  const stopPlayback = async () => {
    try {
      await audioPlayer.stopPlayback();
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  // Toggle playback
  const togglePlayback = async () => {
    try {
      await audioPlayer.togglePlayback();
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  // Provide the context value
  const contextValue: PlaybackContextType = {
    playbackState,
    playStream,
    stopPlayback,
    togglePlayback
  };

  return (
    <PlaybackContext.Provider value={contextValue}>
      {children}
    </PlaybackContext.Provider>
  );
};

export default PlaybackContext;
