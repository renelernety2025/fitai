---
paths:
  - "apps/mobile/**"
---

# Mobile Development Rules — FitAI

Tato pravidla se uplatňují při editaci čehokoli v `apps/mobile/`.

## Native modules
- **Native moduly MUSÍ být v `apps/mobile/package.json`** (NE v root `package.json`). Autolinking prohledává workspace — root dependency = neviditelná pro expo-modules-autolinking.
- **Lazy require pro native moduly** (expo-audio, expo-speech-recognition, expo-haptics): použij `try { require(...) } catch {}` uvnitř funkce, nikdy na top-of-file.
- **`NativeModules.MyModule` check NEFUNGUJE spolehlivě** při cold startu. Vždy try/require, nikdy `if (NativeModules.X)`.
- **`expo-av` je DEPRECATED** — používej **`expo-audio`** pro přehrávání zvuku. Nemíchat obojí.

## expo-speech-recognition API
- Events přes `ExpoSpeechRecognitionModule.addListener('result', cb)` — **NE** `new NativeEventEmitter()`.
- Cleanup: `const sub = addListener(...); ... sub.remove()`.
- `end` event sometimes nefires → mít fallback timeout.

## EAS Build
- **Před EAS buildem VŽDY lokálně:** `rm -rf ios && npx expo prebuild --clean && cd ios && pod install`. Pokud nefunguje lokálně, nefunguje ani na EAS.
- `app.json` **MUSÍ být v gitu** (NE v .gitignore).
- **Žádný root `app.json`** ani root `ios/` — způsobí target mismatch a build fail.
- Neprovádět commit `ios/` nebo `android/` složek (prebuild je generuje).

## Monorepo dedupe
- Metro config má `blockList` pro root `node_modules` — prevence React 18 hoist konfliktu. Nerušit.
- Pokud přidáš novou shared závislost, pečlivě testuj metro bundle: `npx expo export --platform ios --dev`.

## Voice coaching pipeline
- Pipeline: `coaching-engine.ts` → `coaching-phrases.ts` → `voice-coach.ts` → `/api/coaching/tts` → ElevenLabs → `expo-audio`.
- **MIC echo workaround:** při aktivaci MIC volej `pauseCoach()`, při zavření `resumeCoach()`.
- Coaching phrases v češtině, lowercase, max 12 slov, imperativní pro safety, specifické pro pochvalu.

## API URL
- Default je HTTPS produkce (`https://fitai.bfevents.cz`).
- Lokální dev: `EXPO_PUBLIC_API_URL=http://<ip>:3001` přes `.env.local`.

## Před commitem na mobile změny
1. `npx tsc --noEmit` (žádné TS errory)
2. `npx expo export --platform ios --dev` (metro bundle prošel)
3. Pokud native změna → `npx expo prebuild --clean` + `pod install` lokálně
4. Pak teprve push
