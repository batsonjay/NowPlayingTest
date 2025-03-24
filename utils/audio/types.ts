// Constants for audio playback
export const STREAM_URL = "https://radio.balearic-fm.com:8000/radio.mp3";
export const METADATA_URL = "https://radio.balearic-fm.com/api/nowplaying";
export const METADATA_FETCH_INTERVAL = 20000; // 20 seconds
export const APP_USER_AGENT = "NowPlayingTest/1.0.0";
export const DEFAULT_ARTWORK_URL = "https://radio.balearic-fm.com/static/img/generic_song.jpg";

// Types for audio playback
export interface TrackMetadata {
  title: string;
  artist: string;
  description?: string;
  artwork?: string | null;
  url?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTrack: TrackMetadata | null;
}

export type PlaybackContextType = {
  playbackState: PlaybackState;
  playStream: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  togglePlayback: () => Promise<void>;
};
