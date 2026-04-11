---
name: native-module-check
description: Verify a React Native / Expo native module is correctly wired for autolinking before running EAS build. Use when adding a new native module (camera, audio, mic, ML Kit, Bluetooth) or when a module fails at runtime with "module not found". Runs the full pre-flight in under 30 seconds.
---

# Native Module Check Skill

Run this BEFORE every EAS build when a native module changed.

## The golden rule

> **Native modules MUST be in `apps/mobile/package.json` — NOT the monorepo root.**

The monorepo root `package.json` is for shared tools (TypeScript, linters). Autolinking scans workspace packages; if a native module lives in the root, it will be invisible to `expo-modules-autolinking` and fail at runtime.

## 6-step pre-flight

```bash
cd /Users/renechlubny/projekty/fitai

# 1. Is the module in mobile package.json?
cat apps/mobile/package.json | jq '.dependencies["MODULE_NAME"]'
# Expected: version string, NOT null

# 2. Does autolinking resolve it?
cd apps/mobile
npx expo-modules-autolinking resolve --platform ios | grep -i MODULE_NAME
# Expected: JSON entry with podspec path

# 3. Is it in app.json plugins if it needs config?
jq '.expo.plugins' app.json | grep MODULE_NAME
# Expected: present if module provides a config plugin

# 4. Prebuild regenerates ios/ without errors
rm -rf ios
npx expo prebuild --clean --platform ios 2>&1 | tail -20
# Expected: "Generated: ios/" message

# 5. Pod install succeeds locally
cd ios && pod install 2>&1 | tail -10
# Expected: "Pod installation complete!"

# 6. Xcode build reaches "Building" phase (not link errors)
xcodebuild -workspace fitai.xcworkspace -scheme fitai \
  -configuration Debug -sdk iphonesimulator -quiet 2>&1 | grep -E "(error:|BUILD)"
# Expected: BUILD SUCCEEDED or no link errors
```

## Adding a new native module — correct order

```bash
# 1. Add to mobile package.json (NOT root)
cd apps/mobile
npm install <module-name>

# 2. Add config plugin if module needs one
# Edit apps/mobile/app.json → plugins: [...existing, "<module-name>"]

# 3. Regenerate native project
rm -rf ios android
npx expo prebuild --clean

# 4. Verify autolinking
npx expo-modules-autolinking resolve --platform ios | grep <module-name>

# 5. Test locally BEFORE EAS
cd ios && pod install
xcodebuild -workspace fitai.xcworkspace -scheme fitai ...

# 6. Only now — push EAS build
cd ../.. && eas build --platform ios --profile development
```

## Anti-patterns (common mistakes)

- ❌ `npm install <module>` at monorepo root → invisible to autolinking
- ❌ Relying on `NativeModules.MyModule` existence check → unreliable on cold start
- ❌ Commit `ios/` or `android/` folders → prebuild regenerates them, merge conflicts inevitable
- ❌ Skip local prebuild → EAS will just fail with more confusing logs
- ❌ Add to `plugins: []` without the dependency → prebuild errors
- ❌ Forget `pod install` after prebuild → missing symbols at link time

## FitAI-specific modules already wired

| Module | Purpose | Config plugin? |
|---|---|---|
| `react-native-vision-camera` | Frame processor base | Yes |
| Local `FitAIPoseDetection` pod | ML Kit Pose wrapper | No (local) |
| `expo-audio` | Coach TTS playback | No |
| `expo-speech-recognition` | MIC input | Yes |
| `expo-haptics` | Rep feedback | No |
| `expo-image-picker` | Progress photo / food photo | Yes |
| `expo-notifications` | Push | Yes |

When adding new: follow the 6-step pre-flight in order. Never skip local verification.
