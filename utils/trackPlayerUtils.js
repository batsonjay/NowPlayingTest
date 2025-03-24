import TrackPlayer, { Capability, AppKilledPlaybackBehavior, State } from 'react-native-track-player';
import { STREAM_URL, DEFAULT_ARTWORK_URL, TrackMetadata } from './audio/types';

// Configure the track player
export const setupTrackPlayer = async () => {
  try {
    // Reset the player to make sure there are no conflicts
    await TrackPlayer.reset();

    // Setup the player
    await TrackPlayer.setupPlayer({
      // Android specific options
      android: {
        // Continue playback even when the app is killed
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
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
      // These are using the built-in notification icons
      // In a real app, you would want to use your own custom icons
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
      
      // Notification color (Android only)
      color: 0x3A6794,
    });

    console.log('TrackPlayer setup complete');
    return true;
  } catch (error) {
    console.error('Error setting up TrackPlayer:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
};

// Play the stream
export const playStream = async () => {
  try {
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
    return true;
  } catch (error) {
    console.error('Error playing stream:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
};

// Stop playback
export const stopPlayback = async () => {
  try {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
    console.log('Stream playback stopped');
    return true;
  } catch (error) {
    console.error('Error stopping playback:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
};

// Toggle playback
export const togglePlayback = async () => {
  try {
    const state = await TrackPlayer.getState();
    const isPlaying = state === TrackPlayer.State.Playing;
    
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
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
};

// Get the current playback state
export const getPlaybackState = async () => {
  try {
    const state = await TrackPlayer.getState();
    const isPlaying = state === TrackPlayer.State.Playing;
    const isBuffering = state === TrackPlayer.State.Buffering;
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
