# Android Build & Deployment Guide

This guide covers building Debug APKs, Release Android App Bundles (AAB), and deploying to physical Android devices or emulators.

---

## 1. Quick Build Commands (CLI)

From the `Frontend` directory:

| Action | Command | Output Location |
|---|---|---|
| **Sync React assets with Android** | `npm run android:sync` | `Frontend/android/app/src/main/assets/public/` |
| **Build Debug APK** | `npm run android:build` | `Frontend/android/app/build/outputs/apk/debug/app-debug.apk` |
| **Open in Android Studio** | `npm run android:open` | Launches Android Studio IDE |

---

## 2. Generating a Debug APK via Command Line

1. Make sure Java 21+ is active in your terminal:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-22"
   ```

2. Build the Vite production bundle and sync Capacitor:
   ```powershell
   cd Frontend
   npm run build
   npx cap sync android
   ```

3. Assemble the debug APK using Gradle:
   ```powershell
   cd android
   .\gradlew.bat assembleDebug
   ```

4. The generated APK will be at:
   ```
   Frontend\android\app\build\outputs\apk\debug\app-debug.apk
   ```

---

## 3. Installing on a Physical Android Device or Emulator

### 3.1 On a Physical Device via ADB
1. On your Android phone, enable **Developer Options**:
   - Go to **Settings** > **About phone** > Tap **Build number** 7 times.
2. Enable **USB Debugging** in Developer options.
3. Connect your device via USB cable and allow USB debugging when prompted.
4. Verify your device is detected:
   ```powershell
   adb devices
   ```
5. Install the Debug APK:
   ```powershell
   adb install -r Frontend\android\app\build\outputs\apk\debug\app-debug.apk
   ```
6. Launch the app on your phone:
   - The app icon will appear with the title **Tour Expense Tracker**.

### 3.2 On an Android Emulator
1. List available virtual devices:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds
   ```
2. Start the emulator:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_37.0
   ```
3. Once booted, install the APK:
   ```powershell
   adb install -r Frontend\android\app\build\outputs\apk\debug\app-debug.apk
   ```

---

## 4. Building a Production Release Android App Bundle (AAB)

Google Play Store requires an Android App Bundle (`.aab`) for store releases.

1. Generate the unsigned release bundle via Gradle:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-22"
   cd Frontend\android
   .\gradlew.bat bundleRelease
   ```

2. The generated release bundle is located at:
   ```
   Frontend\android\app\build\outputs\bundle\release\app-release.aab
   ```

3. **Signing the Release Bundle for Google Play Store**:
   - Generate a release keystore (keep this private, outside source control):
     ```powershell
     keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
     ```
   - Sign the bundle using `jarsigner`:
     ```powershell
     jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore my-release-key.jks app-release.aab my-key-alias
     ```

---

## 5. Updating the React Application

Whenever you make frontend changes:
1. Make your changes in `Frontend/src/`.
2. Test in browser using `npm run dev`.
3. To update the native Android project:
   ```powershell
   npm run android:sync
   ```
4. Rebuild or run from Android Studio.

