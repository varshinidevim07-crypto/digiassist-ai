"use client";

import { useMemo, useState } from "react";

type DocStatus = "verified" | "expired";
type DemoDocument = { id: string; name: string; issuer: string; status: DocStatus; issued: string; expires?: string };
type Requirement = { label: string; docs: string[]; kind: "required" | "optional" | "external" };
type Service = { id: string; name: string; icon: string; description: string; requirements: Requirement[] };

const documents: DemoDocument[] = [
  { id: "aadhaar", name: "Aadhaar Card", issuer: "UIDAI", status: "verified", issued: "12 Jun 2022" },
  { id: "pan", name: "PAN Card", issuer: "Income Tax Department", status: "verified", issued: "04 Feb 2023" },
  { id: "class10", name: "Class 10 Marksheet", issuer: "Karnataka Board", status: "verified", issued: "18 May 2021" },
  { id: "class10pass", name: "Class 10 Passing Certificate", issuer: "Karnataka Board", status: "verified", issued: "18 May 2021" },
  { id: "class12", name: "Class 12 Marksheet", issuer: "Karnataka Board", status: "verified", issued: "21 Apr 2023" },
  { id: "semester", name: "Semester Marksheet", issuer: "DSATM", status: "verified", issued: "09 Jul 2026" },
  { id: "caste", name: "Caste Certificate", issuer: "Government of Karnataka", status: "verified", issued: "15 Aug 2024" },
  { id: "income", name: "Income Certificate", issuer: "Revenue Department", status: "expired", issued: "11 Mar 2024", expires: "10 Mar 2025" },
  { id: "domicile", name: "Domicile Certificate", issuer: "Government of Karnataka", status: "verified", issued: "03 Sep 2024" },
  { id: "driving", name: "Driving Licence", issuer: "MoRTH", status: "verified", issued: "28 Jan 2025", expires: "27 Jan 2045" },
];

const baseIdentity: Requirement[] = [
  { label: "Identity proof", docs: ["aadhaar", "pan", "driving"], kind: "required" },
  { label: "Address proof", docs: ["aadhaar", "driving", "domicile"], kind: "required" },
];

const services: Service[] = [
  { id: "passport", name: "Passport", icon: "✈", description: "Fresh or reissue document check", requirements: [...baseIdentity, { label: "Date of birth proof", docs: ["class10", "class10pass"], kind: "required" }, { label: "PAN card", docs: ["pan"], kind: "optional" }, { label: "Photograph", docs: [], kind: "external" }] },
  { id: "scholarship", name: "Scholarship", icon: "◈", description: "National and state schemes", requirements: [{ label: "Aadhaar", docs: ["aadhaar"], kind: "required" }, { label: "Previous marksheet", docs: ["class12", "semester"], kind: "required" }, { label: "Income certificate", docs: ["income"], kind: "required" }, { label: "Category certificate", docs: ["caste"], kind: "optional" }, { label: "Domicile certificate", docs: ["domicile"], kind: "optional" }, { label: "Admission proof", docs: [], kind: "external" }, { label: "Bank details", docs: [], kind: "external" }] },
  { id: "bank", name: "Bank Account", icon: "▦", description: "KYC readiness check", requirements: [...baseIdentity, { label: "PAN card", docs: ["pan"], kind: "required" }, { label: "Photograph", docs: [], kind: "external" }] },
  { id: "visa", name: "Visa", icon: "◎", description: "Travel document preparation", requirements: [{ label: "Passport", docs: [], kind: "required" }, ...baseIdentity, { label: "Education proof", docs: ["class12", "semester"], kind: "optional" }, { label: "Financial statements", docs: [], kind: "external" }] },
  { id: "college", name: "College Admission", icon: "▰", description: "Admission document pack", requirements: [{ label: "Identity proof", docs: ["aadhaar"], kind: "required" }, { label: "Class 10 marksheet", docs: ["class10"], kind: "required" }, { label: "Class 12 marksheet", docs: ["class12"], kind: "required" }, { label: "Category certificate", docs: ["caste"], kind: "optional" }, { label: "Transfer certificate", docs: [], kind: "external" }] },
  { id: "education-loan", name: "Education Loan", icon: "₹", description: "Loan documentation check", requirements: [{ label: "Aadhaar", docs: ["aadhaar"], kind: "required" }, { label: "PAN", docs: ["pan"], kind: "required" }, { label: "Academic records", docs: ["class12", "semester"], kind: "required" }, { label: "Admission letter", docs: [], kind: "external" }, { label: "Income evidence", docs: ["income"], kind: "required" }] },
  { id: "pan-service", name: "PAN Service", icon: "#", description: "New PAN or correction", requirements: [{ label: "Aadhaar", docs: ["aadhaar"], kind: "required" }, { label: "Date of birth proof", docs: ["class10", "class10pass"], kind: "required" }, { label: "Photograph and signature", docs: [], kind: "external" }] },
  { id: "voter", name: "Voter ID", icon: "✓", description: "Registration or correction", requirements: [{ label: "Identity proof", docs: ["aadhaar"], kind: "required" }, { label: "Age proof", docs: ["class10", "class10pass"], kind: "required" }, { label: "Address proof", docs: ["aadhaar", "domicile", "driving"], kind: "required" }, { label: "Photograph", docs: [], kind: "external" }] },
  { id: "licence", name: "Driving Licence", icon: "▣", description: "Learner or permanent licence", requirements: [{ label: "Age proof", docs: ["class10", "class10pass"], kind: "required" }, ...baseIdentity, { label: "Medical form", docs: [], kind: "external" }] },
  { id: "government-job", name: "Government Job", icon: "⌂", description: "Recruitment document check", requirements: [{ label: "Identity proof", docs: ["aadhaar"], kind: "required" }, { label: "Education certificates", docs: ["class10", "class12", "semester"], kind: "required" }, { label: "Category certificate", docs: ["caste"], kind: "optional" }, { label: "Photograph and signature", docs: [], kind: "external" }] },
  { id: "certificates", name: "Govt. Certificates", icon: "◇", description: "Income, caste and domicile", requirements: [{ label: "Identity proof", docs: ["aadhaar"], kind: "required" }, { label: "Residence proof", docs: ["domicile", "aadhaar"], kind: "required" }, { label: "Supporting declaration", docs: [], kind: "external" }] },
  { id: "health", name: "Health Scheme", icon: "+", description: "Public health benefit check", requirements: [{ label: "Aadhaar", docs: ["aadhaar"], kind: "required" }, { label: "Income eligibility", docs: ["income"], kind: "required" }, { label: "Category proof", docs: ["caste"], kind: "optional" }, { label: "Medical records", docs: [], kind: "external" }] },
  { id: "vehicle", name: "Vehicle Service", icon: "◉", description: "Registration and transfer", requirements: [{ label: "Identity proof", docs: ["aadhaar", "driving"], kind: "required" }, { label: "Driving licence", docs: ["driving"], kind: "required" }, { label: "Vehicle RC", docs: [], kind: "required" }, { label: "Insurance and PUC", docs: [], kind: "external" }] },
  { id: "pension", name: "Pension", icon: "∞", description: "Pension and benefits", requirements: [{ label: "Identity proof", docs: ["aadhaar"], kind: "required" }, { label: "Age proof", docs: ["class10", "class10pass"], kind: "required" }, { label: "Income certificate", docs: ["income"], kind: "optional" }, { label: "Bank details", docs: [], kind: "external" }] },
];

function getResult(req: Requirement) {
  const found = documents.find((doc) => req.docs.includes(doc.id));
  if (found?.status === "verified") return { state: "ready", title: "Ready", detail: found.name };
  if (found?.status === "expired") return { state: "expired", title: "Renew", detail: `${found.name} expired` };
  if (req.kind === "optional") return { state: "fine", title: "Optional", detail: "Missing, but that is fine" };
  if (req.kind === "external") return { state: "upload", title: "Upload", detail: "Provide separately" };
  return { state: "missing", title: "Required", detail: "Not found in DigiLocker" };
}

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [active, setActive] = useState<Service | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"assistant" | "documents">("assistant");
  const filtered = services.filter((s) => `${s.name} ${s.description}`.toLowerCase().includes(query.toLowerCase()));
  const analysis = useMemo(() => active?.requirements.map((req) => ({ req, result: getResult(req) })) ?? [], [active]);
  const required = analysis.filter(({ req }) => req.kind === "required");
  const readyRequired = required.filter(({ result }) => result.state === "ready").length;
  const score = required.length ? Math.round((readyRequired / required.length) * 100) : 0;
  function connect() { setConnecting(true); window.setTimeout(() => { setConnecting(false); setConnected(true); }, 1800); }

  if (!connected) return <main className="welcome-shell"><nav className="welcome-nav"><div className="brand"><span className="brand-mark">D</span><span>DigiAssist <b>AI</b></span></div><span className="demo-pill">Hackathon prototype</span></nav><section className="welcome-grid"><div className="welcome-copy"><p className="eyebrow">DOCUMENT INTELLIGENCE, SIMPLIFIED</p><h1>Know what you have.<br/><span>Know what you need.</span></h1><p className="lead">Connect your demo DigiLocker and instantly discover which applications you’re ready for—with intelligent alternatives and clear next steps.</p><button className="primary-button" onClick={connect} disabled={connecting}>{connecting ? <><span className="spinner"/> Connecting securely…</> : <>Connect DigiLocker <span>→</span></>}</button><p className="safety-note"><span>✓</span> Simulated connection. No real personal data is accessed.</p></div><div className="locker-visual"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="locker-card"><div className="locker-top"><span className="mini-mark">D</span><span>Digital Document Locker</span><i>•••</i></div><div className="shield">✓</div><h3>Your documents, ready when you are.</h3><div className="mini-docs"><span>Aadhaar</span><span>Marksheet</span><span>Licence</span></div><div className="secure-line"><span>10 demo documents</span><b>Verified</b></div></div></div></section><footer className="welcome-footer"><span>Consent-first sharing</span><span>•</span><span>Verified document checks</span><span>•</span><span>Smart alternatives</span></footer></main>;

  return <main className="app-shell"><aside className="sidebar"><div className="brand inverse"><span className="brand-mark">D</span><span>DigiAssist <b>AI</b></span></div><div className="profile"><div className="avatar">VD</div><div><strong>Varshini Devi</strong><span><i/> DigiLocker connected</span></div></div><nav className="side-nav"><button className={tab === "assistant" ? "active" : ""} onClick={() => {setTab("assistant");setActive(null)}}><span>✦</span> Assistant</button><button className={tab === "documents" ? "active" : ""} onClick={() => {setTab("documents");setActive(null)}}><span>▤</span> My Documents <em>{documents.length}</em></button></nav><div className="side-bottom"><p><span>✓</span> Demo connection</p><small>No real data is accessed</small></div></aside><section className="workspace"><header className="topbar"><div/><div className="connected-badge"><i/> Connected securely</div></header>
  {tab === "documents" ? <div className="content"><div className="page-heading"><p className="eyebrow">DEMO DIGILOCKER</p><h2>My issued documents</h2><p>Ten fictional records used to demonstrate document intelligence.</p></div><div className="document-grid">{documents.map((doc) => <article className="document-card" key={doc.id}><div className="doc-icon">▤</div><div className="doc-main"><h3>{doc.name}</h3><p>{doc.issuer}</p><small>Issued {doc.issued}{doc.expires ? ` · Expires ${doc.expires}` : ""}</small></div><span className={`status ${doc.status}`}>{doc.status === "verified" ? "✓ Verified" : "! Expired"}</span></article>)}</div></div> : active ? <div className="content analysis-page"><button className="back-button" onClick={() => setActive(null)}>← All services</button><div className="analysis-header"><div><p className="eyebrow">READINESS ANALYSIS</p><h2>{active.name}</h2><p>We compared this application with your demo DigiLocker.</p></div><div className="score-ring" style={{"--score":`${score * 3.6}deg`} as React.CSSProperties}><div><strong>{score}%</strong><span>ready</span></div></div></div><div className="result-summary"><span className="summary-icon">✦</span><div><h3>{score === 100 ? "You’re ready to continue." : "You’re closer than you think."}</h3><p>{readyRequired} of {required.length} mandatory requirements are ready. Optional missing items are okay, while external documents can be uploaded separately.</p></div><button>Create document pack</button></div><div className="requirements"><div className="requirements-title"><h3>Document checklist</h3><span>{analysis.length} requirements</span></div>{analysis.map(({req,result}) => <div className="requirement-row" key={req.label}><div className={`result-dot ${result.state}`}>{result.state === "ready" ? "✓" : result.state === "expired" ? "!" : result.state === "fine" ? "○" : "+"}</div><div className="requirement-copy"><strong>{req.label}</strong><span>{result.detail}</span></div><span className={`result-tag ${result.state}`}>{result.title}</span></div>)}</div><div className="help-card"><span>i</span><p><strong>Not everything must come from DigiLocker.</strong><br/>We separate verified documents, accepted alternatives, optional items and files you can provide separately.</p></div></div> : <div className="content"><div className="assistant-hero"><p className="eyebrow">GOOD AFTERNOON</p><h2>How may I assist you?</h2><p>Tell me what you want to apply for, and I’ll check your documents.</p><div className="search-box"><span>✦</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Try ‘I want to apply for a scholarship’"/><button onClick={() => filtered[0] && setActive(filtered[0])}>→</button></div></div><div className="section-title"><div><h3>Popular services</h3><p>Select a service to check your readiness</p></div><span>{filtered.length} available</span></div><div className="service-grid">{filtered.map((s) => <button className="service-card" key={s.id} onClick={() => setActive(s)}><span className="service-icon">{s.icon}</span><div><h3>{s.name}</h3><p>{s.description}</p></div><span className="arrow">→</span></button>)}</div></div>}
  </section></main>;
}
