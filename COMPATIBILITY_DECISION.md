# Compatibility Layer Decision

This document explains the decision regarding the use of a compatibility layer in the migration from expo-av to react-native-track-player for the BalearicFmRadio app.

## Original Approach

The initial migration plan (see [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)) included a compatibility layer as Phase 4 of the migration:

> **Phase 4: Implement Compatibility Layer**
>
> To maintain backward compatibility while encouraging migration to the new API, we'll implement a compatibility layer...

This approach would have:
- Maintained the existing `PlaybackContext` as a thin wrapper
- Delegated to the new implementation while preserving the old API
- Marked old functions as deprecated with JSDoc comments
- Allowed for incremental migration of consumer code

## Revised Decision: No Compatibility Layer

After careful consideration of the codebase size and complexity, we've decided **against** using a compatibility layer during the migration. 

### Reasoning

1. **Small Codebase**: The BalearicFmRadio app is relatively small with a focused set of playback features. The current implementation consists of just a few key files (PlaybackContext.js, PlaybackDispatcher.ts, AudioCore.ts, PlaybackQueue.ts) that interact with the playback functionality.

2. **Limited Consumer Code**: There are only a few UI components that directly consume the playback API (like the Live screen). This means the surface area of changes needed in consumer code is manageable.

3. **Clean Migration Opportunity**: Since the product hasn't been released yet, this is an ideal time to implement a clean, direct approach without the technical debt of compatibility layers.

4. **Reduced Complexity**: Without a compatibility layer, we avoid potential issues like naming conflicts, infinite recursion (as noted in the migration notes), and the cognitive overhead of maintaining two parallel systems.

5. **Phased Approach Still Works**: We can still use a phased approach without a compatibility layer by:
   - Implementing the new TrackPlayer functionality
   - Updating one UI component at a time to use the new API
   - Testing thoroughly after each component update
   - Removing the old implementation once all components are migrated

### Benefits of Direct Migration

1. **Cleaner Code**: The final codebase will be cleaner without legacy compatibility layers.

2. **Simpler Mental Model**: Developers only need to understand one API, not two APIs with a compatibility layer between them.

3. **Better Performance**: Eliminating the extra layer of indirection may provide minor performance benefits.

4. **Easier Maintenance**: Future maintenance will be simpler without having to maintain compatibility with legacy code.

## Implementation Approach

Instead of using a compatibility layer, we'll follow this approach:

1. **Create New Implementation**: Implement the TrackPlayer functionality in new files.

2. **Update Components Directly**: Update each UI component to use the new API directly.

3. **Remove Old Implementation**: Once all components are updated, remove the old implementation.

4. **Test Thoroughly**: Test each component after updating to ensure functionality is maintained.

This approach will result in cleaner code without the technical debt of maintaining compatibility layers, while still providing the risk management benefits of a phased migration.

## Conclusion

For larger applications with many consumers of the audio API, a compatibility layer would make more sense. But in this case, a direct, clean migration will be more efficient and result in higher quality code.

The phased approach in our migration strategy already provides the risk management benefits we need without introducing the additional complexity of a compatibility layer.
