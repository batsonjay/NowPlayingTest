# Migration Notes: NowPlayingTest to BalearicFmRadio

> **Note:** This document is part of a series of migration guides. For an overview and reading order, see [READ_ME_FIRST.md](./READ_ME_FIRST.md).

This document captures important context, typos, and considerations for migrating the BalearicFmRadio app from expo-av to react-native-track-player based on the NowPlayingTest project.

## Typos and Issues in Migration Plan

1. **Variable Name Conflicts in Compatibility Layer**:
   ```typescript
   // In the compatibility layer, there's a naming conflict:
   const {
     playLiveStream,  // From useTrackPlayer
     // ...
   } = useTrackPlayer();
   
   // Then defined again as a local function:
   const playLiveStream = async () => {  // This creates a conflict
     return playLiveStream();  // This would cause infinite recursion
   };
   ```
   
   **Fix**: Rename the imported functions:
   ```typescript
   const {
     playLiveStream: playerPlayLiveStream,
     // ...
   } = useTrackPlayer();
   
   const playLiveStream = async () => {
     return playerPlayLiveStream();
   };
   ```

2. **Missing Function Reference**:
   ```typescript
   // In TrackPlayerContext.tsx:
   const playPodcast = async (track: any) => {
     // ...
     await playPodcastTrack(track);  // This function isn't defined or imported
   };
   ```
   
   **Fix**: Change to:
   ```typescript
   const playPodcast = async (track: any) => {
     // ...
     await playPodcast(track);  // Use the imported function
   };
   ```

3. **Missing DEFAULT_ARTWORK_URL Constant**:
   The constant is used but not defined in the examples.
   
   **Fix**: Add to types.ts:
   ```typescript
   export const DEFAULT_ARTWORK_URL = "https://radio.balearic-fm.com/static/img/generic_artwork.jpg";
   ```

## Important Context for Migration

1. **Metadata Handling Differences**:
   - **Live Stream**: In BalearicFmRadio, the artist name goes in the title field, and the song title goes in the description field
   - **Podcasts**: Use standard title/artist/description mapping

2. **Queue Implementation**:
   - The migration uses a hybrid approach that leverages TrackPlayer's native queue for technical aspects
   - A lightweight UI-focused queue is maintained for visual feedback
   - This preserves the user experience while simplifying the implementation

3. **File Organization**:
   - The migration plan recommends a modular file structure (see MIGRATION_PLAN.md)
   - Code should be organized by responsibility rather than in large monolithic files

4. **Compatibility Layer**:
   - A thin wrapper maintains backward compatibility with existing code
   - This allows for incremental migration without breaking existing functionality

## Key Files to Reference

1. **MIGRATION_PLAN.md**: Complete migration strategy with code examples
2. **MEDIA_PLAYER_LEARNINGS.md**: Technical implementation details and best practices
3. **README_TRACK_PLAYER.md**: Overview of the NowPlayingTest project

## Implementation Priorities

1. **Maintain Metadata Structure**: Ensure the existing metadata structure is preserved
2. **Preserve UI Feedback**: Keep the visual queue indicators and loading states
3. **Use Modular File Structure**: Implement the recommended file organization from the start
4. **Implement Compatibility Layer**: Allow for incremental migration of consumer code

## Testing Considerations

1. **Live Stream Playback**: Verify metadata updates and Now Playing widget
2. **Podcast Playback**: Test episode playback, seeking, and queue management
3. **Background Playback**: Ensure playback continues when app is backgrounded
4. **Remote Controls**: Verify lock screen and Control Center controls work
5. **Edge Cases**: Test app startup, backgrounding, network interruptions, and audio interruptions

## Additional Notes

1. The migration preserves the existing behavior where tapping the Live button clears the podcast queue
2. The UI queue implementation maintains the visual feedback for which track is being processed
3. The compatibility layer allows existing components to continue working without modification
4. The modular file structure will make future maintenance and feature additions easier
