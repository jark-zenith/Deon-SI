# Deon SI — Holographic AI Interface

Deon SI is a responsive holographic AI assistant experience for mobile, laptop, Chromebook, and desktop. Its visual direction combines a personalized 3D avatar with practical control panels. The physical hologram stand is intentionally outside the software scope.

## Product decisions
- Interface: hybrid hologram and control panels.
- Avatar: personalized 3D face from the start; requires an authorized photo set and a generated 3D model.
- First deliverable: responsive web app.
- Voice: push-to-talk first, with text input fallback.
- Memory: timeline of projects, decisions, notes, and deadlines, followed by conflict and upcoming-deadline alerts.

## Current implementation
- React + TypeScript + Vite responsive interface.
- Hologram-inspired animated avatar area and control panels.
- Local GLB avatar upload and browser preview.
- Browser speech recognition where supported.
- Browser speech synthesis only after a real backend response.
- Explicit unavailable/error states; no fabricated AI answers.
- Implementation roadmap and CI workflow.

## Run locally
Requires Node.js 20 or newer.

    npm install
    npm run dev

Validate before deploying:

    npm run typecheck
    npm run build
    npm run preview

## Personalized avatar workflow
Use the photo checklist in the project plan: front neutral shots, gradual left/right profiles, varied chin angles, smile and mouth shapes, plus upper-body front and side views. Keep originals and use only photos you have permission to use. Create the head/body in Blender with a suitable face-modelling workflow, add blink and mouth shape keys where possible, then export an optimized GLB.

A normal photo is not a 3D model. The current workshop previews an existing GLB; it does not reconstruct a face from a photo automatically.

## AI and voice integration status
The frontend expects a same-origin endpoint at `/api/assistant/turn`. A secure server-side adapter must be implemented before connecting a real model provider. Provider credentials must remain on the server, never in browser code or `VITE_` variables. Voice recognition and synthesis are browser-dependent; always provide text input as fallback.

## Security principles
- Keep provider secrets server-side.
- Validate requests and enforce authentication, rate limits, and permissions on the server.
- Require explicit confirmation for consequential tool execution and record an audit trail.
- Never claim an action succeeded unless the server confirms it.

## Roadmap
See [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md).