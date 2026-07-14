// Points the mobile app at the Komala HR web app's API (the web app's Next.js
// route handlers, see apps/web/app/api/**, serve as the backend for both web
// and mobile clients).
//
// localhost only resolves to the phone/emulator itself, not your dev machine —
// override this with your machine's LAN IP (or use 10.0.2.2 for the Android
// emulator) via the EXPO_PUBLIC_API_BASE_URL env var when running on a device.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
