# Xcode Settings Guide

This guide explains how to manage Xcode settings for the NowPlayingTest project, particularly focusing on team signing and build configuration.

## Automatic Team Signing and Release Mode

We've made several changes to ensure that Xcode remembers your team signing settings and defaults to Release mode:

1. **Project Configuration**:
   - Added `CODE_SIGN_IDENTITY = "Apple Development"` to the project settings
   - Added `CODE_SIGN_STYLE = Automatic` to use automatic signing
   - Set `DEVELOPMENT_TEAM = KH23Y62G7A` for both Debug and Release configurations

2. **Scheme Configuration**:
   - Modified the shared scheme to use Release mode by default
   - Added `disableMainThreadChecker = "NO"` to improve performance

3. **Workspace Settings**:
   - Added shared workspace settings to ensure consistent behavior
   - Added project workspace settings to remember team signing

## VS Code Tasks

We've added several VS Code tasks to help manage the project:

1. **Reset Xcode Settings**:
   - Clears Xcode caches and derived data
   - Helps when Xcode is not remembering settings

2. **Reset Xcode and Full Setup**:
   - Combines resetting Xcode settings with a full project setup
   - Rebuilds the project from scratch with clean settings

## How to Use

### When Xcode Forgets Team Signing

If Xcode is not remembering your team signing settings:

1. Open VS Code
2. Press `Cmd+Shift+P` to open the command palette
3. Type "Tasks: Run Task"
4. Select "Reset Xcode Settings"
5. Follow the instructions in the terminal

### For a Complete Reset and Rebuild

If you want to reset everything and start fresh:

1. Open VS Code
2. Press `Cmd+Shift+P` to open the command palette
3. Type "Tasks: Run Task"
4. Select "Reset Xcode and Full Setup"
5. This will:
   - Reset Xcode settings
   - Rebuild the iOS project
   - Install CocoaPods
   - Open Xcode with the workspace

### Manual Configuration in Xcode

If you need to manually configure settings in Xcode:

1. **For Team Signing**:
   - Open the project in Xcode
   - Select the NowPlayingTest project in the Project Navigator
   - Select the NowPlayingTest target
   - Go to the Signing & Capabilities tab
   - Make sure "Automatically manage signing" is checked
   - Select your team from the dropdown

2. **For Build Configuration**:
   - Click on the scheme selector (next to the Run button)
   - Select "Edit Scheme..."
   - In the left sidebar, select "Run"
   - Make sure "Release" is selected in the Build Configuration dropdown
   - Click "Close"

## Troubleshooting

If you continue to have issues:

1. Try running the "Reset Xcode and Full Setup" task
2. Make sure you're using the latest version of Xcode
3. Check that your Apple Developer account has the correct permissions
4. Verify that your device is properly connected and trusted
