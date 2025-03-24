import { Audio, AVPlaybackStatus, InterruptionModeIOS } from 'expo-av';
import { STREAM_URL, METADATA_URL, METADATA_FETCH_INTERVAL, APP_USER_AGENT, DEFAULT_ARTWORK_URL, TrackMetadata } from './types';

/**
 * AudioPlayer class for handling audio playback
 * Implements a singleton pattern for global access
 */
export class AudioPlayer {
  private static instance: AudioPlayer;
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private isLoading: boolean = false;
  private currentTrack: TrackMetadata | null = null;
  private metadataPoller: NodeJS.Timeout | null = null;
  private stateChangeListeners: ((isPlaying: boolean, isLoading: boolean, currentTrack: TrackMetadata | null) => void)[] = [];

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.configureAudioSession();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  /**
   * Configure the audio session for background playback
   */
  private async configureAudioSession(): Promise<void> {
    try {
      // Try to enable remote control events first
      try {
        // @ts-ignore - TypeScript might not recognize this method
        if (Audio.setIsEnabledAsync && typeof Audio.setIsEnabledAsync === 'function') {
          // @ts-ignore
          await Audio.setIsEnabledAsync(true);
          console.log('Remote control events enabled during session configuration');
        }
      } catch (remoteControlError) {
        console.warn('Error enabling remote control events during configuration:', remoteControlError);
      }
      
      // Configure the audio session
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix
      });
      
      console.log('Audio session configured for background playback');
    } catch (error) {
      console.error('Error configuring audio session:', error);
      if (error instanceof Error) {
        console.error('Audio session error message:', error.message);
        console.error('Audio session error stack:', error.stack);
      }
    }
  }

  /**
   * Add a listener for state changes
   */
  public addStateChangeListener(
    listener: (isPlaying: boolean, isLoading: boolean, currentTrack: TrackMetadata | null) => void
  ): () => void {
    this.stateChangeListeners.push(listener);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.stateChangeListeners.forEach(listener => {
      listener(this.isPlaying, this.isLoading, this.currentTrack);
    });
  }

  /**
   * Fetch metadata from the server
   */
  private async fetchMetadata(): Promise<void> {
    try {
      const response = await fetch(METADATA_URL);
      const [data] = await response.json();
      
      if (data?.now_playing?.song) {
        const song = data.now_playing.song;
        
        this.currentTrack = {
          title: song.title || 'Unknown Track',
          artist: song.artist || 'Balearic FM',
          description: `${song.artist} - ${song.title}`,
          artwork: song.art || DEFAULT_ARTWORK_URL,
          url: STREAM_URL
        };
        
        // Update Now Playing info
        if (this.sound) {
          this.updateNowPlaying();
        }
        
        this.notifyListeners();
      }
    } catch (error) {
      console.warn('Failed to fetch metadata:', error);
      if (error instanceof Error) {
        console.warn('Metadata error message:', error.message);
      }
      console.warn('Metadata URL:', METADATA_URL);
    }
  }

  /**
   * Update the Now Playing info
   */
  private async updateNowPlaying(): Promise<void> {
    if (this.sound && this.currentTrack) {
      try {
        // Update the basic playback status
        await this.sound.setStatusAsync({
          progressUpdateIntervalMillis: 1000,
          shouldPlay: this.isPlaying,
          isLooping: false,
          rate: 1.0,
          shouldCorrectPitch: true,
          volume: 1.0,
          isMuted: false
        });
        
        // Try multiple approaches to set Now Playing metadata
        
        // Approach 1: Use the presentAudioPlayerAsync method
        try {
          // @ts-ignore - TypeScript might not recognize this method
          if (this.sound._nativeModule && typeof this.sound._nativeModule.presentAudioPlayerAsync === 'function') {
            // @ts-ignore
            await this.sound._nativeModule.presentAudioPlayerAsync({
              title: this.currentTrack.title,
              artist: this.currentTrack.artist,
              albumTitle: 'Balearic FM',
              duration: 3600, // Set a long duration for streaming
              artwork: this.currentTrack.artwork || undefined
            });
            console.log('Now Playing metadata set via presentAudioPlayerAsync');
          } else {
            console.log('presentAudioPlayerAsync method not available');
          }
        } catch (metadataError1) {
          console.warn('Error with presentAudioPlayerAsync:', metadataError1);
        }
        
        // Approach 2: Use setMetadataAsync
        try {
          // @ts-ignore
          if (this.sound._nativeModule && typeof this.sound._nativeModule.setMetadataAsync === 'function') {
            // @ts-ignore
            await this.sound._nativeModule.setMetadataAsync({
              title: this.currentTrack.title,
              artist: this.currentTrack.artist,
              album: 'Balearic FM',
              duration: 3600 // Set a long duration for streaming
            });
            console.log('Now Playing metadata set via setMetadataAsync');
          } else {
            console.log('setMetadataAsync method not available');
          }
        } catch (metadataError2) {
          console.warn('Error with setMetadataAsync:', metadataError2);
        }
        
        // Approach 3: Try to access MPNowPlayingInfoCenter directly
        try {
          // @ts-ignore
          if (global.nativeModuleProxy && global.nativeModuleProxy.ExponentAV) {
            // @ts-ignore
            const ExponentAV = global.nativeModuleProxy.ExponentAV;
            
            if (typeof ExponentAV.setNowPlayingAsync === 'function') {
              await ExponentAV.setNowPlayingAsync({
                title: this.currentTrack.title,
                artist: this.currentTrack.artist,
                album: 'Balearic FM',
                duration: 3600,
                elapsedPlaybackTime: 0,
                playbackRate: 1.0
              });
              console.log('Now Playing metadata set via ExponentAV.setNowPlayingAsync');
            }
          }
        } catch (metadataError3) {
          console.warn('Error with ExponentAV.setNowPlayingAsync:', metadataError3);
        }
        
        // Approach 4: Try to use the Audio module directly
        try {
          // @ts-ignore
          if (Audio.setNowPlayingAsync && typeof Audio.setNowPlayingAsync === 'function') {
            // @ts-ignore
            await Audio.setNowPlayingAsync({
              title: this.currentTrack.title,
              artist: this.currentTrack.artist,
              album: 'Balearic FM',
              duration: 3600
            });
            console.log('Now Playing metadata set via Audio.setNowPlayingAsync');
          }
        } catch (metadataError4) {
          console.warn('Error with Audio.setNowPlayingAsync:', metadataError4);
        }
        
        // Enable remote control events
        try {
          // @ts-ignore
          if (Audio.setIsEnabledAsync && typeof Audio.setIsEnabledAsync === 'function') {
            // @ts-ignore
            await Audio.setIsEnabledAsync(true);
            console.log('Remote control events enabled');
          }
        } catch (remoteControlError) {
          console.warn('Error enabling remote control events:', remoteControlError);
        }
        
        console.log('Now Playing updated:', this.currentTrack.artist, '-', this.currentTrack.title);
      } catch (error) {
        console.warn('Error updating Now Playing:', error);
        if (error instanceof Error) {
          console.warn('Now Playing error message:', error.message);
          console.warn('Now Playing error stack:', error.stack);
        }
      }
    }
  }

  /**
   * Start playing the stream
   */
  public async playStream(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.notifyListeners();
    
    try {
      // If we already have a sound object, unload it first
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      // Set initial track info
      this.currentTrack = {
        title: 'Balearic FM',
        artist: 'Live Stream',
        description: 'Live radio stream',
        artwork: DEFAULT_ARTWORK_URL,
        url: STREAM_URL
      };
      
      // Create a new sound object
      this.sound = new Audio.Sound();
      
      // Load and play the stream
      await this.sound.loadAsync(
        {
          uri: STREAM_URL,
          headers: {
            'User-Agent': APP_USER_AGENT
          }
        },
        { shouldPlay: true }
      );
      
      // Set up status updates
      this.sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        
        // Update state based on playback status
        if (status.isPlaying !== this.isPlaying) {
          this.isPlaying = status.isPlaying;
          this.notifyListeners();
        }
      });
      
      // Start playing
      await this.sound.playAsync();
      
      // Fetch initial metadata
      await this.fetchMetadata();
      
      // Start metadata polling
      this.metadataPoller = setInterval(() => {
        this.fetchMetadata();
      }, METADATA_FETCH_INTERVAL);
      
      // Update Now Playing info
      this.updateNowPlaying();
      
      this.isPlaying = true;
      this.isLoading = false;
      this.notifyListeners();
      
      console.log('Stream playback started');
    } catch (error) {
      // Provide more detailed error information
      console.error('Error playing stream:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Check if the error is related to the stream URL
      if (error instanceof Error && error.message.includes('network')) {
        console.error('Network error - Check if the stream URL is accessible:', STREAM_URL);
      }
      
      // Reset state
      this.isPlaying = false;
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * Stop playback
   */
  public async stopPlayback(): Promise<void> {
    try {
      // Clear metadata polling
      if (this.metadataPoller) {
        clearInterval(this.metadataPoller);
        this.metadataPoller = null;
      }
      
      // Stop and unload the sound
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      this.isPlaying = false;
      this.currentTrack = null;
      this.notifyListeners();
      
      console.log('Stream playback stopped');
    } catch (error) {
      console.error('Error stopping playback:', error);
      if (error instanceof Error) {
        console.error('Stop playback error message:', error.message);
        console.error('Stop playback error stack:', error.stack);
      }
    }
  }

  /**
   * Toggle playback (play/pause)
   */
  public async togglePlayback(): Promise<void> {
    if (this.isLoading) return;
    
    if (this.isPlaying && this.sound) {
      await this.stopPlayback();
    } else {
      await this.playStream();
    }
  }

  /**
   * Get the current playback state
   */
  public getPlaybackState(): { isPlaying: boolean; isLoading: boolean; currentTrack: TrackMetadata | null } {
    return {
      isPlaying: this.isPlaying,
      isLoading: this.isLoading,
      currentTrack: this.currentTrack
    };
  }
}
