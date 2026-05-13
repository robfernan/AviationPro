#!/bin/bash

# AviationPro Capacitor Setup Script
# This script installs and initializes Capacitor for mobile development

set -e

echo "================================"
echo "AviationPro Capacitor Setup"
echo "================================"
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16 or later."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Install Capacitor CLI globally if needed
if ! command -v cap &> /dev/null; then
    echo "Installing Capacitor CLI..."
    npm install -g @capacitor/cli
fi

echo "✓ Capacitor CLI is available"
echo ""

# Install dev dependencies
echo "Installing Capacitor packages..."
npm install @capacitor/core @capacitor/cli

echo "✓ Capacitor core packages installed"
echo ""

# Install plugins
echo "Installing Capacitor plugins..."
npm install @capacitor/splash-screen @capacitor/filesystem @capacitor/share @capacitor/battery @capacitor/app

echo "✓ Plugins installed"
echo ""

# Initialize Capacitor if needed
if [ ! -f "capacitor.config.ts" ]; then
    echo "Initializing Capacitor..."
    npx cap init --web-dir dist 2>/dev/null || true
fi

echo "✓ Capacitor initialized"
echo ""

# Check for iOS requirements on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macOS detected. Checking iOS prerequisites..."
    
    if ! command -v xcode-select &> /dev/null; then
        echo "Warning: Xcode Command Line Tools not found"
        echo "Install with: xcode-select --install"
    else
        echo "✓ Xcode Command Line Tools found"
    fi
    
    if ! command -v pod &> /dev/null; then
        echo "Warning: CocoaPods not found"
        echo "Install with: sudo gem install cocoapods"
    else
        echo "✓ CocoaPods found"
    fi
fi

echo ""
echo "================================"
echo "Next Steps:"
echo "================================"
echo ""
echo "1. Build the web app:"
echo "   npm run build"
echo ""
echo "2. Add platforms:"
echo "   npx cap add ios    # for iOS"
echo "   npx cap add android  # for Android"
echo ""
echo "3. Open native IDEs:"
echo "   npx cap open ios      # Opens Xcode"
echo "   npx cap open android  # Opens Android Studio"
echo ""
echo "4. For development, run in another terminal:"
echo "   npx cap serve"
echo ""
echo "See CAPACITOR_SETUP.md for detailed instructions."
echo ""
