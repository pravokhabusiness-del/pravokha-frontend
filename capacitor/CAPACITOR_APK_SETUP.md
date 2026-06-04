# 📱 Pravokha Android APK — Capacitor Setup Guide

## Prerequisites
- Node.js 18+
- Android Studio installed
- Java JDK 17+

---

## Step 1: Install Capacitor

```bash
cd Pravokha-main
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
```

When prompted:
- **App name**: Pravokha
- **App ID**: `com.pravokha.app`
- **Web asset directory**: `dist`

---

## Step 2: Update `capacitor.config.ts`

Replace the generated config with:

```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pravokha.app',
  appName: 'Pravokha',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#ffffff',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#E40A35',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
```

---

## Step 3: Build & Add Android Platform

```bash
# Build your React app first
npm run build

# Add Android platform
npx cap add android

# Sync built files into Android project
npx cap sync android
```

---

## Step 4: Set App Icon & Splash Screen

```bash
npm install @capacitor/splash-screen
```

Place your app icon (1024×1024 PNG) at `resources/icon.png`  
Place your splash image (2732×2732 PNG) at `resources/splash.png`

```bash
npx capacitor-assets generate
```

---

## Step 5: Open in Android Studio

```bash
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Go to **Build → Generate Signed APK** (for production)
   — OR —
3. Click the **▶ Run** button to test on emulator/device

---

## Step 6: Build APK

### Debug APK (for testing):
```bash
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (for Play Store / distribution):
```bash
# First create a keystore (one-time):
keytool -genkey -v -keystore pravokha.keystore -alias pravokha -keyalg RSA -keysize 2048 -validity 10000

# Build release
./gradlew assembleRelease
# Sign with:
# Build → Generate Signed Bundle/APK in Android Studio
```

---

## Step 7: After Every Code Change

```bash
npm run build
npx cap sync android
```

Then rebuild in Android Studio or run `./gradlew assembleDebug` again.

---

## Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `npx cap sync` | Sync web build to native |
| `npx cap open android` | Open in Android Studio |
| `npx cap run android` | Run on connected device |
| `./gradlew assembleDebug` | Build debug APK |
| `./gradlew assembleRelease` | Build release APK |

---

## Troubleshooting

**"SDK not found"** — Set `ANDROID_HOME` env variable pointing to your Android SDK path.

**White screen in app** — Make sure `npm run build` succeeded and `webDir: 'dist'` is correct in capacitor config.

**API calls failing in APK** — Ensure your `.env` `VITE_API_URL` points to your **production server URL**, not localhost.

**Mixed content errors** — Add `android:usesCleartextTraffic="true"` in `android/app/src/main/AndroidManifest.xml` (only for HTTP APIs, not HTTPS).
