import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from "react";
import { Activity, AudioLines, Bot, Check, ChevronDown, Command, Cpu, Headphones, Menu, Mic, MicOff, Monitor, Send, Settings2, ShieldCheck, Sparkles, Volume2, X } from "lucide-react";

type Turn = { role: "user" | "assistant"; text: string; time: string };
type RecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type RecognitionEvent = { results: ArrayLike<RecognitionResult> };
type RecognitionInstance = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void;
};
type WindowWithRecognition = Window & {
  SpeechRecognition?: new () => RecognitionInstance;
  webkitSpeechRecognition?: new () => RecognitionInstance;
};
type ModelViewerElement = HTMLElement;

const initialTurns: Turn[] = [
  { role: "assistant", text: "GIDEON interface initialized. The assistant service is not connected yet. Connect the server endpoint to enable real AI conversations.", time: "SYSTEM" },
];

function clock() {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

export default function App() {
  const [turns, setTurns] = useState<Turn[]>(initialTurns);
  const [message, setMessage] = useState("");
  const [service, setService] = useState<"offline" | "online" | "checking">("offline");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [notice, setNotice] = useState("AI BACKEND NOT CONNECTED");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modelUrl, setModelUrl] = useState("");
  const [modelName, setModelName] = useState("");
  const [modelError, setModelError] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showModelTools, setShowModelTools] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState("/api/assistant/turn");
  const modelHost = useRef<HTMLDivElement>(null);
  const workshopModelHost = useRef<HTMLDivElement>(null);
  const recognition = useRef<RecognitionInstance | null>(null);
  const feedEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns, thinking]);

  useEffect(() => {
    if (!modelUrl || (!modelHost.current && !workshopModelHost.current)) return;
    const hosts = [modelHost.current, workshopModelHost.current].filter((host): host is HTMLDivElement => Boolean(host));
    const viewers = hosts.map((host) => {
    const viewer = document.createElement("model-viewer") as ModelViewerElement;
    viewer.setAttribute("src", modelUrl);
    viewer.setAttribute("camera-controls", "");
    viewer.setAttribute("auto-rotate", "");
    viewer.setAttribute("rotation-per-second", "10deg");
    viewer.setAttribute("shadow-intensity", "0.6");
    viewer.setAttribute("environment-image", "neutral");
    viewer.setAttribute("alt", "Personalized GIDEON 3D avatar");
    viewer.style.width = "100%";
    viewer.style.height = "100%";
    viewer.style.minHeight = "320px";
    viewer.style.background = "transparent";
    host.replaceChildren(viewer);
    return viewer;
    });
    return () => { viewers.forEach((viewer) => viewer.remove()); };
  }, [modelUrl]);

  useEffect(() => () => {
    recognition.current?.stop();
    if (modelUrl) URL.revokeObjectURL(modelUrl);
  }, [modelUrl]);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const text = message.trim();
    if (!text || thinking) return;
    setTurns((current) => [...current, { role: "user", text, time: clock() }]);
    setMessage("");
    setThinking(true);
    setNotice("CONTACTING ASSISTANT SERVICE");
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!response.ok) throw new Error("Assistant service returned HTTP " + response.status);
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || !("reply" in data) || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("Assistant endpoint returned an invalid response. Expected a non-empty reply string.");
      }
      const reply = data.reply.trim();
      setService("online");
      setNotice("ASSISTANT RESPONSE RECEIVED");
      setTurns((current) => [...current, { role: "assistant", text: reply, time: clock() }]);
      if (voiceEnabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setService("offline");
      const detail = error instanceof Error ? error.message : "Unknown connection error";
      setNotice("AI BACKEND UNAVAILABLE");
      setTurns((current) => [...current, { role: "assistant", text: "I couldn't reach the assistant backend. No AI response was generated. Check that " + apiEndpoint + " is running, then try again. Details: " + detail, time: clock() }]);
    } finally {
      setThinking(false);
    }
  }

  function toggleListening() {
    if (listening) {
      recognition.current?.stop();
      setListening(false);
      return;
    }
    const browserWindow = window as WindowWithRecognition;
    const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice("SPEECH RECOGNITION UNSUPPORTED — USE TEXT");
      return;
    }
    const instance = new Recognition();
    instance.lang = "en-KE";
    instance.interimResults = true;
    instance.continuous = false;
    instance.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index++) transcript += event.results[index][0].transcript;
      setMessage(transcript);
    };
    instance.onerror = (event) => {
      setNotice("MICROPHONE: " + event.error.toUpperCase());
      setListening(false);
    };
    instance.onend = () => setListening(false);
    recognition.current = instance;
    try {
      instance.start();
      setListening(true);
      setNotice("LISTENING — TAP MIC TO STOP");
    } catch {
      setListening(false);
      setNotice("MICROPHONE COULD NOT START");
    }
  }

  function loadModel(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".glb") || file.size > 40 * 1024 * 1024) {
      setModelError("Choose a GLB model smaller than 40 MB.");
      event.currentTarget.value = "";
      return;
    }
    setModelError("");
    setModelName(file.name);
    setModelUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  }

  const modeLabel = listening ? "LISTENING" : thinking ? "THINKING" : speaking ? "SPEAKING" : "STANDBY";

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-lockup" onClick={() => setMobileMenu(false)} aria-label="GIDEON home">
          <span className="brand-mark"><span /><span /><span /></span>
          <span className="brand-copy"><strong>GIDEON<span> / </span>SI</strong><small>PERSONAL INTELLIGENCE SYSTEM</small></span>
        </button>
        <div className="topbar-center"><span className="live-dot" /> LOCAL INTERFACE <span className="topbar-divider">/</span> BUILD 0.1.0</div>
        <div className="topbar-actions">
          <span className={"connection-pill " + service}><i />{service === "online" ? "SERVICE RESPONDING" : "SERVICE OFFLINE"}</span>
          <button className="icon-button menu-toggle" onClick={() => setMobileMenu((v) => !v)} aria-label="Toggle navigation">{mobileMenu ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </header>

      <div className="workspace">
        <aside className={"sidebar " + (mobileMenu ? "open" : "")}>
          <div className="side-section-label">WORKSPACE</div>
          <button className="nav-item active"><Command size={16} /><span>Presence</span><span className="nav-indicator" /></button>
          <button className="nav-item" onClick={() => { setShowModelTools(true); document.getElementById("avatar-workshop")?.scrollIntoView({ behavior: "smooth" }); }}><Sparkles size={16} /><span>Avatar workshop</span></button>
          <button className="nav-item" onClick={() => document.getElementById("conversation")?.scrollIntoView({ behavior: "smooth" })}><AudioLines size={16} /><span>Conversation</span></button>
          <button className="nav-item" onClick={() => document.getElementById("settings")?.scrollIntoView({ behavior: "smooth" })}><Settings2 size={16} /><span>Configuration</span></button>
          <div className="sidebar-spacer" />
          <div className="security-card"><ShieldCheck size={17} /><div><strong>SECURITY STATUS</strong><span>Local UI · No tools enabled</span></div><span className="security-dot" /></div>
          <div className="side-footer">PRUDEN TECHNOLOGIES <span>© 2026</span></div>
        </aside>

        <main className="main-content">
          <section className="page-heading">
            <div><div className="eyebrow"><span /> HOLOGRAPHIC INTERFACE <span className="slash">/</span> PERSONAL MODE</div><h1>Your intelligence.<br /><em>Present.</em></h1><p>A responsive digital presence designed to feel closer than a screen.</p></div>
            <div className="session-block"><span>SESSION STATUS</span><strong><i className={thinking || listening || speaking ? "pulse" : ""} />{modeLabel}</strong><small>END-TO-END AI <b>NOT CONNECTED</b></small></div>
          </section>

          <section className="hero-grid">
            <div className="holo-card">
              <div className="card-topline"><span><i /> AVATAR PROJECTION</span><span className="coordinates">GID-01 / LOCAL</span></div>
              <div className={"holo-stage " + (listening ? "is-listening" : "") + (thinking ? " is-thinking" : "") + (speaking ? " is-speaking" : "")}>
                <div className="stage-grid" />
                <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
                <div className="beam beam-top" /><div className="beam beam-bottom" />
                {modelUrl ? <div ref={modelHost} className="real-model-host" /> : <div className="avatar-placeholder" aria-label="Holographic avatar placeholder">
                  <div className="avatar-aura" /><div className="avatar-halo" />
                  <div className="avatar-head"><div className="head-shine" /><div className="hair-shape" /><div className="ear ear-left" /><div className="ear ear-right" /><div className="face"><div className="brow brow-left" /><div className="brow brow-right" /><div className="eye eye-left"><i /></div><div className="eye eye-right"><i /></div><div className="nose" /><div className="cheek cheek-left" /><div className="cheek cheek-right" /><div className="mouth"><i /></div><div className="jaw-line" /></div><div className="neck" /><div className="shoulders" /></div>
                  <div className="scanline" />
                </div>}
                <div className="stage-label stage-label-left"><span>CORE</span><strong>GIDEON</strong><small>{modeLabel}</small></div>
                <div className="stage-label stage-label-right"><span>RENDER</span><strong>{modelUrl ? "3D MODEL" : "HOLO / 2D"}</strong><small>{modelUrl ? "LOCAL GLB" : "PLACEHOLDER"}</small></div>
                <div className="stage-caption"><span className="equalizer"><i /><i /><i /><i /><i /><i /><i /></span><span>{listening ? "VOICE INPUT ACTIVE" : thinking ? "PROCESSING REQUEST" : speaking ? "VOICE OUTPUT ACTIVE" : "AWAITING INTERACTION"}</span></div>
              </div>
              <div className="holo-footer"><div><span className="status-ring" /> AVATAR SYSTEM <strong>{modelUrl ? "MODEL LOADED" : "PLACEHOLDER ACTIVE"}</strong></div><button onClick={() => { setShowModelTools(true); document.getElementById("avatar-workshop")?.scrollIntoView({ behavior: "smooth" }); }}>CUSTOMIZE <ChevronDown size={13} /></button></div>
            </div>

            <div className="right-stack">
              <div className="panel system-panel">
                <div className="panel-heading"><span>LIVE SYSTEMS</span><Activity size={15} /></div>
                <div className="system-row"><span className="system-icon"><Cpu size={16} /></span><div><strong>Interface engine</strong><small>REACT / WEBGL READY</small></div><span className="state-tag good">ACTIVE</span></div>
                <div className="system-row"><span className="system-icon"><Bot size={16} /></span><div><strong>AI reasoning</strong><small>SERVER CONNECTION</small></div><span className="state-tag bad">OFFLINE</span></div>
                <div className="system-row"><span className="system-icon"><Headphones size={16} /></span><div><strong>Voice input</strong><small>BROWSER DEPENDENT</small></div><span className={"state-tag " + (listening ? "good" : "neutral")}>{listening ? "LISTENING" : "READY"}</span></div>
                <div className="system-row"><span className="system-icon"><Volume2 size={16} /></span><div><strong>Voice output</strong><small>BROWSER SPEECH</small></div><span className={"state-tag " + (speaking ? "good" : "neutral")}>{speaking ? "ACTIVE" : "READY"}</span></div>
              </div>
              <div className="panel quick-panel">
                <div className="panel-heading"><span>QUICK ACTIONS</span><span className="panel-index">04</span></div>
                <button className="quick-action" onClick={() => { setMessage("Give me a system status summary."); document.getElementById("conversation")?.scrollIntoView({ behavior: "smooth" }); }}><span className="quick-icon"><Activity size={15} /></span><span><strong>System status</strong><small>Prepare a status request</small></span><span className="quick-arrow">↗</span></button>
                <button className="quick-action" onClick={() => { setShowModelTools(true); document.getElementById("avatar-workshop")?.scrollIntoView({ behavior: "smooth" }); }}><span className="quick-icon"><Sparkles size={15} /></span><span><strong>Personalize avatar</strong><small>Load a 3D face model</small></span><span className="quick-arrow">↗</span></button>
                <button className="quick-action" onClick={() => { setVoiceEnabled((v) => !v); setNotice("SPOKEN REPLIES " + (!voiceEnabled ? "ENABLED" : "DISABLED")); }}><span className="quick-icon"><Volume2 size={15} /></span><span><strong>Spoken replies</strong><small>{voiceEnabled ? "Enabled for real replies" : "Currently disabled"}</small></span><span className={"toggle " + (voiceEnabled ? "on" : "")}><i /></span></button>
              </div>
            </div>
          </section>

          <section className="lower-grid">
            <div className="panel conversation-panel" id="conversation">
              <div className="panel-heading"><span>COMMAND CHANNEL</span><span className="channel-state"><i /> ENCRYPTION NOT CONFIGURED</span></div>
              <div className="conversation-feed">
                {turns.map((turn, index) => <div className={"message-row " + turn.role} key={index}><div className="message-avatar">{turn.role === "assistant" ? <Bot size={15} /> : <span>YOU</span>}</div><div className="message-body"><div className="message-meta"><strong>{turn.role === "assistant" ? "GIDEON" : "YOU"}</strong><time>{turn.time}</time></div><p>{turn.text}</p></div></div>)}
                {thinking && <div className="message-row assistant"><div className="message-avatar"><Bot size={15} /></div><div className="message-body"><div className="message-meta"><strong>GIDEON</strong><time>NOW</time></div><p className="thinking-dots"><i /><i /><i /> Contacting service…</p></div></div>}
                <div ref={feedEnd} />
              </div>
              <form className="composer" onSubmit={sendMessage}>
                <button type="button" className={"mic-button " + (listening ? "active" : "")} onClick={toggleListening} aria-label={listening ? "Stop listening" : "Start voice input"}>{listening ? <MicOff size={18} /> : <Mic size={18} />}</button>
                <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={listening ? "Listening… speak now" : "Type a command or message…"} aria-label="Message GIDEON" />
                <button className="send-button" type="submit" disabled={!message.trim() || thinking} aria-label="Send message"><Send size={17} /></button>
              </form>
              <div className="composer-foot"><span><span className="keyboard-key">ENTER</span> SEND MESSAGE</span><span>NO MOCK AI REPLIES</span></div>
            </div>

            <div className="panel config-panel" id="settings">
              <div className="panel-heading"><span>CONFIGURATION</span><Settings2 size={15} /></div>
              <label className="field-label" htmlFor="endpoint">ASSISTANT API ENDPOINT</label>
              <input id="endpoint" className="config-input" value={apiEndpoint} onChange={(event) => setApiEndpoint(event.target.value)} />
              <p className="field-help">A server route must be implemented before real AI replies are available. Keep model keys on the server.</p>
              <div className="config-divider" />
              <div className="config-option"><div><strong>Spoken replies</strong><small>Use device speech synthesis</small></div><button className={"toggle-button " + (voiceEnabled ? "on" : "")} onClick={() => setVoiceEnabled((v) => !v)} aria-label="Toggle spoken replies"><i /></button></div>
              <div className="config-option"><div><strong>Assistant service</strong><small>Connection status</small></div><span className="state-tag bad">{service === "online" ? "RESPONDING" : "NOT CONNECTED"}</span></div>
              <div className="config-divider" />
              <div className="security-note"><ShieldCheck size={17} /><p><strong>SECURE BY DESIGN</strong><br />Provider credentials and tool permissions must be enforced server-side.</p></div>
            </div>
          </section>

          <section className={"panel avatar-workshop " + (showModelTools ? "expanded" : "")} id="avatar-workshop">
            <div className="workshop-heading"><div><div className="eyebrow"><span /> AVATAR WORKSHOP</div><h2>Make the presence <em>yours.</em></h2><p>Import an authorized, personalized 3D head model. The file stays in this browser session.</p></div><label className="upload-button">LOAD GLB MODEL<input type="file" accept=".glb,model/gltf-binary" onChange={loadModel} /></label></div>
            <div className="workshop-content"><div className="workshop-preview">{modelUrl ? <div ref={workshopModelHost} className="workshop-model-host" /> : <div className="model-placeholder"><div className="wire-head"><i /><b /><span /></div><strong>PERSONALIZED MODEL REQUIRED</strong><small>GLB FORMAT · MAXIMUM 40 MB</small></div>}</div><div className="model-details"><span className="detail-label">MODEL STATUS</span><strong>{modelUrl ? modelName : "No custom model loaded"}</strong><p>{modelUrl ? "This model is previewed locally. It has not been uploaded to a server or committed to the repository." : "The current holographic head is a visual placeholder. A photo alone cannot be rendered as a true 3D model; create or obtain a 3D model first."}</p>{modelError && <p className="error-text" role="alert">{modelError}</p>}<div className="model-meta"><span><Check size={13} /> LOCAL PREVIEW</span><span><ShieldCheck size={13} /> NO UPLOAD</span></div></div></div>
          </section>

          <footer className="footer"><span>GIDEON SI <i>•</i> DEON-SI REPOSITORY</span><span>{notice}</span><span><Monitor size={13} /> RESPONSIVE WEB EXPERIENCE</span></footer>
        </main>
      </div>
    </div>
  );
}