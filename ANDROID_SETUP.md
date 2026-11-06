# Android Development & Setup Guide

This guide describes how to set up the Android development environment and run the **Tour Expense Tracker** hybrid application using Capacitor.

---

## 1. Prerequisites & System Requirements

- **Node.js**: `v18.x` or `v20+` (verified on Node `v24.x`)
- **Package Manager**: `npm`
- **Java Development Kit (JDK)**: **JDK 21 or JDK 22** (Capacitor 7/8 targets Java 21).
  - Recommended path: `C:\Program Files\Java\jdk-22` or Android Studio's bundled JBR (`C:\Program Files\Android\Android Studio\jbr`).
- **Android Studio**: Android Studio Hedgehog / Iguana / Koala / Ladybug or newer.
- **Android SDK**:
  - Android SDK Platform: `API 34` or `API 36`
  - Android SDK Build-Tools: `34.0.0`, `35.0.0`, or `36.0.0`
  - Android SDK Command-line Tools
  - Android SDK Platform-Tools (adb)

---

## 2. Environment Variables Configuration

Ensure the following system environment variables are set:

### Windows (PowerShell)
```powershell
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-22", "User")

# Add Platform Tools to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
[System.Environment]::SetEnvironmentVariable("Path", "$currentPath;$env:LOCALAPPDATA\Android\Sdk\platform-tools", "User")
```

Verify with:
```powershell
$env:ANDROID_HOME
$env:JAVA_HOME
adb --version
```

---

## 3. Project Configuration

### 3.1 Android SDK Path (`local.properties`)
The file `Frontend/android/local.properties` specifies the path to your Android SDK:
```properties
sdk.dir=C\:\\Users\\ashri\\AppData\\Local\\Android\\Sdk
```
*(Note: escaped colons and backslashes are standard in Gradle properties files on Windows).*

### 3.2 Capacitor Configuration (`capacitor.config.json`)
The application configuration is managed in `Frontend/capacitor.config.json`:
- **App ID**: `com.tripexpense.tracker`
- **App Name**: `Tour Expense Tracker`
- **Web Dir**: `dist`
- **Android Scheme**: `https`
- **Plugins**: SplashScreen, StatusBar, Keyboard, Haptics, Share, Network, Preferences.

---

## 4. First-Time Setup Instructions

1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the production React web bundle:
   ```bash
   npm run build
   ```

4. Sync web assets and plugins to the native Android project:
   ```bash
   npm run android:sync
   ```

5. Open the project in Android Studio:
   ```bash
   npm run android:open
   ```
   Or open the folder `c:\Users\ashri\SpringNew\Expence_Tracker\Frontend\android` directly from Android Studio.

