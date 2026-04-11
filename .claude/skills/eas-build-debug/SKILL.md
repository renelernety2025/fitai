---
name: eas-build-debug
description: Diagnose EAS Build failures for FitAI mobile (apps/mobile). Use when EAS iOS/Android build fails, when pod install crashes, when native module autolinking breaks, or when VisionCamera/ML Kit Pose fail to link. NEVER auto-invoke — only on explicit user request.
---

# EAS Build Debug Skill

> **Manual-only skill.** Do not auto-invoke. Run only when user explicitly asks to debug an EAS build failure.

## Pre-flight checklist (run in order)

### 1. Native modules in the RIGHT package.json
```bash
# Native modules MUST be in apps/mobile/package.json, NOT root package.json
cat apps/mobile/package.json | jq '.dependencies | keys[]' | grep -E "(vision-camera|expo-audio|expo-speech-recognition|react-native-mlkit)"
```
If missing → `cd apps/mobile && npm install <module>` (NOT at monorepo root).

### 2. Autolinking resolves
```bash
cd apps/mobile
npx expo-modules-autolinking resolve --platform ios | grep <module-name>
```
If not listed → the module won't be included in the iOS build. Fix: ensure it's in `apps/mobile/package.json` AND run `npx expo prebuild --clean`.

### 3. app.json plugins array
```bash
cat apps/mobile/app.json | jq '.expo.plugins'
```
Every native module that needs config plugins (camera permissions, mic permissions, speech recognition) must be listed.

### 4. No root-level Expo artifacts
```bash
ls /Users/renechlubny/projekty/fitai/app.json 2>&1     # MUST NOT EXIST
ls /Users/renechlubny/projekty/fitai/ios 2>&1          # MUST NOT EXIST
```
Root-level `app.json` or `ios/` causes target mismatch and breaks EAS.

### 5. Local prebuild + pod install MUST succeed before EAS
```bash
cd apps/mobile
rm -rf ios
npx expo prebuild --clean --platform ios
cd ios && pod install 2>&1 | tail -30
```
If `pod install` fails locally, EAS will fail. Fix locally first.

### 6. Xcode build sanity (optional, fast fail)
```bash
cd apps/mobile/ios
xcodebuild -workspace fitai.xcworkspace -scheme fitai -configuration Debug -sdk iphonesimulator -quiet 2>&1 | tail -20
```

## Known failure patterns

### "VisionCamera frame processor headers not public"
**Symptom:** `VisionCamera/FrameProcessorPlugin.h not found` during pod install.
**Cause:** VisionCamera v4 does NOT export frame processor headers as public in its podspec.
**Fix:** FitAI uses a **local CocoaPod** `FitAIPoseDetection` that includes VisionCamera + GoogleMLKit/PoseDetection as dependencies. If EAS fails here, verify:
- `apps/mobile/ios/FitAIPoseDetection.podspec` exists after prebuild
- `apps/mobile/modules/pose-detection/` source files present
- `header_search_paths` in the podspec points to `$(PODS_ROOT)/VisionCamera/ios/**`

### "expo-speech-recognition not found at runtime"
**Cause:** Not added to `apps/mobile/package.json` (common mistake — was added to root).
**Fix:** `cd apps/mobile && npm install expo-speech-recognition` + re-prebuild.

### "expo-av is deprecated" warnings cascading into build errors
**Cause:** Mixing expo-av with expo-audio.
**Fix:** Remove expo-av completely; use expo-audio (see voice-pipeline skill).

### "Multiple commands produce X" (Xcode build conflict)
**Cause:** Usually a ghost `ios/` folder from an old prebuild.
**Fix:** `rm -rf apps/mobile/ios && npx expo prebuild --clean --platform ios`.

## If all checks pass and EAS still fails
1. Get the EAS build logs: `eas build:view --latest`
2. Search for the first `error:` (not warnings)
3. Match against known patterns above
4. If new → add to this skill after resolving

## Do NOT
- Do NOT run `eas build` until the 6-step checklist passes locally
- Do NOT modify root `package.json` — native deps belong in `apps/mobile/package.json`
- Do NOT commit `ios/` or `android/` folders (prebuild generates them)
