# Mobile — checklist pro příští EAS build

Položky, které vyžadují nový native binár (nelze shipnout jen JS bundlem —
viz ADR-9: native změny a JS flip vždy odděleně).

## Před buildem (kód)

1. **Sentry** — `npm install @sentry/react-native --workspace=@fitai/mobile`,
   přidat `@sentry/react-native/expo` do `app.json` plugins, init v `App.tsx`
   gated na `EXPO_PUBLIC_SENTRY_DSN` (DSN: user provisionuje Sentry projekt).
   NEINSTALOVAT bez buildu — starý binár + nový JS s importem native modulu
   = crash při startu.
2. **Push notifications restore** (volitelné pro v1):
   - Upload APNs .p8: `npx eas credentials` → iOS → Push Notifications
   - `npm install expo-notifications@~0.32.16 --workspace=@fitai/mobile`
   - `expo-notifications` zpět do `app.json` plugins
   - Obnovit registraci z git history (odstraněno 2026-07-02, commit
     "mobile push dead code removal"); server endpoint
     `registerExpoPushToken` v api.ts zůstal.
3. **Privacy manifest ověření**: po `npx expo prebuild --clean` zkontrolovat
   `ios/FitAI/PrivacyInfo.xcprivacy` — Expo SDK 54 agreguje required-reason
   APIs z knihoven automaticky; ověřit, že obsahuje kategorie UserDefaults
   + FileTimestamp. Pokud ne, přidat config plugin.
4. Zvážit úklid duplicit: `react-native-worklets` vs `react-native-worklets-core`,
   `expo-camera` vs `react-native-vision-camera` (Pro screen potřebuje
   VisionCamera, basic screen expo-camera — ověřit, zda basic nejde na
   VisionCamera taky). Root package.json anti-hoist pin (expo 55/RN 0.83)
   řešit až s plnou EAS verifikací.

## Build procedura (viz .claude/rules/mobile.md)

```bash
cd apps/mobile
rm -rf ios && npx expo prebuild --clean && cd ios && pod install && cd ..
npx tsc --noEmit
npx expo export --platform ios --dev
npx eas build --profile development --platform ios
```

## Po buildu

- Device test: HealthKit/Health Connect permissions + initial 7d sync
  (Wave 1 zbývá), voice pipeline (echo workaround), camera workout.
- Bundle ID je `cz.bfevents.fitai` (eas.json submit opraven 2026-07-02) —
  **před submitem ověřit proti App Store Connect recordu**.
