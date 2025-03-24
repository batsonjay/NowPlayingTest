# NowPlayingTest Technical Context

## Technologies Used

### Core Technologies

1. **React Native**: Cross-platform mobile application framework
   - Version: Based on Expo SDK
   - Purpose: Provides the foundation for building the mobile app

2. **Expo**: Development platform for React Native
   - Version: Latest compatible with the project
   - Purpose: Simplifies development and provides additional tools and services

3. **TypeScript**: Typed superset of JavaScript
   - Version: Latest compatible with the project
   - Purpose: Provides type safety and improved developer experience

4. **react-native-track-player**: Native module for audio playback
   - Version: Latest stable release
   - Purpose: Provides audio playback capabilities with Now Playing widget support

### Supporting Technologies

1. **iOS Audio Framework**: Native iOS audio system
   - Purpose: Handles audio playback and system integration

2. **GitHub**: Version control and collaboration platform
   - Purpose: Hosts the project repository and facilitates collaboration

3. **VS Code**: Integrated development environment
   - Purpose: Primary development tool for editing code and documentation

4. **Xcode**: Apple's IDE for iOS development
   - Version: Latest compatible with the project
   - Purpose: Required for building and running the iOS app

## Development Setup

### Prerequisites

1. **macOS**: Required for iOS development
2. **Node.js**: JavaScript runtime
3. **Watchman**: File watching service
4. **CocoaPods**: Dependency manager for iOS
5. **Xcode**: Apple's IDE for iOS development
6. **Apple Developer Account**: Required for iOS development and testing

### Environment Setup

Detailed setup instructions are provided in the REQUIRED_DEVELOPER_SETUP.md file, which includes:

1. **Installing Development Tools**:
   ```bash
   # Install Homebrew (package manager for macOS)
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

   # Install Node.js (using nvm for version management)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   nvm install 18  # Or the version specified in .nvmrc if present

   # Install Watchman (used by React Native for file watching)
   brew install watchman

   # Install CocoaPods (dependency manager for iOS)
   sudo gem install cocoapods

   # Install Expo CLI
   npm install -g expo-cli

   # Install EAS CLI (if using EAS Build)
   npm install -g eas-cli
   ```

2. **Repository Setup**:
   ```bash
   # Clone the NowPlayingTest repository
   git clone https://github.com/batsonjay/NowPlayingTest.git
   cd NowPlayingTest

   # Install dependencies
   npm install
   ```

3. **iOS Configuration**:
   - Configure Xcode project settings
   - Set up signing certificates and provisioning profiles
   - Configure background modes for audio playback

### Building and Running

1. **Development Build**:
   ```bash
   # Build the iOS app
   npx expo prebuild -p ios
   cd ios
   pod install
   cd ..
   npx expo run:ios
   ```

2. **Testing on Device**:
   - Connect iOS device
   - Select device in Xcode
   - Build and run on device

## Technical Constraints

### iOS Limitations

1. **Background Execution**: iOS limits background execution time for apps
   - Solution: Use background audio mode to keep the app running

2. **Audio Session Management**: iOS has strict rules for audio session management
   - Solution: Configure audio session correctly for background playback

3. **Now Playing Widget**: iOS has specific requirements for the Now Playing widget
   - Solution: Use react-native-track-player to handle widget integration

### React Native Limitations

1. **Native Module Integration**: React Native has limitations when integrating with native modules
   - Solution: Use react-native-track-player which provides a well-designed bridge

2. **Background Processing**: React Native has limitations for background processing
   - Solution: Use native modules and background modes to handle background playback

### Expo Limitations

1. **Native Module Support**: Expo has limitations for native module support
   - Solution: Use Expo development builds which allow native module integration

2. **Background Playback**: Expo has limitations for background playback
   - Solution: Configure the project correctly for background audio

## Dependencies

### Production Dependencies

1. **react-native**: Core React Native framework
2. **expo**: Expo SDK and tools
3. **react-native-track-player**: Audio playback with Now Playing widget support
4. **react**: React library
5. **react-native-reanimated**: Animation library (if used)
6. **react-native-gesture-handler**: Gesture handling library (if used)
7. **react-native-safe-area-context**: Safe area handling
8. **@react-navigation/native**: Navigation library (if used)
9. **@react-navigation/bottom-tabs**: Tab navigation (if used)

### Development Dependencies

1. **typescript**: TypeScript language
2. **@types/react**: React type definitions
3. **@types/react-native**: React Native type definitions
4. **@babel/core**: Babel compiler core
5. **@babel/preset-env**: Babel preset for environment
6. **@babel/preset-typescript**: Babel preset for TypeScript
7. **jest**: Testing framework
8. **eslint**: Linting tool
9. **prettier**: Code formatting tool

## Project Structure

```
NowPlayingTest/
├── app/                      # App screens and navigation
│   ├── _layout.tsx           # Root layout component
│   └── (tabs)/               # Tab screens
├── assets/                   # Static assets
│   ├── fonts/                # Custom fonts
│   └── images/               # Images
├── components/               # Reusable components
│   └── ui/                   # UI components
├── constants/                # Constants and configuration
├── context/                  # React Context providers
│   └── TrackPlayerContext/   # TrackPlayer context
├── hooks/                    # Custom React hooks
├── ios/                      # iOS native code
├── memory-bank/              # Memory Bank documentation
├── scripts/                  # Utility scripts
└── utils/                    # Utility functions
    └── trackPlayer/          # TrackPlayer utilities
```

## Build and Deployment

### Development

1. **Local Development**:
   - Use Expo CLI for development
   - Use Expo Go app for quick testing
   - Use Expo development builds for native module testing

2. **Testing**:
   - Test on physical iOS devices
   - Test background playback
   - Test Now Playing widget

### Production

1. **Building for Production**:
   - Use Expo EAS Build for production builds
   - Configure app.json for production settings
   - Set up proper signing certificates

2. **Distribution**:
   - TestFlight for beta testing
   - App Store for production release

## Integration Points

1. **iOS Audio System**:
   - Integration with iOS audio session
   - Integration with Now Playing widget
   - Integration with Control Center

2. **Metadata API**:
   - Integration with metadata API for live stream information
   - Handling metadata updates

3. **Podcast Feed**:
   - Integration with podcast feed parser
   - Handling podcast episode metadata
