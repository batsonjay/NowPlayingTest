# Required Developer Setup

This document outlines the steps needed to set up a development environment for continuing work on the BalearicFmRadio project on a new computer. The steps are organized into two categories:

1. **CLI Tasks** - Tasks that can be performed using the command line in VS Code
2. **Manual Tasks** - Tasks that require manual intervention on developer portals or through GUI applications

## Prerequisites

- macOS (required for iOS development)
- Apple Developer account
- Expo account (if using EAS Build)
- GitHub access to the BalearicFmRadio repository

## Setup Process

### 1. CLI Tasks (Can be performed in VS Code)

#### 1.1. Install Development Tools

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

#### 1.2. Clone and Set Up the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/BalearicFmRadio.git
cd BalearicFmRadio

# Install dependencies
npm install

# Copy the migration documentation from NowPlayingTest
cp /path/to/NowPlayingTest/READ_ME_FIRST.md .
cp /path/to/NowPlayingTest/MIGRATION_NOTES.md .
cp /path/to/NowPlayingTest/MIGRATION_PLAN.md .
cp /path/to/NowPlayingTest/MEDIA_PLAYER_LEARNINGS.md .
cp /path/to/NowPlayingTest/README_TRACK_PLAYER.md .
```

#### 1.3. Install react-native-track-player

```bash
# Install the package
npm install react-native-track-player

# Update pod dependencies
cd ios && pod install && cd ..
```

#### 1.4. Configure Environment Variables (if needed)

```bash
# Create .env file if needed
touch .env

# Add necessary environment variables
echo "API_URL=https://your-api-url.com" >> .env
```

### 2. Manual Tasks (Require intervention outside VS Code)

#### 2.1. Apple Developer Portal Setup

1. **Sign in to Apple Developer Account**
   - Visit [developer.apple.com](https://developer.apple.com) and sign in
   - Ensure your Apple Developer Program membership is active

2. **Create App ID**
   - Go to Certificates, Identifiers & Profiles
   - Select Identifiers and create a new App ID if not already created
   - Ensure the Bundle ID matches the one in your Xcode project
   - Enable necessary capabilities:
     - Background Modes
     - Push Notifications (if used)
     - Associated Domains (if used)

3. **Create Development Certificate**
   - Go to Certificates and create a new Development certificate
   - Follow the instructions to generate a Certificate Signing Request (CSR)
   - Download and install the certificate

4. **Register Test Devices**
   - Go to Devices and register your test device(s)
   - You'll need the UDID of each device (can be found in Finder when connecting the device)

5. **Create Development Provisioning Profile**
   - Go to Provisioning Profiles and create a new Development profile
   - Select the App ID, certificates, and devices to include
   - Download and install the provisioning profile

#### 2.2. Xcode Setup

1. **Install Xcode**
   - Download and install Xcode from the Mac App Store
   - Install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```

2. **Sign in to Apple ID in Xcode**
   - Open Xcode → Preferences → Accounts
   - Add your Apple ID and select your team

3. **Import Certificates and Provisioning Profiles**
   - Double-click the downloaded certificates and provisioning profiles to install them
   - Alternatively, drag them into Xcode → Preferences → Accounts → Manage Certificates

4. **Configure Project Signing**
   - Open the Xcode project
   - Select the project in the navigator
   - Go to Signing & Capabilities
   - Select your team and ensure Automatically manage signing is checked
   - Resolve any signing issues that appear

#### 2.3. Expo Setup (if using Expo)

1. **Sign in to Expo**
   - In VS Code terminal:
     ```bash
     expo login
     ```
   - Enter your Expo credentials

2. **Configure EAS Build (if using EAS Build)**
   - In VS Code terminal:
     ```bash
     eas build:configure
     ```
   - Follow the prompts to set up your build configuration

3. **Set up Expo Application Services**
   - Visit [expo.dev](https://expo.dev)
   - Create or select your project
   - Configure necessary services:
     - Updates
     - Notifications
     - Build

## Verification Steps

After completing the setup, verify that everything is working correctly:

### 1. Verify Development Environment

```bash
# Check Node.js version
node -v

# Check npm version
npm -v

# Check Expo CLI version
expo --version

# Check React Native environment
npx react-native doctor
```

### 2. Verify iOS Build

```bash
# Build the iOS app
npx expo run:ios
```

### 3. Verify Playback Functionality

1. Run the app on a physical iOS device
2. Test the live stream playback
3. Verify that the Now Playing widget appears
4. Test background playback

## Troubleshooting

### Common Issues and Solutions

#### Certificate Issues

If you encounter certificate issues:
1. Check that your certificates are valid and not expired
2. Ensure you're using the correct provisioning profile
3. Try revoking and creating new certificates if necessary

#### Build Errors

If you encounter build errors:
1. Clean the build folder:
   ```bash
   cd ios && xcodebuild clean && cd ..
   ```
2. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
3. Reinstall pods:
   ```bash
   cd ios && pod deintegrate && pod install && cd ..
   ```

#### Playback Issues

If you encounter playback issues:
1. Check that background modes are properly configured in Info.plist
2. Verify that the audio session is properly configured
3. Check the console logs for any errors

## Additional Resources

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Expo Documentation](https://docs.expo.dev/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [react-native-track-player Documentation](https://react-native-track-player.js.org/)
