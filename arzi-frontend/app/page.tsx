"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [killMessage, setKillMessage] = useState("");
  const [cases, setCases] = useState<any[]>([]);
  const [counts, setCounts] = useState({ inbox: 0, approved: 0, at_risk: 0, total: 0 });
  const [runLogs, setRunLogs] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState<"en" | "hi">("en");

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authRole, setAuthRole] = useState<"law_firm" | "admin">("law_firm");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");

  // Login inputs
  const [authId, setAuthId] = useState("lawyer@arzi.internal");
  const [authPin, setAuthPin] = useState("arzi2024");
  const [showPassword, setShowPassword] = useState(false);

  // Register inputs
  const [regName, setRegName] = useState("");
  const [regId, setRegId] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regPinConfirm, setRegPinConfirm] = useState("");
  const [regToken, setRegToken] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [dept, setDept] = useState("");
  const [grievance, setGrievance] = useState("");
  const [refNo, setRefNo] = useState("");
  const [subDate, setSubDate] = useState("");

  const API_BASE = "http://localhost:5000/api/v1";

  const t = (enText: string, hiText: string) => (lang === "hi" ? hiText : enText);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("arzi_user_session");
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.role) {
          setIsAuthenticated(true);
          setSessionUser(s);
          setActiveTab("home");
        }
      }
    } catch (e) {}
    fetchQueue(searchQuery);
    fetchRunLogs();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const enteredId = authId.trim().toLowerCase();
    const enteredPass = authPin.trim();

    const defaultLaw = [
      { id: "lawyer@arzi.internal", pass: "arzi2024", name: "Chambers of Adv. S. Kalra" },
      { id: "d/1420/2018", pass: "arzi2024", name: "Adv. Shivanshu Pandey" }
    ];
    const defaultAdmin = [
      { id: "admin@arzi.internal", pass: "arzi-root-key", name: "Lead Systems Engineer" },
      { id: "admin", pass: "admin123", name: "Root Administrator" }
    ];

    let registered: any[] = [];
    try {
      const rawReg = localStorage.getItem("arzi_registered_accounts");
      if (rawReg) {
        const parsed = JSON.parse(rawReg);
        registered = parsed[authRole] || [];
      }
    } catch (e) {}

    const pool = authRole === "law_firm" ? [...defaultLaw, ...registered] : [...defaultAdmin, ...registered];
    const match = pool.find(
      (a: any) =>
        (a.id?.toLowerCase() === enteredId || a.barId?.toLowerCase() === enteredId) &&
        a.pass === enteredPass
    );

    if (match) {
      const s = {
        role: authRole,
        user: match.id,
        name: match.name || (authRole === "admin" ? "Developer Admin" : "Advocate Counsel"),
        loginTime: new Date().toISOString()
      };
      localStorage.setItem("arzi_user_session", JSON.stringify(s));
      setIsAuthenticated(true);
      setSessionUser(s);
      setActiveTab("home");
    } else {
      setAuthError(
        lang === "hi"
          ? `अमान्य क्रेडेंशियल्स! कृपया सही आईडी और पासवर्ड दर्ज करें अथवा नया खाता पंजीकृत करें।`
          : `Invalid ${authRole === "admin" ? "Admin" : "Law Firm"} ID or password. Please verify or register.`
      );
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (regPin.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (regPin !== regPinConfirm) {
      setAuthError("Passwords do not match.");
      return;
    }

    if (authRole === "admin") {
      if (regToken.trim() !== "arzi-root-key" && regToken.trim() !== "admin2026") {
        setAuthError("Invalid Master Authorization Token. Use 'arzi-root-key'.");
        return;
      }
    }

    const newAcc = {
      id: regEmail.trim(),
      barId: regId.trim(),
      pass: regPin.trim(),
      name: regName.trim(),
      role: authRole
    };

    try {
      let currentReg: any = { law_firm: [], admin: [] };
      const rawReg = localStorage.getItem("arzi_registered_accounts");
      if (rawReg) currentReg = JSON.parse(rawReg);
      if (!currentReg[authRole]) currentReg[authRole] = [];
      currentReg[authRole].push(newAcc);
      localStorage.setItem("arzi_registered_accounts", JSON.stringify(currentReg));
    } catch (e) {}

    const s = {
      role: authRole,
      user: newAcc.id,
      name: newAcc.name,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem("arzi_user_session", JSON.stringify(s));
    setIsAuthenticated(true);
    setSessionUser(s);
    setActiveTab("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("arzi_user_session");
    setIsAuthenticated(false);
    setSessionUser(null);
    setAuthError("");
  };

  const fetchQueue = async (query = "") => {
    try {
      let url = `${API_BASE}/cases`;
      if (query.trim()) {
        url += `?search=${encodeURIComponent(query.trim())}`;
      }
      const res = await fetch(url);
      if (res.status === 503) {
        setKillSwitchActive(true);
        setKillMessage("GitHub Repository deletion detected (HTTP 503). Core repository binding revoked.");
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setCases(data.cases || []);
        setCounts(data.counts || { inbox: 0, approved: 0, at_risk: 0, total: 0 });
        if (!selectedCase && data.cases && data.cases.length > 0) {
          setSelectedCase(data.cases[0]);
        }
      }
    } catch (e) {
      console.log("Flask backend offline or starting...");
    }
  };

  const fetchRunLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/run-log`);
      const data = await res.json();
      if (res.ok) {
        setRunLogs(data.run_logs || []);
      }
    } catch (e) {}
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQueue(searchQuery);
  };

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/cases/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complainant: { name, contact, address, language: "Hindi / English" },
          raw_grievance: grievance,
          department: dept,
          application_ref_no: refNo,
          original_submission_date: subDate
        })
      });

      if (res.status === 503) {
        setKillSwitchActive(true);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        alert(`Case Created with Unique ID: ${data.case.case_id}\nAssigned PIO: ${data.case.suggested_pio.pio_name} (${data.case.suggested_pio.office_address})`);
        setName("");
        setContact("");
        setAddress("");
        setGrievance("");
        setDept("");
        setRefNo("");
        setSubDate("");
        setSelectedCase(data.case);
        setActiveTab("workspace");
        fetchQueue();
      }
    } catch (err) {
      alert("Error connecting to Flask backend.");
    }
  };

  const openCaseDetails = (c: any) => {
    setSelectedCase(c);
    setActiveTab("workspace");
  };

  const toggleKillSwitchSim = async (simulate: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/system/kill-switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulate_deleted: simulate })
      });
      const data = await res.json();
      if (simulate) {
        setKillSwitchActive(true);
        setKillMessage(data.repository_validation.status_message);
      } else {
        setKillSwitchActive(false);
        fetchQueue();
      }
    } catch (e) {}
  };

  return (
    <div className="container-responsive">
      {killSwitchActive && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(30,36,43,0.95)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            background: "#FFF", border: "4px solid #D94E28", boxShadow: "8px 8px 0 #000",
            maxWidth: "600px", padding: "36px", textAlign: "center"
          }}>
            <div style={{ background: "#D94E28", color: "#FFF", padding: "4px 12px", fontFamily: "monospace" }}>
              CRITICAL SYSTEM INTEGRITY BREACH
            </div>
            <h1 style={{ margin: "16px 0" }}>CORE REPOSITORY BINDING REVOKED</h1>
            <p>{killMessage}</p>
            <button 
              onClick={() => toggleKillSwitchSim(false)}
              style={{
                marginTop: "20px", background: "#D94E28", color: "#FFF",
                padding: "12px 24px", border: "2px solid #1E242B", cursor: "pointer", fontWeight: "bold"
              }}
            >
              RESTORE SYSTEM INTEGRITY
            </button>
          </div>
        </div>
      )}

      {/* Pre-login Gate: When not authenticated, ONLY show Login & Registration Portal */}
      {!isAuthenticated ? (
        <div style={{ maxWidth: "680px", margin: "40px auto", background: "#FFF", border: "3px solid #1E242B", boxShadow: "8px 8px 0 #1E242B", padding: "32px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ display: "inline-block", background: "#D94E28", color: "#FFF", fontWeight: "bold", fontSize: "28px", padding: "8px 20px", border: "2px solid #1E242B", marginBottom: "12px" }}>
              ARZI
            </div>
            <h1 style={{ fontSize: "22px", margin: "8px 0 4px 0" }}>
              {t("Statutory Legal Intelligence Desk", "नागरिक विधिक सहायता एवं आरटीआई मंच")}
            </h1>
            <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
              {t("Select institutional role to sign in or register. Navigation tabs will unlock upon verification.", "लॉगिन अथवा पंजीकरण हेतु विधिक भूमिका चुनें। प्रमाणीकरण के पश्चात मुख्य पृष्ठ व अन्य सभी टैब उपलब्ध होंगे।")}
            </p>
          </div>

          {authError && (
            <div style={{ background: "#FEE2E2", border: "2px solid #EF4444", color: "#991B1B", padding: "10px 14px", fontWeight: "bold", fontSize: "13px", marginBottom: "16px" }}>
              ⚠️ {authError}
            </div>
          )}

          {/* Role selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            <button
              type="button"
              onClick={() => { setAuthRole("law_firm"); setAuthError(""); setAuthId("lawyer@arzi.internal"); setAuthPin("arzi2024"); }}
              style={{
                padding: "12px", border: "2px solid #1E242B", fontWeight: "bold", cursor: "pointer",
                background: authRole === "law_firm" ? "#1E242B" : "#FFF",
                color: authRole === "law_firm" ? "#FFF" : "#1E242B",
                boxShadow: authRole === "law_firm" ? "4px 4px 0 #D94E28" : "none"
              }}
            >
              ⚖️ {t("Law Firm Desk", "अधिवक्ता डेस्क")}
            </button>
            <button
              type="button"
              onClick={() => { setAuthRole("admin"); setAuthError(""); setAuthId("admin@arzi.internal"); setAuthPin("arzi-root-key"); }}
              style={{
                padding: "12px", border: "2px solid #1E242B", fontWeight: "bold", cursor: "pointer",
                background: authRole === "admin" ? "#1E242B" : "#FFF",
                color: authRole === "admin" ? "#FFF" : "#1E242B",
                boxShadow: authRole === "admin" ? "4px 4px 0 #D94E28" : "none"
              }}
            >
              🛠️ {t("Developer Admin", "सिस्टम एडमिन")}
            </button>
          </div>

          {/* Mode toggle (Sign In vs Register) */}
          <div style={{ display: "flex", border: "2px solid #1E242B", marginBottom: "20px" }}>
            <button
              type="button"
              onClick={() => { setAuthMode("login"); setAuthError(""); }}
              style={{
                flex: 1, padding: "8px", fontWeight: "bold", border: "none", cursor: "pointer",
                background: authMode === "login" ? "#D94E28" : "#FFF",
                color: authMode === "login" ? "#FFF" : "#1E242B"
              }}
            >
              {t("Sign In", "लॉगिन")}
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("register"); setAuthError(""); }}
              style={{
                flex: 1, padding: "8px", fontWeight: "bold", border: "none", borderLeft: "2px solid #1E242B", cursor: "pointer",
                background: authMode === "register" ? "#D94E28" : "#FFF",
                color: authMode === "register" ? "#FFF" : "#1E242B"
              }}
            >
              {t("Register New Account", "नया खाता पंजीकृत करें")}
            </button>
          </div>

          {authMode === "login" ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontWeight: "bold", fontSize: "12px", fontFamily: "monospace", marginBottom: "4px" }}>
                  {authRole === "admin" ? t("ADMIN USERNAME / ID *", "एडमिन यूजरनेम *") : t("LAWYER BAR ID / EMAIL *", "बार आईडी या ईमेल *")}
                </label>
                <input
                  type="text"
                  required
                  value={authId}
                  onChange={e => setAuthId(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "2px solid #1E242B", fontSize: "14px" }}
                  placeholder={authRole === "admin" ? "admin@arzi.internal" : "lawyer@arzi.internal or D/1420/2018"}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontWeight: "bold", fontSize: "12px", fontFamily: "monospace", marginBottom: "4px" }}>
                  {authRole === "admin" ? t("MASTER SECURITY TOKEN / PASSWORD *", "मास्टर सुरक्षा पासवर्ड *") : t("ACCESS PIN / PASSWORD *", "पासवर्ड *")}
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={authPin}
                    onChange={e => setAuthPin(e.target.value)}
                    style={{ width: "100%", padding: "10px", paddingRight: "40px", border: "2px solid #1E242B", fontSize: "14px" }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "8px", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Quick default hints */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", fontSize: "11px" }}>
                <span style={{ color: "#666" }}>{t("Quick Fill:", "त्वरित चयन:")}</span>
                {authRole === "law_firm" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => { setAuthId("lawyer@arzi.internal"); setAuthPin("arzi2024"); }}
                      style={{ background: "#F3F4F6", border: "1px solid #1E242B", padding: "2px 8px", cursor: "pointer", fontFamily: "monospace" }}
                    >
                      lawyer@arzi.internal / arzi2024
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthId("D/1420/2018"); setAuthPin("arzi2024"); }}
                      style={{ background: "#F3F4F6", border: "1px solid #1E242B", padding: "2px 8px", cursor: "pointer", fontFamily: "monospace" }}
                    >
                      D/1420/2018 / arzi2024
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { setAuthId("admin@arzi.internal"); setAuthPin("arzi-root-key"); }}
                      style={{ background: "#F3F4F6", border: "1px solid #1E242B", padding: "2px 8px", cursor: "pointer", fontFamily: "monospace" }}
                    >
                      admin@arzi.internal / arzi-root-key
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthId("admin"); setAuthPin("admin123"); }}
                      style={{ background: "#F3F4F6", border: "1px solid #1E242B", padding: "2px 8px", cursor: "pointer", fontFamily: "monospace" }}
                    >
                      admin / admin123
                    </button>
                  </>
                )}
              </div>

              <button
                type="submit"
                style={{
                  width: "100%", padding: "12px", background: "#1E242B", color: "#FFF",
                  fontWeight: "bold", border: "2px solid #1E242B", cursor: "pointer", fontSize: "14px"
                }}
              >
                {authRole === "admin" ? t("Sign In as Administrator", "एडमिन के रूप में लॉगिन करें") : t("Sign In to Law Firm Desk", "अधिवक्ता डेस्क में प्रवेश करें")}
              </button>

              <div style={{ textAlign: "center", marginTop: "14px", fontSize: "12px", color: "#666" }}>
                {t("Don't have an account?", "खाता नहीं है?")}{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  style={{ background: "none", border: "none", color: "#D94E28", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
                >
                  {t("Register here", "यहाँ पंजीकरण करें")}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontWeight: "bold", fontSize: "12px", fontFamily: "monospace", marginBottom: "4px" }}>
                  {authRole === "admin" ? t("ADMIN FULL NAME *", "पूरा नाम *") : t("CHAMBER / FIRM NAME *", "फर्म / चैंबर का नाम *")}
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "2px solid #1E242B" }}
                  placeholder={authRole === "admin" ? "Lead Systems Engineer" : "Chambers of Adv. Kalra"}
                />
              </div>

              {authRole === "law_firm" && (
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: "bold", fontSize: "12px", fontFamily: "monospace", marginBottom: "4px" }}>
                    {t("BAR COUNCIL REG NO / ADVOCATE ID *", "बार काउंसिल पंजीकरण संख्या *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={regId}
                    onChange={e => setRegId(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "2px solid #1E242B" }}
                    placeholder="e.g. D/2026/104"
                  />
                </div>
              )}

              {authRole === "admin" && (
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: "bold", fontSize: "12px", fontFamily: "monospace", marginBottom: "4px" }}>
                    {t("MASTER AUTHORIZATION TOKEN (Required) *", "मास्टर ऑथराइजेशन टोकन (अनिवार्य) *")}
                  </label>
                  <input
                    type="password"
                    required
                    value={regToken}
                    onChange={e => setRegToken(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "2px solid #1E242B" }}
                    placeholder="Enter arzi-root-key"
                  />
                  <span style={{ fontSize: "11px", color: "#666" }}>Hint: Use <code>arzi-root-key</code></span>
                </div>
              )}

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontWeight: "bold", fontSize: "12px", fontFamily: "monospace", marginBottom: "4px" }}>
                  {t("OFFICIAL EMAIL / LOGIN ID *", "ईमेल / लॉगिन आईडी *")}
                </label>
                <input
                  type="text"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "2px solid #1E242B" }}
                  placeholder={authRole === "admin" ? "admin@arzi.internal" : "advocate@delhibar.org"}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", fontSize: "12px", fontFamily: "monospace", marginBottom: "4px" }}>
                    {t("CREATE PASSWORD *", "पासवर्ड बनाएं *")}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPin}
                    onChange={e => setRegPin(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "2px solid #1E242B" }}
                    placeholder="Min 6 chars"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", fontSize: "12px", fontFamily: "monospace", marginBottom: "4px" }}>
                    {t("CONFIRM PASSWORD *", "पुष्टि करें *")}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPinConfirm}
                    onChange={e => setRegPinConfirm(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "2px solid #1E242B" }}
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%", padding: "12px", background: "#D94E28", color: "#FFF",
                  fontWeight: "bold", border: "2px solid #1E242B", cursor: "pointer", fontSize: "14px"
                }}
              >
                {t("Complete Registration & Enter Desk", "पंजीकरण पूर्ण करें व डैशबोर्ड में प्रवेश करें")}
              </button>

              <div style={{ textAlign: "center", marginTop: "14px", fontSize: "12px", color: "#666" }}>
                {t("Already registered?", "पहले से पंजीकृत हैं?")}{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  style={{ background: "none", border: "none", color: "#1E242B", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
                >
                  {t("Sign in here", "यहाँ लॉगिन करें")}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <>
          {/* Header (Visible once logged in) */}
          <header className="header-responsive" style={{
            background: "#FFF", border: "2px solid #1E242B", boxShadow: "4px 4px 0 #1E242B",
            padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                onClick={() => setActiveTab("home")}
                style={{ background: "#D94E28", color: "#FFF", fontWeight: "bold", fontSize: "24px", padding: "6px 16px", border: "2px solid #1E242B", cursor: "pointer" }}
              >
                {t("ARZI", "अर्जी")}
              </div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "18px" }}>{t("CIVIC RTI LEGAL FILING DESK", "नागरिक आरटीआई विधिक सहायता डेस्क")}</div>
                <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#555" }}>{t("Flask Engine + Banaras / Varanasi Multi-Domain Routing", "फ्लास्क इंजन + वाराणसी एवं अखिल भारतीय अधिकारी मैपिंग")}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {/* User Session Badge */}
              <div style={{ background: "#EFF6FF", border: "2px solid #1E242B", padding: "4px 10px", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", display: "inline-block" }}></span>
                <span>{sessionUser?.name || sessionUser?.user || "Authenticated User"}</span>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                style={{ background: "#FFF", border: "2px solid #1E242B", padding: "6px 12px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
              >
                {t("Sign Out", "लॉग आउट")}
              </button>

              {/* Language Switcher */}
              <div style={{ display: "inline-flex", border: "2px solid #1E242B" }}>
                <button
                  onClick={() => setLang("en")}
                  style={{
                    padding: "6px 12px", fontWeight: "bold", border: "none", cursor: "pointer",
                    background: lang === "en" ? "#1E242B" : "#FFF", color: lang === "en" ? "#FFF" : "#1E242B"
                  }}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang("hi")}
                  style={{
                    padding: "6px 12px", fontWeight: "bold", border: "none", cursor: "pointer",
                    background: lang === "hi" ? "#1E242B" : "#FFF", color: lang === "hi" ? "#FFF" : "#1E242B"
                  }}
                >
                  हिंदी
                </button>
              </div>

              <button 
                onClick={() => toggleKillSwitchSim(true)}
                style={{ background: "#FFF", border: "2px solid #1E242B", padding: "6px 12px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}
              >
                {t("SIMULATE BREACH", "सिमुलेशन")}
              </button>
            </div>
          </header>

          {/* Navigation Tabs (Unlocked Post-Login) */}
          <nav className="nav-responsive" style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            {[
              { id: "home", en: "00. HOME OVERVIEW", hi: "00. मुख्य पृष्ठ" },
              { id: "intake", en: "01. INTAKE PORTAL", hi: "01. शिकायत पोर्टल" },
              { id: "queue", en: `02. COMMAND CENTER (${counts.inbox})`, hi: `02. सक्रिय मामले (${counts.inbox})` },
              { id: "workspace", en: `03. LEGAL WORKSPACE (${selectedCase ? selectedCase.case_id : 'SELECT'})`, hi: `03. केस विवरण (${selectedCase ? selectedCase.case_id : 'चुनें'})` },
              { id: "runlog", en: "04. PROOF RUN LOG", hi: "04. ऑडिट रन लॉग" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 16px", fontWeight: "bold", border: "2px solid #1E242B",
                  background: activeTab === tab.id ? "#1E242B" : "#FFF",
                  color: activeTab === tab.id ? "#FFF" : "#1E242B",
                  boxShadow: activeTab === tab.id ? "4px 4px 0 #D94E28" : "2px 2px 0 #1E242B",
                  cursor: "pointer", fontSize: "12px"
                }}
              >
                {lang === "hi" ? tab.hi : tab.en}
              </button>
            ))}
          </nav>

          {/* Home Tab Overview */}
          {activeTab === "home" && (
            <div style={{ background: "#FFF", border: "2px solid #1E242B", boxShadow: "4px 4px 0 #1E242B", padding: "32px", marginBottom: "24px" }}>
              <div style={{ display: "inline-block", background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "4px 12px", fontSize: "12px", fontWeight: "bold", color: "#1E3A8A", marginBottom: "12px" }}>
                🏛️ {t("AUTONOMOUS CIVIC RTI DESK", "स्वचालित नागरिक आरटीआई एवं विधिक सहायता")}
              </div>
              <h1 style={{ fontSize: "28px", margin: "0 0 12px 0" }}>
                {t("Democratizing Indian Public Law", "जन-कानून का सरलीकरण")} • <span style={{ color: "#D94E28" }}>{t("Autonomous Statutory Intelligence", "सटीक विधिक प्रणाली")}</span>
              </h1>
              <p style={{ fontSize: "15px", color: "#4A5568", maxWidth: "800px", lineHeight: "1.6", marginBottom: "24px" }}>
                {t(
                  "Transform citizen grievances into enforceable RTI applications & First Appeals. Automatically map IPC 1860 to Bharatiya Nyaya Sanhita (BNS 2023), discover your designated Public Information Officer, and enforce statutory deadlines.",
                  "अपनी नागरिक समस्याओं को कानूनी रूप से मान्य आरटीआई व प्रथम अपील में बदलें। बीएनएस 2023 की धाराएं जांचें, संबंधित जन सूचना अधिकारी (PIO) खोजें और 30 दिन में समाधान पाएं।"
                )}
              </p>

              {/* Metrics strip */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                <div style={{ border: "2px solid #1E242B", padding: "16px", background: "#F8FAFC" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#64748B" }}>{t("Active Cases", "सक्रिय मामले")}</div>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1E242B" }}>{counts.inbox}</div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>{t("Pending Review", "समीक्षाधीन")}</div>
                </div>
                <div style={{ border: "2px solid #1E242B", padding: "16px", background: "#F8FAFC" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#64748B" }}>{t("Avg PIO Distance", "औसत दूरी")}</div>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1E3A8A" }}>1.2 km</div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>{t("Geodesic Proximity", "निकटतम अधिकारी")}</div>
                </div>
                <div style={{ border: "2px solid #1E242B", padding: "16px", background: "#F8FAFC" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#64748B" }}>{t("Sec 20 Penalty", "धारा 20 जुर्माना")}</div>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#D94E28" }}>₹28,750+</div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>{t("₹250/Day Mandatory", "₹250 प्रतिदिन")}</div>
                </div>
                <div style={{ border: "2px solid #1E242B", padding: "16px", background: "#F8FAFC" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#64748B" }}>{t("Total Dockets", "कुल मामले")}</div>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1E242B" }}>{counts.total}</div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>{t("Recorded Grievances", "दर्ज मामले")}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setActiveTab("intake")}
                  style={{ background: "#D94E28", color: "#FFF", border: "2px solid #1E242B", padding: "12px 24px", fontWeight: "bold", cursor: "pointer" }}
                >
                  📝 {t("File Citizen Grievance (Intake)", "शिकायत दर्ज करें")}
                </button>
                <button
                  onClick={() => setActiveTab("queue")}
                  style={{ background: "#FFF", color: "#1E242B", border: "2px solid #1E242B", padding: "12px 24px", fontWeight: "bold", cursor: "pointer" }}
                >
                  📂 {t("View Active Cases (Command Center)", "सक्रिय मामले देखें")}
                </button>
                <button
                  onClick={() => setActiveTab("runlog")}
                  style={{ background: "#FFF", color: "#1E242B", border: "2px solid #1E242B", padding: "12px 24px", fontWeight: "bold", cursor: "pointer" }}
                >
                  📜 {t("Audit Run Log", "ऑडिट रन लॉग")}
                </button>
              </div>
            </div>
          )}

      {/* Content */}
      {activeTab === "intake" && (
        <div style={{ background: "#FFF", border: "2px solid #1E242B", boxShadow: "4px 4px 0 #1E242B", padding: "24px" }}>
          <h2 style={{ marginBottom: "16px" }}>INGEST CITIZEN GRIEVANCE</h2>
          <form onSubmit={handleIntakeSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontFamily: "monospace", fontWeight: "bold" }}>COMPLAINANT NAME *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: "100%", padding: "10px", border: "2px solid #1E242B" }} placeholder="e.g. Shivanshu Pandey" />
            </div>

            <div className="grid-2col-responsive">
              <div>
                <label style={{ display: "block", fontFamily: "monospace", fontWeight: "bold" }}>PHONE / CONTACT *</label>
                <input type="text" value={contact} onChange={e => setContact(e.target.value)} required style={{ width: "100%", padding: "10px", border: "2px solid #1E242B" }} placeholder="+91-9988776655" />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: "monospace", fontWeight: "bold" }}>POSTAL ADDRESS (e.g. Varanasi / Banaras) *</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} required style={{ width: "100%", padding: "10px", border: "2px solid #1E242B" }} placeholder="Assi Ghat, Varanasi / Banaras, UP" />
              </div>
            </div>

            <div className="grid-2col-responsive">
              <div>
                <label style={{ display: "block", fontFamily: "monospace", fontWeight: "bold" }}>REF / ACKNOWLEDGEMENT NO</label>
                <input type="text" value={refNo} onChange={e => setRefNo(e.target.value)} style={{ width: "100%", padding: "10px", border: "2px solid #1E242B" }} placeholder="e.g. VNS-99401" />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: "monospace", fontWeight: "bold" }}>ORIGINAL FILING DATE</label>
                <input type="text" value={subDate} onChange={e => setSubDate(e.target.value)} style={{ width: "100%", padding: "10px", border: "2px solid #1E242B" }} placeholder="e.g. 10-Jan-2026" />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontFamily: "monospace", fontWeight: "bold" }}>RAW GRIEVANCE NARRATIVE *</label>
              <textarea value={grievance} onChange={e => setGrievance(e.target.value)} rows={4} required style={{ width: "100%", padding: "10px", border: "2px solid #1E242B" }} placeholder="My land mutation khasra application submitted at Varanasi / Banaras Tehsil is pending..."></textarea>
            </div>

            <button type="submit" style={{ background: "#D94E28", color: "#FFF", border: "2px solid #1E242B", padding: "12px 24px", fontWeight: "bold", cursor: "pointer", width: "100%" }}>
              {t("INGEST & ASSIGN BANARAS / DIVISION PIO OFFICER →", "शिकायत दर्ज करें एवं संबंधित अधिकारी खोजें →")}
            </button>
          </form>
        </div>
      )}

      {activeTab === "queue" && (
        <div style={{ background: "#FFF", border: "2px solid #1E242B", boxShadow: "4px 4px 0 #1E242B", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2>LAWYER DASHBOARD & COMMAND CENTER</h2>
            
            <form onSubmit={handleSearchSubmit} className="search-form-responsive" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ fontWeight: "bold", fontFamily: "monospace", fontSize: "12px" }}>{t("SEARCH:", "खोजें:")}</label>
              <input
                type="text"
                placeholder={t("Unique ID, Name, Varanasi, Issue...", "आईडी, नाम, शहर, समस्या...")}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input-responsive"
                style={{ minWidth: "220px", padding: "8px 12px", border: "2px solid #1E242B" }}
              />
              <button 
                type="submit" 
                style={{ background: "#D94E28", color: "#FFF", border: "2px solid #1E242B", padding: "8px 16px", fontWeight: "bold", cursor: "pointer" }}
              >
                {t("SEARCH 🔍", "खोजें 🔍")}
              </button>
            </form>
          </div>

          <p style={{ fontFamily: "monospace", color: "#555", marginBottom: "16px" }}>
            Showing {cases.length} cases. Click on any row to open the RTI Legal Workspace with full updates & timeline.
          </p>

          <div className="table-responsive"><table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#1E242B", color: "#FFF" }}>
                <th style={{ padding: "10px", border: "1px solid #1E242B" }}>UNIQUE CASE ID</th>
                <th style={{ padding: "10px", border: "1px solid #1E242B" }}>COMPLAINANT & ADDRESS</th>
                <th style={{ padding: "10px", border: "1px solid #1E242B" }}>DEPARTMENT</th>
                <th style={{ padding: "10px", border: "1px solid #1E242B" }}>ASSIGNED PUBLIC OFFICER</th>
                <th style={{ padding: "10px", border: "1px solid #1E242B" }}>STATUS</th>
                <th style={{ padding: "10px", border: "1px solid #1E242B" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                    No matching cases found for search keyword "{searchQuery}".
                  </td>
                </tr>
              ) : (
                cases.map(c => (
                  <tr 
                    key={c.case_id}
                    onClick={() => openCaseDetails(c)}
                    style={{ cursor: "pointer", background: selectedCase?.case_id === c.case_id ? "#FFFDE7" : "#FFF" }}
                  >
                    <td style={{ padding: "10px", border: "1px solid #1E242B" }}><b>{c.case_id}</b></td>
                    <td style={{ padding: "10px", border: "1px solid #1E242B" }}>
                      <b>{c.complainant.name}</b><br/>
                      <small style={{ color: "#555" }}>{c.complainant.address}</small>
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #1E242B" }}>{c.department}</td>
                    <td style={{ padding: "10px", border: "1px solid #1E242B" }}>
                      <b>{c.suggested_pio?.pio_name}</b><br/>
                      <small style={{ color: "#555" }}>{c.suggested_pio?.office_address}</small>
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #1E242B" }}>
                      <span style={{
                        padding: "2px 8px", background: c.status === "APPROVED" ? "#C8E6C9" : "#FFE0B2",
                        border: "1px solid #1E242B", fontSize: "12px", fontWeight: "bold"
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #1E242B" }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openCaseDetails(c); }}
                        style={{ background: "#D94E28", color: "#FFF", border: "1px solid #1E242B", padding: "4px 10px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        OPEN CASE →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table></div>
        </div>
      )}

      {activeTab === "workspace" && (
        <div style={{ background: "#FFF", border: "2px solid #1E242B", boxShadow: "4px 4px 0 #1E242B", padding: "24px" }}>
          {selectedCase ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #1E242B", paddingBottom: "12px", marginBottom: "16px" }}>
                <div>
                  <span style={{ background: "#D94E28", color: "#FFF", padding: "4px 8px", fontWeight: "bold", marginRight: "8px" }}>
                    UNIQUE CASE ID: {selectedCase.case_id}
                  </span>
                  <span style={{ background: "#1E242B", color: "#FFF", padding: "4px 8px", fontWeight: "bold" }}>
                    {selectedCase.status}
                  </span>
                </div>
                <div style={{ fontFamily: "monospace", fontWeight: "bold" }}>
                  REF: {selectedCase.application_ref_no || "N/A"} | SUBMITTED: {selectedCase.original_submission_date || "N/A"}
                </div>
              </div>

              <div className="grid-2col-responsive">
                <div style={{ border: "2px solid #1E242B", padding: "16px" }}>
                  <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: "6px", marginBottom: "10px" }}>CITIZEN COMPLAINANT</h3>
                  <div><b>Name:</b> {selectedCase.complainant?.name}</div>
                  <div><b>Contact:</b> {selectedCase.complainant?.contact}</div>
                  <div><b>Address:</b> {selectedCase.complainant?.address}</div>
                  <div style={{ marginTop: "10px", fontStyle: "italic", background: "#f5f5f5", padding: "8px" }}>
                    "{selectedCase.raw_grievance}"
                  </div>
                </div>

                <div style={{ border: "2px solid #1E242B", padding: "16px", background: "#F1F8E9" }}>
                  <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: "6px", marginBottom: "10px", color: "#2E7D32" }}>
                    ASSIGNED PUBLIC OFFICER (PIO)
                  </h3>
                  <div><b>Department / Domain:</b> {selectedCase.department}</div>
                  <div><b>Officer Name:</b> {selectedCase.suggested_pio?.pio_name}</div>
                  <div><b>Designation:</b> {selectedCase.suggested_pio?.designation}</div>
                  <div><b>Office Address:</b> {selectedCase.suggested_pio?.office_address}</div>
                  <div><b>Email:</b> {selectedCase.suggested_pio?.email}</div>
                  <div><b>Phone:</b> {selectedCase.suggested_pio?.phone}</div>
                </div>
              </div>

              {/* TIMELINE & UPDATES AUDIT HISTORY TABLE */}
              <div style={{ border: "2px solid #1E242B", padding: "16px", marginBottom: "20px", background: "#FAF3E0" }}>
                <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: "6px", marginBottom: "12px", color: "#D94E28" }}>
                  ⏱️ CASE UPDATE TIMELINE & TABULAR AUDIT HISTORY
                </h3>
                
                {selectedCase.update_history && selectedCase.update_history.length > 0 ? (
                  <div>
                    {/* Visual Timeline Cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                      {selectedCase.update_history.map((h: any, idx: number) => (
                        <div key={idx} style={{
                          display: "flex", gap: "12px", padding: "10px", background: "#FFF",
                          border: "1px solid #1E242B", borderLeft: `4px solid ${idx === selectedCase.update_history.length - 1 ? '#D94E28' : '#1E242B'}`
                        }}>
                          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#555", minWidth: "140px" }}>
                            {h.timestamp}
                          </div>
                          <div>
                            <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                              <span style={{ background: "#E3F2FD", color: "#0D47A1", padding: "2px 6px", marginRight: "8px", fontSize: "10px" }}>
                                STEP 0{idx + 1}
                              </span>
                              {h.update_type} — {h.actor}
                            </div>
                            <div style={{ fontSize: "11px", color: "#333", marginTop: "2px" }}>
                              <b>Field Changed:</b> {h.field_changed} | <b>Old:</b> <code>{h.old_value}</code> &rarr; <b>New:</b> <code>{h.new_value}</code>
                            </div>
                            {h.remarks && (
                              <div style={{ fontSize: "11px", color: "#666", fontStyle: "italic", marginTop: "2px" }}>
                                "{h.remarks}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tabular Form */}
                    <div className="table-responsive"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", background: "#FFF" }}>
                      <thead>
                        <tr style={{ background: "#1E242B", color: "#FFF" }}>
                          <th style={{ padding: "8px", border: "1px solid #1E242B" }}>TIMESTAMP</th>
                          <th style={{ padding: "8px", border: "1px solid #1E242B" }}>UPDATE TYPE</th>
                          <th style={{ padding: "8px", border: "1px solid #1E242B" }}>ACTOR</th>
                          <th style={{ padding: "8px", border: "1px solid #1E242B" }}>FIELD CHANGED</th>
                          <th style={{ padding: "8px", border: "1px solid #1E242B" }}>OLD vs NEW VALUE</th>
                          <th style={{ padding: "8px", border: "1px solid #1E242B" }}>REMARKS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCase.update_history.map((h: any, idx: number) => (
                          <tr key={idx}>
                            <td style={{ padding: "8px", border: "1px solid #1E242B", fontFamily: "monospace" }}>{h.timestamp}</td>
                            <td style={{ padding: "8px", border: "1px solid #1E242B" }}><b>{h.update_type}</b></td>
                            <td style={{ padding: "8px", border: "1px solid #1E242B" }}>{h.actor}</td>
                            <td style={{ padding: "8px", border: "1px solid #1E242B" }}>{h.field_changed}</td>
                            <td style={{ padding: "8px", border: "1px solid #1E242B", fontFamily: "monospace" }}>
                              <small>Old: {h.old_value}<br/>New: <b>{h.new_value}</b></small>
                            </td>
                            <td style={{ padding: "8px", border: "1px solid #1E242B", color: "#555" }}>{h.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table></div>
                  </div>
                ) : (
                  <p>No updates recorded yet.</p>
                )}
              </div>

              <div style={{ border: "2px solid #1E242B", padding: "16px", marginBottom: "20px" }}>
                <h3>DRAFT LEGAL RTI APPLICATION SUBJECT</h3>
                <p style={{ fontWeight: "bold", background: "#eee", padding: "8px" }}>
                  {selectedCase.draft_rti?.application_subject}
                </p>

                <h3 style={{ marginTop: "12px" }}>RECORD-BASED RTI QUESTIONS SOUGHT</h3>
                <ol style={{ paddingLeft: "20px" }}>
                  {selectedCase.draft_rti?.questions?.map((q: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: "6px" }}>{q}</li>
                  ))}
                </ol>
              </div>

              <div style={{ border: "2px solid #1E242B", padding: "16px" }}>
                <h3>FULL LEGAL ASSESSMENT REPORT</h3>
                <pre style={{ background: "#1E242B", color: "#00FF66", padding: "16px", overflowX: "auto", fontSize: "12px" }}>
                  {selectedCase.ml_report_format}
                </pre>
              </div>
            </div>
          ) : (
            <p>No case selected. Please select a case from the Operational Command Center.</p>
          )}
        </div>
      )}

      {activeTab === "runlog" && (
        <div style={{ background: "#FFF", border: "2px solid #1E242B", boxShadow: "4px 4px 0 #1E242B", padding: "24px" }}>
          <h2>IMMUTABLE CODE-GENERATED RUN LOG</h2>
          <div className="table-responsive"><table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
            <thead>
              <tr style={{ background: "#1E242B", color: "#FFF" }}>
                <th style={{ padding: "10px", border: "1px solid #1E242B" }}>TIMESTAMP</th>
                <th style={{ padding: "10px", border: "1px solid #1E242B" }}>EVENT</th>
                <th style={{ padding: "10px", border: "1px solid #1E242B" }}>CASE ID</th>
                <th style={{ padding: "10px", border: "1px solid #1E242B" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {runLogs.map((l, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "10px", border: "1px solid #1E242B", fontFamily: "monospace" }}>{l.timestamp}</td>
                  <td style={{ padding: "10px", border: "1px solid #1E242B" }}>{l.event_type}</td>
                  <td style={{ padding: "10px", border: "1px solid #1E242B" }}><b>{l.case_id}</b></td>
                  <td style={{ padding: "10px", border: "1px solid #1E242B" }}>{l.action}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
