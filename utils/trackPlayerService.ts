import TrackPlayer, { Event } from 'react-native-track-player';
import { STREAM_URL, METADATA_URL, DEFAULT_ARTWORK_URL } from './audio/types';
import { fetchCurrentTrackMetadata } from './trackPlayerUtils';

// This service needs to be registered for the module to work
// but it also prevents the music from being interrupted
export async function PlaybackService(): Promise<void> {
  try {
    // Remote control events
    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
      console.log('Event.RemotePlay');
      try {
        await TrackPlayer.play();
      } catch (error) {
        console.error('Error in RemotePlay handler:', error);
      }
    });

    TrackPlayer.addEventListener(Event.RemotePause, async () => {
      console.log('Event.RemotePause');
      try {
        await TrackPlayer.pause();
      } catch (error) {
        console.error('Error in RemotePause handler:', error);
      }
    });

    TrackPlayer.addEventListener(Event.RemoteStop, async () => {
      console.log('Event.RemoteStop');
      try {
        await TrackPlayer.stop();
      } catch (error) {
        console.error('Error in RemoteStop handler:', error);
      }
    });

    TrackPlayer.addEventListener(Event.RemoteSeek, async (event) => {
      console.log('Event.RemoteSeek', event);
      try {
        await TrackPlayer.seekTo(event.position);
      } catch (error) {
        console.error('Error in RemoteSeek handler:', error);
      }
    });

    // Error and state events
    TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
      console.error('Event.PlaybackError', error);
      // You could add recovery logic here
    });

    TrackPlayer.addEventListener(Event.PlaybackState, (state) => {
      console.log('Event.PlaybackState', state);
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
        const title = metadata.title || 'Balearic FM';
        const artist = metadata.artist || 'Live Stream';
        
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
    
    console.log('PlaybackService registered successfully');
  } catch (error) {
    console.error('Error setting up PlaybackService:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}
