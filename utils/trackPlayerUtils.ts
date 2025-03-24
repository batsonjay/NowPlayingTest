import TrackPlayer, { Capability, AppKilledPlaybackBehavior, State } from 'react-native-track-player';
import { STREAM_URL, METADATA_URL, DEFAULT_ARTWORK_URL, TrackMetadata } from './audio/types';

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
      // Add more options here if needed
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
        'User-Agent': 'NowPlayingTest/1.0.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Metadata API response:', data);
    
    // Log the full API response for debugging
    console.log('Full API response:', JSON.stringify(data, null, 2));
    
    // The API returns an array, so we need to get the first item
    const responseData = data[0];
    
    if (!responseData || !responseData.now_playing || !responseData.now_playing.song) {
      console.error('Invalid API response structure:', data);
      return {
        title: 'Balearic FM',
        artist: 'Live Stream',
        artwork: DEFAULT_ARTWORK_URL
      };
    }
    
    // Extract the song data from the correct location
    const songData = responseData.now_playing.song;
    console.log('Found song data:', songData);
    
    // Extract title, artist, and artwork
    const title = songData.title || 'Balearic FM';
    const artist = songData.artist || 'Live Stream';
    const artworkUrl = songData.art || DEFAULT_ARTWORK_URL;
    
    console.log('Extracted metadata:');
    console.log('- Title:', title);
    console.log('- Artist:', artist);
    console.log('- Artwork:', artworkUrl);
    
    console.log(`Metadata - Title: ${title}, Artist: ${artist}, Artwork: ${artworkUrl}`);
    return { title, artist, artwork: artworkUrl };
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
      artist: metadata?.artist || 'Live Stream',
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
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
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
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
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
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
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
