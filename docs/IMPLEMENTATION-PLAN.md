# Deon SI — GIDEON Holographic MVP Plan

## Product decisions
- Project/repository: jark-zenith/Deon-SI.
- Interface: hybrid holographic avatar and control panels.
- Avatar: personalized 3D face is the goal; the actual face model remains a dependency.
- Delivery: one responsive web app for mobile, laptop, Chromebook, and desktop.
- Hardware: physical hologram stand excluded from software scope.
- Voice: push-to-talk first; no always-on listening or wake word in the MVP.

## Milestones

### 1. Responsive frontend foundation
- React + TypeScript + Vite.
- Mobile-first layouts, accessible controls, clear system state.
- Holographic animation and utility panels.

### 2. Personalized 3D presence
- Obtain an authorized reference photo.
- Create a 3D head/face model using an appropriate modelling workflow.
- Export and optimize a GLB.
- Preview it locally and integrate the approved model.

### 3. Server-side AI adapter
- Implement a same-origin assistant API route.
- Connect the route to a chosen provider behind a server-side adapter.
- Keep API keys server-side.
- Validate payloads, authentication, rate limits, and tool permissions.
- Use explicit confirmations and auditable execution for consequential actions.

### 4. Voice pipeline
- Browser speech recognition as the initial speech-to-text path where supported.
- Model response through the server API.
- Browser speech synthesis for text-to-speech.
- Show listening, processing, speaking, unavailable, and error states.
- Keep text entry as a fallback.

### 5. Test and demo
- Run TypeScript checks and production build.
- Test narrow mobile and wide desktop layouts.
- Test API unavailable/error paths and denied microphone permissions.
- Confirm that no mock response is presented as a real AI answer.
- Deploy only after checks pass and server configuration is available.

## Current status
- Responsive interface foundation: implementation started.
- Local GLB preview: included in the first implementation.
- Personalized face model: pending reference photo and 3D model creation.
- Real AI provider/backend: not connected.
- Voice input: browser-dependent and requires permission.
- Speech output: uses browser speech synthesis only for real backend replies.
- Production deployment: not verified yet.