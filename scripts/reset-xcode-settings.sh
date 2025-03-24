#!/bin/bash

# Script to reset Xcode settings and caches
# This can help when Xcode is not remembering team signing or scheme settings

echo "Resetting Xcode settings and caches..."

# Close Xcode if it's open
osascript -e 'tell application "Xcode" to quit'

# Clear Xcode's derived data
echo "Clearing Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Clear Xcode's cache
echo "Clearing Xcode cache..."
rm -rf ~/Library/Caches/com.apple.dt.Xcode/*

# Clear Xcode's module cache
echo "Clearing Xcode module cache..."
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport/*/Symbols/System/Library/Caches/com.apple.dyld/*

# Reset Xcode's preferences (optional - uncomment if needed)
# echo "Resetting Xcode preferences..."
# defaults delete com.apple.dt.Xcode

echo "Done! Xcode settings and caches have been reset."
echo "Please open the project again in Xcode."
echo ""
echo "If you still have issues with team signing or scheme settings:"
echo "1. Open Xcode"
echo "2. Select the NowPlayingTest project in the Project Navigator"
echo "3. Select the NowPlayingTest target"
echo "4. Go to the Signing & Capabilities tab"
echo "5. Make sure 'Automatically manage signing' is checked"
echo "6. Select your team from the dropdown"
echo ""
echo "For scheme settings:"
echo "1. Click on the scheme selector (next to the Run button)"
echo "2. Select 'Edit Scheme...'"
echo "3. In the left sidebar, select 'Run'"
echo "4. Make sure 'Release' is selected in the Build Configuration dropdown"
echo "5. Click 'Close'"
