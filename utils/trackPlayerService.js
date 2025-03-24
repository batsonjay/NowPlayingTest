import TrackPlayer, { Event, RepeatMode } from 'react-native-track-player';
import { STREAM_URL } from './audio/types';

// This service needs to be registered for the module to work
// but it also prevents the music from being interrupted
export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('Event.RemotePlay');
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('Event.RemotePause');
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    console.log('Event.RemoteStop');
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    console.log('Event.RemoteSeek', event);
    TrackPlayer.seekTo(event.position);
  });

  TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
    console.error('Event.PlaybackError', error);
  });

  TrackPlayer.addEventListener(Event.PlaybackState, (state) => {
    console.log('Event.PlaybackState', state);
  });

  // Handle metadata updates from the stream
  TrackPlayer.addEventListener(Event.PlaybackMetadataReceived, (metadata) => {
    console.log('Event.PlaybackMetadataReceived', metadata);
    
    // Update the current track with the new metadata
    TrackPlayer.updateNowPlayingMetadata({
      title: metadata.title || 'Balearic FM',
      artist: metadata.artist || 'Live Stream',
      artwork: metadata.artwork || require('../assets/images/react-logo.png'),
    });
  });
}
