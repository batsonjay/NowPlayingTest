import { Image, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useTrackPlayer } from '@/context/TrackPlayerContext';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const { isPlaying, isLoading, currentTrack, playStream, stopPlayback, togglePlayback } = useTrackPlayer();

  // Handle play/stop button press
  const handlePlayPress = () => {
    togglePlayback();
  };

  // Get button text based on playback state
  const getButtonText = () => {
    if (isLoading) return 'Loading...';
    return isPlaying ? 'Stop Stream' : 'Play Stream';
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#3A6794', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Balearic FM Now Playing Test</ThemedText>
        
        <ThemedView style={styles.playerContainer}>
          <TouchableOpacity
            style={[
              styles.playButton,
              isPlaying && styles.stopButton,
              isLoading && styles.loadingButton
            ]}
            onPress={handlePlayPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" />
                <ThemedText style={styles.buttonText}>{getButtonText()}</ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.buttonText}>{getButtonText()}</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.infoContainer}>
          <ThemedText type="subtitle">Now Playing</ThemedText>
          
          {currentTrack ? (
            <>
              <ThemedText type="defaultSemiBold" style={styles.trackTitle}>
                {currentTrack.title || 'Unknown Track'}
              </ThemedText>
              <ThemedText style={styles.artistName}>
                {currentTrack.artist || 'Balearic FM'}
              </ThemedText>
            </>
          ) : (
            <ThemedText>Not playing</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.infoBox}>
          <ThemedText type="subtitle">About This Test</ThemedText>
          <ThemedText>
            This app is designed to test iOS Now Playing widget integration with a streaming audio source.
            The stream URL is: <ThemedText type="defaultSemiBold">https://radio.balearic-fm.com:8000/radio.mp3</ThemedText>
          </ThemedText>
          <ThemedText style={styles.note}>
            Note: For best results, test on a physical iOS device. The Now Playing widget may not appear in simulators.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingBottom: 40,
  },
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
    opacity: 0.7,
  },
  playerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  playButton: {
    backgroundColor: '#3A6794',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#943A3A',
  },
  loadingButton: {
    backgroundColor: '#94783A',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
  },
  trackTitle: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  artistName: {
    marginTop: 5,
    opacity: 0.8,
    textAlign: 'center',
  },
  infoBox: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    marginTop: 10,
  },
  note: {
    fontStyle: 'italic',
    marginTop: 10,
    opacity: 0.7,
  },
});
