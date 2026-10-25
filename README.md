# Deon SI — GIDEON Holographic AI Interface

A fresh implementation for the GIDEON holographic assistant experience. Product direction: hybrid holographic avatar and control panels, a personalized 3D face, and one responsive web app for mobile, laptop, Chromebook, and desktop.

## Current implementation
- Responsive React + TypeScript + Vite application.
- Hologram-inspired animated interface and responsive control panels.
- Local GLB avatar preview; model files remain in the current browser session.
- Browser speech recognition where supported, with text entry fallback.
- Browser text-to-speech for actual assistant replies returned by a configured backend.
- Honest UI states for unavailable AI service, voice support, and avatar model.
- No invented AI replies when the backend is unavailable.

## Run locally
Requires Node.js 20 or newer.

    npm install
    npm run dev

Validate before deploying:

    npm run typecheck
    npm run build
    npm run preview

## Real AI integration is not connected yet
The frontend expects a same-origin endpoint at /api/assistant/turn. A secure server must be implemented before connecting a real model provider. Provider credentials must remain on the server, never in browser code or VITE_ variables. Until the endpoint is available, the UI reports the connection error rather than pretending to be an AI assistant.

## Personalized 3D face
The avatar workshop accepts a 3D GLB model and previews it locally. A normal photo is not a 3D model: creating the personalized face requires an authorized reference photo and a separate 3D modelling/generation workflow. No photo or model is included yet.

The 3D viewer loads from Google's model-viewer CDN, so an internet connection is required for the model preview. Fonts are loaded from Google Fonts.

## Voice
Speech recognition depends on browser support and permissions. Text input remains available as a fallback. Spoken responses use browser speech synthesis only after a real backend response has been received. Push-to-talk is the MVP; no always-on microphone or wake word is implemented.

## Security principles
- Never put provider secrets in frontend code.
- Authenticate and validate requests server-side.
- Enforce tool permissions and confirmations on the server, not from client-supplied claims.
- Keep an audit trail for consequential tool execution.
- Do not claim an action succeeded unless the server confirms it.

## Planned next steps
See docs/IMPLEMENTATION-PLAN.md. Physical hologram stand hardware is out of scope for this repository's software MVP.