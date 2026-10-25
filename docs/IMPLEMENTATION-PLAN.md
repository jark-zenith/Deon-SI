# Deon SI — Holographic AI Interface Implementation Plan

## Product decisions
- Project/repository: `jark-zenith/Deon-SI`.
- Product name: Deon SI (replace the former working name Gideon SI throughout this project).
- Interface: hybrid hologram and control panels.
- Avatar: personalized 3D face from the start; actual model creation is a dependency, not a completed feature.
- Delivery: one responsive web app for mobile, laptop, Chromebook, and desktop.
- Physical hologram stand: excluded from this software project.
- Hackathon priority: a small, reliable, demonstrable end-to-end experience before advanced features.
- Voice: push-to-talk first; no always-on microphone or wake word in the MVP.

## Phase 1 — Responsive interface and demo shell
- React + TypeScript + Vite.
- Mobile-first layout with desktop control panels.
- Hologram-inspired stage with cyan/blue glow, scan lines, subtle flicker, animated rings, and floating status/timeline cards.
- Accessible controls and clear listening, processing, speaking, offline, and error states.
- Avatar workshop for importing and previewing a GLB model.

## Phase 2 — Personalized 3D avatar
Photo shoot checklist:
1. Use soft daylight beside a large window, facing a plain light wall; avoid direct sun and harsh shadows.
2. Pull hair back so forehead and ears are visible; avoid glasses, caps, earrings, filters, portrait mode, and HDR.
3. Use the rear camera at 1x, eye level, about one metre away; clean the lens and lock focus/exposure if possible.
4. Capture around 25 sharp, evenly lit images: three front neutral shots; left and right head turns at 15°, 30°, 45°, 60°, 75°, and 90°; front chin slightly up/down; a natural smile; mouth shapes for “ah” and “oo”; and upper-body front and side shots.
5. Back up originals securely and use only imagery the subject has authorized for this purpose.

Modelling workflow:
- Start with Blender and an appropriate face-modelling add-on/workflow; alternative high-end tools may require stronger hardware.
- Fit landmarks from front and profile images, bake textures, and attach a simple body mesh.
- Add blink and mouth shape keys where feasible (closed, “ah”, “oo”, “ee”, smile).
- Export an optimized GLB and preview it in the web app.
- Do not describe a photo upload as automatic 3D reconstruction unless that capability is actually implemented.

## Phase 3 — Holographic rendering
- Render the approved GLB in a Three.js scene.
- Apply cyan/blue transparent material, Fresnel edge glow, animated horizontal scan lines, subtle flicker, and light bloom.
- Add a glowing base-ring visual and floating UI elements.
- Keep the software base/platform visual separate from physical hologram hardware.

## Phase 4 — Assistant brain and voice
- Implement a same-origin server endpoint at `/api/assistant/turn`.
- Add a provider adapter for the chosen AI model; keep credentials on the server.
- Define Deon SI's personality: calm, precise, time-aware, helpful, and honest about capabilities.
- Use browser speech recognition for initial speech-to-text where supported; retain text input fallback.
- Use browser text-to-speech for the initial voice output.
- Stream replies if supported by the chosen backend, and only speak real model responses.
- Handle microphone denial, unsupported browsers, network failures, and provider errors clearly.

## Phase 5 — Timeline memory and proactive assistance
- Store projects, decisions, deadlines, and notes in a database.
- Retrieve only relevant timeline entries for each conversation.
- Display timeline items as floating cards and useful control-panel entries.
- Add alerts for upcoming deadlines, schedule conflicts, and contradictions with prior decisions.
- Make memory edits and consequential actions transparent and auditable.

## Phase 6 — Verification and hackathon presentation
- Run type checking and a production build.
- Test mobile, laptop, Chromebook, and wide desktop layouts.
- Test microphone denial, missing avatar, offline API, malformed requests, and server errors.
- Verify the assistant never presents mock content as a real answer.
- Record a 2–3 minute demo and prepare a pitch covering the problem, personalized presence, time awareness, safety, and the model-provider integration.
- Save progress to GitHub daily and keep time for submission issues.

## Suggested order of work
1. Make the current responsive shell build and run reliably.
2. Finish avatar import and hologram stage.
3. Add the secure assistant endpoint and one real model provider.
4. Connect push-to-talk and spoken responses.
5. Add a small persistent timeline with one proactive reminder.
6. Polish and record the demo.

## Current status (update honestly as work lands)
- Responsive UI foundation: started on `feat/gideon-holographic-mvp` (branch should be renamed when practical).
- Local GLB preview: implemented in the first iteration; verify in CI/browser.
- Personalized face: pending authorized photos and 3D model creation.
- Real AI provider/backend: not connected.
- Speech recognition: browser-dependent and permission-gated.
- Speech output: browser synthesis for real backend replies only.
- Deployment: not verified.
- Physical hologram stand: intentionally excluded.