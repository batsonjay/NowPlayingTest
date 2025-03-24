import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { TrackPlayerProvider } from '@/context/TrackPlayerContext';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from '@/utils/trackPlayerService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Track if the service has been registered
let isServiceRegistered = false;

// Register the playback service
const registerPlaybackService = async () => {
  if (isServiceRegistered) {
    console.log('PlaybackService already registered');
    return;
  }
  
  try {
    console.log('Registering PlaybackService...');
    await TrackPlayer.registerPlaybackService(() => PlaybackService);
    isServiceRegistered = true;
    console.log('PlaybackService registered successfully');
  } catch (error) {
    console.error('Failed to register PlaybackService:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
};

// Register the service immediately
registerPlaybackService();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isTrackPlayerReady, setIsTrackPlayerReady] = useState(false);

  // Ensure the playback service is registered
  useEffect(() => {
    const setupTrackPlayer = async () => {
      try {
        await registerPlaybackService();
        setIsTrackPlayerReady(true);
      } catch (error) {
        console.error('Error registering PlaybackService in RootLayout:', error);
      }
    };
    
    setupTrackPlayer();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TrackPlayerProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </TrackPlayerProvider>
  );
}
