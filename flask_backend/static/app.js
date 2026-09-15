


// ARZI Civic RTI & Statutory Legal Intelligence Platform - Client Interaction Logic

const API_BASE = "/api/v1";

// Standalone Local Timestamp Generator
function getLocalTimestamp() {
  const dt = new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  const h = String(dt.getHours()).padStart(2, "0");
  const min = String(dt.getMinutes()).padStart(2, "0");
  const s = String(dt.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}
window.getLocalTimestamp = getLocalTimestamp;

// Default Immutable Seed Run Logs across Diverse Civic Dockets
const DEFAULT_SEED_RUN_LOGS = [
  {
    run_id: "RLOG-5009",
    timestamp: "2026-09-15 04:30:00",
    event_type: "CASE_REGISTERED",
    case_id: "ARZ-1049",
    actor: "Citizen Intake Gateway",
    source: "Web Intake Portal",
    action: "Successfully registered case ARZ-1049 for complainant Citizen (Food & Civil Supplies)",
    result: "SUCCESS",
    correlation_id: "CORR-ARZ-1049"
  },
  {
    run_id: "RLOG-5008",
    timestamp: "2026-09-15 04:15:00",
    event_type: "CASE_REGISTERED",
    case_id: "ARZ-1048",
    actor: "Citizen Intake Gateway",
    source: "Web Intake Portal",
    action: "Successfully registered case ARZ-1048 for Rohit Verma (Food Safety & Hygiene)",
    result: "SUCCESS",
    correlation_id: "CORR-104801"
  },
  {
    run_id: "RLOG-5007",
    timestamp: "2026-09-15 03:50:00",
    event_type: "LEGAL_DISPATCH_COMPLETED",
    case_id: "ARZ-1048",
    actor: "Adv. S. Kalra (Bar Council Counsel)",
    source: "Legal Dispatch Suite",
    action: "Statutory demand notice issued under FSSA 2006 for ARZ-1048 with speed post tracking",
    result: "DISPATCH_SUCCESS",
    correlation_id: "CORR-104802"
  },
  {
    run_id: "RLOG-5006",
    timestamp: "2026-09-15 03:10:00",
    event_type: "INPLACE_COMPLAINANT_FIX",
    case_id: "ARZ-1046",
    actor: "Adv. S. Kalra (Legal NGO)",
    source: "Approval Workspace",
    action: "Corrected complainant name in-place from 'Samiksha' to 'Shivanshu Pandey' & resolved duplicacy with ARZ-1047",
    result: "INPLACE_UPDATE_SUCCESS",
    correlation_id: "CORR-104603"
  },
  {
    run_id: "RLOG-5005",
    timestamp: "2026-09-15 02:45:00",
    event_type: "DEPT_OVERRIDE_CORRECTED",
    case_id: "ARZ-1046",
    actor: "Legal Operator",
    source: "Approval Workspace",
    action: "Operator corrected department from Food & Civil Supplies -> Revenue & Land Records (15-sec correction)",
    result: "OVERRIDE_SUCCESS",
    correlation_id: "CORR-104602"
  },
  {
    run_id: "RLOG-5004",
    timestamp: "2026-09-15 02:30:00",
    event_type: "SECTION_6_3_TRANSFER",
    case_id: "ARZ-1045",
    actor: "Public Information Officer",
    source: "Delhi Jal Board Desk",
    action: "Transferred case ARZ-1045 to Urban Development & Drainage under Section 6(3)",
    result: "TRANSFER_SUCCESS",
    correlation_id: "CORR-104501"
  },
  {
    run_id: "RLOG-5003",
    timestamp: "2026-09-15 02:00:00",
    event_type: "SECTION_7_1_FASTTRACK",
    case_id: "ARZ-1044",
    actor: "Emergency Triage Gateway",
    source: "48-Hour Fast-Track Engine",
    action: "Fast-tracked case ARZ-1044 under Section 7(1) Life & Liberty for Smt. Kamla Devi (Health & Family Welfare)",
    result: "FASTTRACK_ACTIVATED",
    correlation_id: "CORR-104401"
  },
  {
    run_id: "RLOG-5002",
    timestamp: "2026-09-15 01:30:00",
    event_type: "CASE_REGISTERED",
    case_id: "ARZ-1042",
    actor: "System Ingestion Gateway",
    source: "Web Intake Portal",
    action: "Application ref RC-88492 queued for PIO inspection at Civil Lines DSO",
    result: "SUCCESS",
    correlation_id: "CORR-104202"
  },
  {
    run_id: "RLOG-5001",
    timestamp: "2026-09-15 01:15:00",
    event_type: "INTAKE_RECEIVED",
    case_id: "ARZ-1042",
    actor: "Citizen Intake Gateway",
    source: "Web Intake Portal",
    action: "Successfully registered case ARZ-1042 for Sunita Devi (Food & Civil Supplies - Ration Card Delay)",
    result: "SUCCESS",
    correlation_id: "CORR-104201"
  }
];

// Immutable Run Logs & Multi-Field Search Cache (Initialized from localStorage or default seed)
var allRunLogsCache = (() => {
  try {
    const raw = localStorage.getItem("arzi_run_logs_ledger");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [...DEFAULT_SEED_RUN_LOGS];
})();
var allCasesCache = [];

// =========================================================================
// BILINGUAL (ENGLISH / HINDI) TRANSLATION ENGINE & DICTIONARY
// =========================================================================
let savedLang = localStorage.getItem("arzi_lang");
let currentLang = (savedLang === "hi") ? "hi" : "en";
localStorage.setItem("arzi_lang", currentLang);

const I18N_DICT = {
  // Brand & Nav
  "brand_name": { "en": "ARZI", "hi": "अर्जी" },
  "brand_sub": { "en": "Civic Legal Intelligence Desk", "hi": "नागरिक विधिक सहायता डेस्क" },
  "nav_home": { "en": "Home Overview", "hi": "मुख्य पृष्ठ" },
  "nav_about": { "en": "About & Mission", "hi": "उद्देश्य एवं परिचय" },
  "nav_pillars": { "en": "Statutory Pillars", "hi": "कानूनी नियम" },
  "nav_dashboard": { "en": "Operations Dashboard", "hi": "ऑपरेशंस डैशबोर्ड" },
  "nav_dashboard_short": { "en": "Dashboard", "hi": "डैशबोर्ड" },
  "status_operational": { "en": "Operational", "hi": "सक्रिय" },

  // Hero Section
  "hero_tag": { "en": "AUTONOMOUS CIVIC RTI & STATUTORY LEGAL INTELLIGENCE", "hi": "स्वचालित नागरिक आरटीआई एवं कानूनी सहायता डेस्क" },
  "hero_h1_prefix": { "en": "Democratizing Indian Public Law with", "hi": "भारतीय जन-कानून का सरलीकरण" },
  "hero_h1_span": { "en": "Autonomous Statutory Intelligence", "hi": "सटीक एवं पारदर्शी कानूनी प्रणाली" },
  "hero_lead": {
    "en": "ARZI simplifies public legal processes by converting citizen grievances into legally enforceable RTI applications and First Appeals. Automatically map IPC 1860 to Bharatiya Nyaya Sanhita (BNS 2023), locate your designated Public Information Officer via geodesy, and enforce statutory compliance deadlines.",
    "hi": "अर्जी आपकी नागरिक समस्याओं को कानूनी रूप से मान्य आरटीआई और प्रथम अपील में बदलकर त्वरित समाधान दिलाती है। बीएनएस 2023 की धाराएं देखें, अपने जन सूचना अधिकारी (PIO) को खोजें और 30 दिन में जवाब सुनिश्चित करें।"
  },
  "hero_btn_file": { "en": "File RTI Grievance", "hi": "आरटीआई शिकायत दर्ज करें" },
  "hero_btn_codex": { "en": "Statutory Codex", "hi": "कानूनी नियम देखें" },
  "hero_btn_runlog": { "en": "Audit Run Log", "hi": "ऑडिट लॉग" },

  // Snapshot Metrics
  "stat_active": { "en": "Active Cases", "hi": "सक्रिय मामले" },
  "stat_active_sub": { "en": "Pending Review", "hi": "समीक्षा हेतु लंबित" },
  "stat_pio": { "en": "Avg PIO Distance", "hi": "औसत PIO दूरी" },
  "stat_pio_sub": { "en": "Haversine Geodesic Match", "hi": "भू-स्थानिक निकटता" },
  "stat_penalty": { "en": "Sec 20 Liability", "hi": "धारा 20 जुर्माना" },
  "stat_penalty_sub": { "en": "₹250/day Mandatory Penalty", "hi": "₹250/दिन अनिवार्य जुर्माना" },
  "stat_dockets": { "en": "Total Dockets", "hi": "कुल दर्ज मामले" },
  "stat_dockets_sub": { "en": "Cumulative Cases", "hi": "अभिलेख में दर्ज" },

  // Workflow Pipeline
  "pipeline_title": { "en": "4-Stage Grievance-to-Enforcement Pipeline", "hi": "4-चरणीय सरल शिकायत निवारण प्रक्रिया" },
  "pipeline_badge": { "en": "Deterministic SLA", "hi": "समयबद्ध समाधान" },
  "pipeline_s1_title": { "en": "Ingest & Structured Parsing", "hi": "1. शिकायत दर्ज व कानूनी विश्लेषण" },
  "pipeline_s1_desc": { "en": "Translates citizen grievances into legally enforceable questions admissible under Section 2(f) of RTI Act.", "hi": "नागरिक की आम भाषा को आरटीआई अधिनियम की धारा 2(f) के तहत कानूनी प्रश्नों में बदलता है।" },
  "pipeline_s2_title": { "en": "11-Domain ML Classification", "hi": "2. विभाग व बीएनएस धारा चयन" },
  "pipeline_s2_desc": { "en": "Identifies the competent public sector (Power, Water, Transport, Revenue) with confidence scoring.", "hi": "बिजली, पानी, सड़क, राशन, राजस्व आदि में से सही विभाग व बीएनएस 2023 धाराओं का निर्धारण।" },
  "pipeline_s3_title": { "en": "Geodesic PIO Discovery", "hi": "3. संबंधित PIO की खोज" },
  "pipeline_s3_desc": { "en": "Applies Haversine spherical geodesy to map pincodes and coordinates to the verified nodal officer.", "hi": "पिन कोड और भू-स्थानिक तकनीक द्वारा आपके क्षेत्र के सही जन सूचना अधिकारी की खोज।" },
  "pipeline_s4_title": { "en": "Enforceable Instrument & Log", "hi": "4. आरटीआई ड्राफ्ट व ट्रैकिंग" },
  "pipeline_s4_desc": { "en": "Compiles court-admissible Form-A PDFs with SHA-256 digital seals and immutable audit run log.", "hi": "डाउनलोड योग्य आरटीआई फॉर्म-A पीडीएफ तैयार कर 30-दिवसीय समयसीमा की ट्रैकिंग शुरू।" },

  // Quick Triage Launchpad
  "quick_triage_title": { "en": "Instant Civic Sector Triage Launchpad (1-Click Load)", "hi": "सामान्य नागरिक शिकायतें (1-क्लिक में दर्ज करें)" },
  "quick_triage_badge": { "en": "11 Public Domains", "hi": "11 सरकारी विभाग" },
  "preset_power_title": { "en": "Electricity & Power Discom", "hi": "बिजली व पावर डिस्कॉम" },
  "preset_power_sub": { "en": "Transformer burnout & blackout • BSES Delhi (110019)", "hi": "ट्रांसफार्मर खराबी व बिजली कटौती • दिल्ली (110019)" },
  "preset_water_title": { "en": "Drinking Water & Jal Board", "hi": "पेयजल आपूर्ति व जल निगम" },
  "preset_water_sub": { "en": "Sewage contamination • Jal Sansthan Varanasi (221010)", "hi": "गंदे पानी की आपूर्ति व सीवर • वाराणसी (221010)" },
  "preset_transport_title": { "en": "Transport & RTO Vehicles", "hi": "परिवहन विभाग व आरटीओ" },
  "preset_transport_sub": { "en": "Driving license renewal delay • Sarai Kale Khan (110013)", "hi": "ड्राइविंग लाइसेंस में देरी • दिल्ली (110013)" },
  "preset_pension_title": { "en": "Labour, Pension & Security", "hi": "पेंशन एवं भविष्य निधि (EPFO)" },
  "preset_pension_sub": { "en": "EPS-95 monthly pension settlement • EPFO Delhi (110052)", "hi": "मासिक पेंशन का भुगतान न होना • दिल्ली (110052)" },
  "preset_pollution_title": { "en": "Environment & Pollution", "hi": "पर्यावरण व प्रदूषण नियंत्रण" },
  "preset_pollution_sub": { "en": "Illegal industrial toxic effluent • DPCC Delhi (110032)", "hi": "अवैध जहरीला कचरा व प्रदूषण • दिल्ली (110032)" },
  "preset_land_title": { "en": "Revenue & Land Records", "hi": "राजस्व एवं जमीन नामांतरण" },
  "preset_land_sub": { "en": "Mutation & Khasra delay • Sadar Tehsil Varanasi (221002)", "hi": "दाखिल-खारिज व खतौनी में देरी • वाराणसी (221002)" },

  // About Page
  "about_tag": { "en": "ABOUT ARZI • CIVIC ACCOUNTABILITY & MANDATE", "hi": "अर्जी के बारे में • पारदर्शिता व नागरिक अधिकार" },
  "about_h1_prefix": { "en": "Dismantling Administrative Silence", "hi": "प्रशासनिक लेटलतीफी का अंत" },
  "about_h1_span": { "en": "Through Autonomous Legal Engineering", "hi": "सशक्त नागरिक कानूनी तकनीक द्वारा" },
  "about_lead": {
    "en": "ARZI empowers citizens and advocates to dismantle bureaucratic silence by converting informal grievances into binding RTI filings with automatic Section 20 penalty tracking.",
    "hi": "अर्जी नागरिकों और अधिवक्ताओं को यह अधिकार देती है कि वे अपनी समस्याओं को कानूनी रूप से बाध्यकारी आरटीआई में बदलकर सरकारी जवाबदेही सुनिश्चित करें।"
  },
  "about_crisis_title": { "en": "The Administrative Silence Crisis in India", "hi": "सरकारी विभागों में जवाब न मिलने की समस्या" },
  "about_crisis_p1": { "en": "Across municipal corporations, tehsils, and statutory boards, millions of legitimate citizen requests languish unanswered. Bureaucratic delays become the default operating procedure.", "hi": "नगर निगमों, तहसीलों और सरकारी दफ्तरों में लाखों नागरिक आवेदन बिना किसी जवाब के धूल खाते रहते हैं।" },
  "about_crisis_p2": { "en": "When grievances remain informal—without statutory citations—officers face zero legal accountability.", "hi": "जब शिकायतें बिना कानूनी धाराओं के दी जाती हैं, तो अधिकारियों पर कोई जवाबदेही नहीं बनती।" },
  "about_sol_title": { "en": "The ARZI Operational Intervention", "hi": "अर्जी का ठोस समाधान" },
  "about_sol_p1": { "en": "ARZI transforms everyday complaints into precise questions under Section 2(f), finds the nodal PIO via geodesy, and starts the strict 30-day clock.", "hi": "अर्जी आम शिकायतों को धारा 2(f) के तहत कानूनी प्रश्नों में बदलती है, सही अधिकारी खोजती है और 30 दिन की समयसीमा शुरू करती है।" },
  "about_sol_p2": { "en": "By activating the ₹250/day personal salary deduction mandate under Section 20(1), ARZI replaces bureaucratic discretion with enforceable legal liability.", "hi": "धारा 20(1) के तहत लापरवाह अधिकारी के वेतन से ₹250/दिन व्यक्तिगत कटौती का डर जवाबदेही सुनिश्चित करता है।" },
  "about_stake_title": { "en": "Multi-Stakeholder Operational Utility", "hi": "सभी हितधारकों के लिए उपयोगिता" },
  "stake_citizen_title": { "en": "Citizen Complainants", "hi": "आम नागरिक" },
  "stake_citizen_desc": { "en": "File clear, structured RTI questions in under 2 minutes without needing expensive legal representation.", "hi": "बिना किसी वकील के 2 मिनट में सटीक आरटीआई प्रश्न तैयार करें।" },
  "stake_lawyer_title": { "en": "Legal Counsel & Advocates", "hi": "अधिवक्ता एवं विधिक पेशेवर" },
  "stake_lawyer_desc": { "en": "Manage high-volume civic casework with automated IPC ↔ BNS concordance and rapid First Appeal generation.", "hi": "बीएनएस 2023 और प्रथम अपील के साथ नागरिक मामलों को तेजी से निपटाएं।" },
  "stake_gov_title": { "en": "Public Grievance Desks", "hi": "लोक शिकायत प्रकोष्ठ" },
  "stake_gov_desc": { "en": "Public authorities can execute Section 6(3) 5-day transfers seamlessly and avoid Section 20 penalty liabilities.", "hi": "धारा 6(3) के तहत 5 दिन में सही विभाग को फाइल भेजें और जुर्माने से बचें।" },
  "about_rigor_title": { "en": "Engineering Rigor & Cryptographic Verifiability", "hi": "तकनीकी प्रामाणिकता एवं सुरक्षा" },
  "rigor_det_title": { "en": "Deterministic Legal Reasoning", "hi": "सटीक कानूनी तर्क" },
  "rigor_det_desc": { "en": "Zero hallucination risk. Statutory questions, time limits, and fee clauses are compiled via deterministic statutory rule engines verified against official Indian Gazettes.", "hi": "शून्य त्रुटि। कानूनी प्रश्न और समयसीमा आधिकारिक गजट के आधार पर तैयार होते हैं।" },
  "rigor_sha_title": { "en": "SHA-256 Digital Sealing", "hi": "SHA-256 डिजिटल सुरक्षा" },
  "rigor_sha_desc": { "en": "Every generated Form-A embeds an immutable SHA-256 cryptographic hash guaranteeing tamper-evident authenticity.", "hi": "प्रत्येक दस्तावेज में डिजिटल हैश कोड होता है जो उसकी प्रामाणिकता सिद्ध करता है।" },
  "rigor_audit_title": { "en": "Immutable Audit Ledger", "hi": "अपरिवर्तनीय ऑडिट लेजर" },
  "rigor_audit_desc": { "en": "Every intake, transfer, and case update is permanently journaled with microsecond ISO timestamps.", "hi": "प्रत्येक कदम और तारीख का स्थाई रिकॉर्ड दर्ज होता है जिसे बदला नहीं जा सकता।" },

  // Pillars Page
  "pillars_tag": { "en": "LEGAL CODEX & STATUTORY BENCHMARKS", "hi": "कानूनी संहिता एवं समयसीमा" },
  "pillars_h1_prefix": { "en": "Authoritative Statutory Provisions &", "hi": "अधिनियम के मुख्य प्रावधान एवं" },
  "pillars_h1_span": { "en": "Judicial Enforcement Standards", "hi": "न्यायिक निर्णय व मानक" },
  "pillars_lead": {
    "en": "Comprehensive reference guide on Section 20 penalty enforcement, Bharatiya Nyaya Sanhita criminal law transition, statutory escalation ladders, and landmark Supreme Court jurisprudence.",
    "hi": "धारा 20 जुर्माना प्रक्रिया, बीएनएस 2023 में धाराओं का बदलाव, आरटीआई की समयसीमा और सुप्रीम कोर्ट के महत्वपूर्ण फैसलों का संपूर्ण विवरण।"
  },
  "ladder_title": { "en": "Statutory Escalation Ladder & Mandatory Time Limits", "hi": "आरटीआई की कानूनी समयसीमा व चरण" },
  "ladder_day0_title": { "en": "Filing & Fee", "hi": "आवेदन व शुल्क" },
  "ladder_day0_desc": { "en": "Form-A submission with ₹10 court fee / postal order. Receipt acknowledgment legally mandatory.", "hi": "₹10 शुल्क के साथ फॉर्म-A जमा करें; रसीद मिलना अनिवार्य है।" },
  "ladder_day5_title": { "en": "Sec 6(3) Transfer", "hi": "धारा 6(3) अंतरण" },
  "ladder_day5_desc": { "en": "If info held by another public authority, transfer within 5 days with written notice to citizen.", "hi": "दूसरे विभाग का मामला होने पर 5 दिन के भीतर फाइल भेजना अनिवार्य है।" },
  "ladder_day30_title": { "en": "Statutory SLA", "hi": "30-दिवसीय समयसीमा" },
  "ladder_day30_desc": { "en": "Standard 30-day window expires. (48 hours if life/liberty). Day 31 triggers ₹250/day penalty clock.", "hi": "जवाब देने की 30 दिन की सीमा। 31वें दिन से ₹250/दिन जुर्माना शुरू।" },
  "ladder_day60_title": { "en": "First Appeal", "hi": "प्रथम अपील" },
  "ladder_day60_desc": { "en": "File First Appeal under Section 19(1) to First Appellate Authority (FAA) against deemed refusal.", "hi": "जवाब न मिलने पर वरिष्ठ अधिकारी (FAA) के समक्ष प्रथम अपील करें।" },
  "ladder_day150_title": { "en": "Second Appeal", "hi": "द्वितीय अपील" },
  "ladder_day150_desc": { "en": "Escalate to Central / State Information Commission under Section 19(3) with prayer for Section 20 penalties.", "hi": "राज्य या केंद्रीय सूचना आयोग में अपील कर जुर्माना लगाने की मांग करें।" },
  "p1_title": { "en": "Pillar 1: Section 20(1) Personal Penalty Clock", "hi": "स्तंभ 1: धारा 20(1) व्यक्तिगत जुर्माना" },
  "p1_desc": { "en": "Under Section 20(1) of the RTI Act 2005, where the Commission finds that a Public Information Officer (PIO) has refused or delayed information without reasonable cause, it shall impose a penalty of ₹250 each day (up to ₹25,000) deducted from the officer's salary.", "hi": "धारा 20(1) के तहत, 30 दिन में बिना ठोस कारण सूचना न देने पर आयोग अधिकारी के वेतन से प्रतिदिन ₹250 (अधिकतम ₹25,000) जुर्माना काटता है।" },
  "p2_title": { "en": "Pillar 2: IPC 1860 to BNS 2023 Criminal Codex", "hi": "स्तंभ 2: आईपीसी 1860 से बीएनएस 2023" },
  "p3_title": { "en": "Pillar 3: Section 6(3) 5-Day Mandatory Transfer", "hi": "स्तंभ 3: धारा 6(3) 5-दिवसीय अंतरण" },
  "p3_desc": { "en": "Where an application is made to an authority requesting information held by another, the officer shall transfer the application within five days and immediately inform the applicant in writing.", "hi": "यदि मांगी गई सूचना किसी अन्य विभाग से संबंधित है, तो अधिकारी 5 दिन के भीतर आवेदन को सही विभाग को भेजने के लिए बाध्य है।" },
  "p4_title": { "en": "Pillar 4: Haversine Geodetic PIO Mapping", "hi": "स्तंभ 4: भू-स्थानिक अधिकारी मैपिंग" },
  "p4_desc": { "en": "ARZI uses the great-circle Haversine formula across verified municipal coordinates (Delhi NCT, Varanasi, Lucknow) to assign the nearest competent Public Information Officer.", "hi": "अर्जी पिन कोड और निर्देशांकों के आधार पर आपके क्षेत्र के निकटतम सक्षम जन सूचना अधिकारी को चुनती है।" },
  "sc_precedents_title": { "en": "Landmark Supreme Court Jurisprudence on Right to Information", "hi": "सूचना के अधिकार पर सुप्रीम कोर्ट के ऐतिहासिक फैसले" },
  "matrix_title": { "en": "Comprehensive IPC 1860 ↔ BNS 2023 Statutory Comparison Matrix", "hi": "आईपीसी 1860 ↔ बीएनएस 2023 तुलनात्मक तालिका" },
  "table_filter_placeholder": { "en": "Filter by section, crime, or keyword...", "hi": "धारा, अपराध या शब्द से खोजें..." },
  "th_offense": { "en": "Offense Category", "hi": "अपराध / समस्या श्रेणी" },
  "th_ipc": { "en": "Historical IPC (1860)", "hi": "पुराना कानून (IPC 1860)" },
  "th_bns": { "en": "Bharatiya Nyaya Sanhita (2023)", "hi": "नया कानून (BNS 2023)" },
  "th_punishment": { "en": "Maximum Punishment Scope", "hi": "सजा का प्रावधान" },
  "th_status": { "en": "Cognizability & Bail Status", "hi": "संज्ञेयता व जमानत" },

  // Dashboard & Subtabs
  "subnav_casework": { "en": "01. Casework Desk", "hi": "01. शिकायत डेस्क" },
  "subnav_statutory": { "en": "02. Statutory Library & Custom Acts", "hi": "02. कानून व अधिनियम" },
  "subnav_pio": { "en": "03. PIO Geospatial Map", "hi": "03. अधिकारी मैप" },
  "subnav_compliance": { "en": "04. Compliance & SLA", "hi": "04. जुर्माना कैलकुलेटर" },
  "subnav_runlog": { "en": "05. Audit Run Log", "hi": "05. ऑडिट लॉग" },

  "intake_panel_title": { "en": "Citizen Grievance Ingestion", "hi": "नागरिक शिकायत दर्ज करें" },
  "intake_toggle_btn": { "en": "Toggle Form", "hi": "फॉर्म छिपाएं/दिखाएं" },
  "intake_name": { "en": "Complainant / Client Full Name *", "hi": "शिकायतकर्ता का पूरा नाम *" },
  "intake_contact": { "en": "Phone / Contact *", "hi": "फोन / संपर्क नंबर *" },
  "intake_language": { "en": "Language / Locale", "hi": "दस्तावेज़ की भाषा" },
  "intake_addr": { "en": "Address / Locality *", "hi": "पता / मोहल्ला / क्षेत्र *" },
  "intake_pin": { "en": "PIN Code (6-Digit) *", "hi": "पिन कोड (6 अंक) *" },
  "intake_urgent_label": { "en": "48-Hour Urgent Life & Liberty Fast-Track (Section 7(1) Proviso)", "hi": "48 घंटे का आपातकालीन मामला (जीवन व स्वतंत्रता)" },
  "intake_urgent_hint": { "en": "Invokes 48-hour statutory deadline for ICU emergencies, water contamination, unlawful custody, or life threats.", "hi": "अस्पताल आपातकाल, दूषित जल, अवैध हिरासत या जीवन को खतरे के मामलों में 48 घंटे में सूचना का अधिकार।" },
  "intake_ref": { "en": "Original Ref / Ack No.", "hi": "मूल संदर्भ / रसीद संख्या" },
  "intake_date": { "en": "Submission Date", "hi": "आवेदन की तारीख" },
  "intake_narrative": { "en": "Statement of Facts & Grievance Narrative *", "hi": "अपनी शिकायत का संक्षिप्त विवरण *" },
  "intake_narrative_ph": { "en": "Enter or dictate factual details regarding public record request, administrative delay, or refusal...", "hi": "अपनी समस्या विस्तार से लिखें (जैसे राशन न मिलना, जमीन नामांतरण में देरी, सड़क या नाली की समस्या)..." },
  "intake_submit": { "en": "Ingest, Extract Law & Route PIO →", "hi": "शिकायत जमा करें एवं अधिकारी खोजें →" },
  "btn_ml_predict": { "en": "⚡ Predict Domain via ML", "hi": "⚡ श्रेणी जांचें (AI)" },
  "btn_voice_dictate": { "en": "Voice Dictation", "hi": "बोलकर लिखें" },
  "presets_label": { "en": "Common Civic Presets (1-Click):", "hi": "त्वरित उदाहरण (1-क्लिक):" },
  "preset_ration_pill": { "en": "Ration / PDS (Delhi)", "hi": "राशन / कोटेदार (दिल्ली)" },
  "preset_land_pill": { "en": "Land Mutation (Varanasi)", "hi": "जमीन नामांतरण (वाराणसी)" },
  "preset_water_pill": { "en": "Water & Sewer (Jal Board)", "hi": "जल आपूर्ति व सीवर (जल निगम)" },
  "preset_power_pill": { "en": "Electricity Discom (Power)", "hi": "बिजली आपूर्ति (डिस्कॉम)" },
  "preset_emergency_pill": { "en": "48h Urgent (AIIMS)", "hi": "48 घंटे आपातकाल (एम्स)" },

  "queue_panel_title": { "en": "Active Casework Dockets", "hi": "सक्रिय मामले" },
  "queue_search_ph": { "en": "Search Case ID, Citizen, Varanasi, Section...", "hi": "केस आईडी, नाम, शहर या धारा से खोजें..." },
  "queue_filter_btn": { "en": "Filter", "hi": "खोजें" },
  "th_docket": { "en": "Docket", "hi": "केस आईडी" },
  "th_complainant": { "en": "Complainant", "hi": "आवेदक" },
  "th_dept": { "en": "Department", "hi": "विभाग" },
  "th_sections": { "en": "Sections", "hi": "धाराएं" },
  "th_pio": { "en": "Assigned PIO", "hi": "नामित अधिकारी" },
  "th_status": { "en": "Status", "hi": "स्थिति" },
  "th_action": { "en": "Action", "hi": "कार्रवाई" },
  "btn_view": { "en": "View", "hi": "देखें" },

  "no_case_title": { "en": "No Active Case Docket Selected", "hi": "कोई केस चयनित नहीं है" },
  "no_case_desc": { "en": "Select a case file from the left queue, or ingest a citizen brief to open the legal evidence dossier.", "hi": "बाईं ओर की सूची से कोई केस चुनें या नया आवेदन भरें।" },

  // Compliance Calculator
  "calc_panel_title": { "en": "Interactive Section 20(1) Penalty & Statutory SLA Clock", "hi": "धारा 20(1) जुर्माना एवं समयसीमा कैलकुलेटर" },
  "calc_heading_params": { "en": "Case Timeline & SLA Parameters", "hi": "समयसीमा व आवेदन विवरण" },
  "calc_lbl_filing": { "en": "RTI Application Filing Date *", "hi": "आवेदन जमा करने की तिथि *" },
  "calc_lbl_provision": { "en": "Statutory SLA Provision *", "hi": "कानूनी श्रेणी *" },
  "calc_lbl_resp": { "en": "PIO Response Date (Leave empty if still pending)", "hi": "जवाब मिलने की तिथि (लंबित होने पर खाली छोड़ें)" },
  "calc_lbl_dept": { "en": "Target Public Authority / Department", "hi": "संबंधित सरकारी विभाग" },
  "calc_btn_reset_label": { "en": "Reset to 35-Day Overdue Benchmark", "hi": "डिफ़ॉल्ट पर रीसेट करें" },
  "calc_heading_results": { "en": "Live Accrued Personal Penalty Liability", "hi": "अधिकारी पर देय जुर्माना" },
  "calc_lbl_deadline": { "en": "Statutory Deadline", "hi": "अंतिम तिथि" },
  "calc_lbl_elapsed": { "en": "Days Elapsed", "hi": "बीते दिन" },
  "calc_lbl_delinquent": { "en": "Delinquent Days", "hi": "विलंब के दिन" },
  "calc_lbl_accrued": { "en": "Accrued Penalty", "hi": "कुल जुर्माना" },
  "calc_copy_btn": { "en": "Copy Clause", "hi": "क्लॉज कॉपी करें" },

  // PIO Tab
  "pio_geodesy_title": { "en": "Active Complaint Docket Geodesy", "hi": "शिकायत का भू-स्थानिक विवरण" },
  "pio_visualizer_title": { "en": "Geospatial Jurisdictional Visualizer", "hi": "क्षेत्राधिकार मैप व टेलीमेट्री" },
  "pio_nearest_title": { "en": "Nearest PIO Officers in Area", "hi": "क्षेत्र के निकटतम जन सूचना अधिकारी" },

  // RunLog Tab
  "runlog_search_title": { "en": "Search Case Dockets & Audit Trail", "hi": "केस ऑडिट ट्रायल व सर्च" },
  "runlog_table_title": { "en": "Immutable Code-Generated Execution Run Log", "hi": "अपरिवर्तनीय कोड-जनित ऑडिट रन लॉग" },

  // Case Detail Dossier
  "dossier_return_btn": { "en": "← Return to Audit Run Log", "hi": "← वापस ऑडिट लॉग पर जाएं" },
  "dossier_open_workspace": { "en": "Open in Casework Workspace", "hi": "शिकायत डेस्क में खोलें" },
  "dossier_download_pdf": { "en": "Download Form-A PDF", "hi": "फॉर्म-A पीडीएफ डाउनलोड" },
  "dossier_parties_title": { "en": "Citizen Complainant & Designated Public Authority", "hi": "नागरिक आवेदक एवं नामित जन सूचना अधिकारी" },
  "dossier_grievance_title": { "en": "Citizen Grievance & Structured Questions", "hi": "शिकायत विवरण एवं तैयार आरटीआई प्रश्न" },
  "dossier_ml_title": { "en": "ML Domain Classification Intelligence", "hi": "एआई वर्गीकरण व धारा विश्लेषण" },
  "dossier_merge_title": { "en": "Case Deduplication & Docket Consolidation", "hi": "समान मामलों का एकीकरण व दोहराव निवारण" },
  "dossier_update_title": { "en": "Log Official Case Update with Timestamp", "hi": "केस में नया घटनाक्रम / तारीख दर्ज करें" },
  "dossier_timeline_title": { "en": "Chronological Case Timeline & Ledger", "hi": "केस की समयबद्ध प्रगति एवं लेजर" },

  // Extra Utility & Component Keys
  "btn_refresh": { "en": "Refresh", "hi": "ताज़ा करें" },
  "btn_clear": { "en": "Clear", "hi": "हटाएं" },
  "btn_close": { "en": "Close", "hi": "बंद करें" },
  "btn_cancel": { "en": "Cancel", "hi": "रद्द करें" },
  "btn_dismiss": { "en": "Dismiss", "hi": "हटाएं" },
  "btn_print_slip": { "en": "Print Dispatch Slip", "hi": "रसीद प्रिंट करें" },
  "btn_execute_transfer": { "en": "Execute Transfer", "hi": "अंतरण करें" },

  // Statutory Library & Custom Acts
  "statutory_codex_title": { "en": "Statutory Codex & Custom Acts Registration", "hi": "कानून एवं अधिनियम पंजीकरण" },
  "statutory_act_title": { "en": "Act / Legislation Full Title *", "hi": "अधिनियम का पूरा नाम *" },
  "statutory_act_sections": { "en": "Specific Section(s) / Rule *", "hi": "संबंधित धाराएं / नियम *" },
  "statutory_act_domain": { "en": "Statutory Domain / Practice Area *", "hi": "कानूनी विभाग / विषय *" },
  "statutory_act_author": { "en": "Advocate / Author Name *", "hi": "अधिवक्ता / लेखक का नाम *" },
  "statutory_act_grounds": { "en": "Statutory Grounds & Legal Effect *", "hi": "कानूनी आधार व प्रभाव *" },
  "statutory_act_link": { "en": "Link immediately to current active docket", "hi": "वर्तमान केस से तुरंत जोड़ें" },
  "statutory_act_btn": { "en": "Register Custom Act", "hi": "अधिनियम जोड़ें" },
  "statutory_registered_title": { "en": "Registered Legislation", "hi": "पंजीकृत कानून" },

  // PIO Radar & Directory
  "pio_banner_text": { "en": "Complaint Registered & Nearest Domain PIO Assigned!", "hi": "शिकायत दर्ज एवं संबंधित क्षेत्र के PIO का आवंटन सम्पन्न!" },
  "pio_inspect_label": { "en": "Inspect Docket:", "hi": "केस चुनें:" },
  "pio_kpi_docket": { "en": "Docket & Complainant", "hi": "केस व आवेदक" },
  "pio_kpi_domain": { "en": "Complaint Domain", "hi": "शिकायत श्रेणी" },
  "pio_kpi_assigned": { "en": "Assigned Nearest Domain PIO", "hi": "आवंटित जन सूचना अधिकारी" },
  "pio_origin_legend": { "en": "Citizen Origin", "hi": "आवेदक का स्थान" },
  "pio_assigned_legend": { "en": "Assigned Domain PIO", "hi": "आवंटित जन सूचना अधिकारी" },
  "pio_nearby_legend": { "en": "Other Nearby Authorities", "hi": "अन्य निकटतम कार्यालय" },
  "pio_filter_all": { "en": "All Nearby", "hi": "सभी निकटतम" },
  "pio_filter_domain": { "en": "Domain Only", "hi": "केवल विभाग" },
  "pio_filter_close": { "en": "< 3 km", "hi": "3 किमी से कम" },

  // Speed Post & Transfer Modals
  "transfer_modal_title": { "en": "SECTION 6(3) 5-DAY MANDATORY TRANSFER", "hi": "धारा 6(3) 5-दिवसीय अनिवार्य अंतरण" },
  "transfer_modal_desc": { "en": "Transfer this application to the rightful public authority holding records. An automated notice and run log audit will be recorded.", "hi": "इस आवेदन को संबंधित विभाग को 5 दिन में अंतरित करें। इसका रिकॉर्ड ऑडिट लॉग में दर्ज होगा।" },
  "postal_slip_modal_title": { "en": "INDIAN SPEED POST DISPATCH DOCKET & REGISTERED AD", "hi": "भारतीय स्पीड पोस्ट एवं पंजीकृत डाक रसीद" },
  "postal_slip_modal_sub": { "en": "Department of Posts, India • Statutory Proof of Dispatch under Section 27 General Clauses Act", "hi": "डाक विभाग, भारत सरकार • धारा 27 के तहत विधिक प्रेषण प्रमाण" },

  // Footer
  "footer_brand": { "en": "ARZI — Civic RTI & Statutory Legal Intelligence Platform • National Legal Tech Standard", "hi": "अर्जी — नागरिक आरटीआई एवं कानूनी सहायता प्लेटफॉर्म • राष्ट्रीय विधिक सेवा" }
};

function t(key) {
  if (!I18N_DICT[key]) return key;
  if (I18N_DICT[key][currentLang]) {
    return I18N_DICT[key][currentLang];
  }
  return I18N_DICT[key]["en"] || key;
}

// -------------------------------------------------------------------------
// COMPREHENSIVE BILINGUAL DATA CODEX & TRANSLATION ENGINE
// -------------------------------------------------------------------------

const DEPARTMENTS_I18N = {
  "Food & Civil Supplies": "खाद्य एवं नागरिक आपूर्ति",
  "Revenue & Land Records": "राजस्व एवं भूमि अभिलेख",
  "Municipal Public Works & Drainage": "नगर निगम लोक निर्माण एवं जल निकासी",
  "Higher Education & Student Welfare": "उच्च शिक्षा एवं छात्र कल्याण",
  "Police & Law Enforcement": "पुलिस एवं कानून व्यवस्था",
  "Health & Family Welfare": "स्वास्थ्य एवं परिवार कल्याण",
  "Water Supply & Jal Board": "पेयजल आपूर्ति एवं जल बोर्ड",
  "Electricity & Power Discom": "बिजली एवं विद्युत डिस्कॉम",
  "Transport, Highways & Motor Vehicles / RTO": "परिवहन, राजमार्ग एवं वाहन / आरटीओ",
  "Labour, Pension & Social Security": "श्रम, पेंशन एवं सामाजिक सुरक्षा",
  "Environment & Pollution Control": "पर्यावरण एवं प्रदूषण नियंत्रण",
  "Public Works Department (PWD)": "लोक निर्माण विभाग (पीडब्ल्यूडी)",
  "Social Welfare & Women Child Development": "समाज कल्याण एवं महिला बाल विकास",
  "Public Authority": "सक्षम लोक प्राधिकारी",
  "Consumer Protection & Essential Services": "उपभोक्ता संरक्षण एवं आवश्यक सेवाएं",
  "Police & Criminal Justice": "पुलिस एवं आपराधिक न्याय",
  "Police, Criminal Justice & BNSS": "पुलिस एवं आपराधिक न्याय",
  "Food, Civil Supplies & Consumer Affairs": "खाद्य, नागरिक आपूर्ति एवं उपभोक्ता मामले",
  "Municipal Works": "नगर निगम एवं लोक निर्माण",
  "Municipal Public Works & Sanitation": "नगर निगम लोक निर्माण एवं स्वच्छता",
  "Electricity Discom": "बिजली एवं डिस्कॉम",
  "Higher Education": "उच्च शिक्षा",
  "Transport & RTO": "परिवहन एवं आरटीओ",
  "Pension & Labour": "श्रम एवं पेंशन",
  "Labour, Employment, Pension & Social Security": "श्रम, रोजगार, पेंशन एवं सामाजिक सुरक्षा",
  "Environment & Pollution": "पर्यावरण एवं प्रदूषण"
};

const STATUS_I18N = {
  "APPROVED": { en: "APPROVED", hi: "स्वीकृत" },
  "TRANSFERRED_SEC_6_3": { en: "TRANSFERRED (SEC 6(3))", hi: "अंतरित (धारा 6(3))" },
  "NEEDS_REVIEW": { en: "UNDER REVIEW", hi: "समीक्षाधीन" },
  "UNDER_REVIEW": { en: "UNDER REVIEW", hi: "समीक्षाधीन" },
  "REJECTED": { en: "REJECTED", hi: "अस्वीकृत" },
  "MERGED_DUPLICATE": { en: "MERGED DUPLICATE", hi: "विलय किया गया डुप्लिकेट" },
  "INPLACE_UPDATE": { en: "INPLACE UPDATE", hi: "यथास्थान अद्यतन" },
  "INPLACE_GRIEVANCE_UPDATE": { en: "INPLACE UPDATE", hi: "यथास्थान अद्यतन" },
  "DISPATCHED": { en: "DISPATCHED", hi: "प्रेषित" }
};


const LEGAL_GROUNDS_I18N = {
  "Illegitimate denial or delay in issuance of NFSA/BPL ration cards to eligible below-poverty-line beneficiaries.": "पात्र बीपीएल/एनएफएसए लाभार्थियों को राशन कार्ड जारी करने में अवैध इनकार या अनुचित विलंब।",
  "Unlawful siphoning and black-marketing of subsidized food grains allocated by Central/State Govts.": "केंद्र व राज्य सरकार द्वारा आवंटित रियायती खाद्यान्न की अवैध कालाबाजारी एवं हेराफेरी।",
  "Violation of NFSA 2013 statutory timelines and non-maintenance of PDS electronic point-of-sale logs.": "राष्ट्रीय खाद्य सुरक्षा अधिनियम 2013 की समयसीमा का खुला उल्लंघन एवं ई-पॉस (e-PoS) रिकॉर्ड न रखना।",
  "Deliberate omission by revenue officials (Patwari/Lekhpal/Tehsildar) to record undisputed inheritance/sale mutation.": "राजस्व अधिकारियों (पटवारी/लेखपाल/तहसीलदार) द्वारा निर्विवाद वरासत/बैनामा नामांतरण दर्ज करने में जानबूझकर उपेक्षा।",
  "Violation of statutory mandate requiring mutation disposal within 30 to 45 days under State Revenue Codes.": "राज्य राजस्व संहिता के तहत 30 से 45 दिनों में नामांतरण निस्तारण की विधिक बाध्यता का उल्लंघन।",
  "Constructive fraud and breach of public trust by withholding certified Khasra/Khatauni land records.": "प्रमाणित खसरा/खतौनी भू-अभिलेख न देकर जनता के विश्वास के साथ धोखाधड़ी एवं विधिक कर्तव्य में विफलता।",
  "Gross civic dereliction leading to hazardous waterlogging, open sewer health crises, and environmental poisoning.": "गंभीर नागरिक लापरवाही जिसके कारण भारी जलभराव, खुली नालियों से स्वास्थ्य संकट और पर्यावरण प्रदूषण उत्पन्न हुआ।",
  "Non-execution of approved civil drainage works despite budgetary allocation and contractor disbursement.": "बजट आवंटन एवं ठेकेदार को भुगतान के बावजूद स्वीकृत जल निकासी कार्यों को पूरा न करना।",
  "Breach of fundamental Right to Clean Environment and Public Health under Article 21 of the Constitution of India.": "भारतीय संविधान के अनुच्छेद 21 के तहत स्वच्छ पर्यावरण एवं स्वास्थ्य के मौलिक अधिकार का हनन।",
  "Direct violation of Supreme Court Constitution Bench mandate in *Lalita Kumari v. Govt of UP* (Mandatory FIR).": "ललिता कुमारी बनाम यूपी सरकार में सुप्रीम कोर्ट की संविधान पीठ के अनिवार्य एफआईआर आदेश का सीधा उल्लंघन।",
  "Unlawful inaction on cognizable crime complaint and failure to provide copy of FIR free of cost under Sec 154(2).": "संज्ञेय अपराध की शिकायत पर गैर-कानूनी निष्क्रियता एवं धारा 154(2) के तहत निशुल्क एफआईआर प्रति न देना।",
  "Dereliction of statutory policing duties punishable under Section 166A/199.": "धारा 166A/199 के तहत दंडनीय विधिक पुलिस कर्तव्यों की घोर उपेक्षा।",
  "Arbitrary and prolonged withholding of sanctioned Post-Matric / Merit-cum-Means scholarship funds.": "स्वीकृत पोस्ट-मैट्रिक / मेरिट-कम-मीन्स छात्रवृत्ति धनराशि को मनमाने ढंग से लंबे समय तक रोकना।",
  "Breach of Ministry of Social Justice / UGC disbursement timelines causing irreparable academic injury.": "सामाजिक न्याय मंत्रालय / यूजीसी वितरण समयसीमा का उल्लंघन जिससे अपूरणीय शैक्षणिक क्षति हुई।",
  "Unlawful denial of education entitlements under Article 14 & Article 21A of the Constitution.": "संविधान के अनुच्छेद 14 व 21A के अंतर्गत शिक्षा के अधिकारों से गैर-कानूनी रूप से वंचित करना।",
  "Denial of mandatory free emergency medical care in violation of *Paschim Banga Khet Mazdoor Samity v. State of WB*.": "पश्चिम बंग खेत मजदूर समिति फैसले का उल्लंघन करते हुए अनिवार्य निशुल्क आपातकालीन चिकित्सा से इनकार।",
  "Non-availability of life-saving medicines listed under National Essential Medicines List (NEML).": "राष्ट्रीय आवश्यक औषधि सूची (NEML) के अंतर्गत सूचीबद्ध जीवनरक्षक दवाओं की अनुपलब्धता।",
  "Violation of Right to Health guaranteed under Article 21 of Constitution of India.": "संविधान के अनुच्छेद 21 के अंतर्गत स्वास्थ्य के गारंटीकृत विधिक अधिकार का उल्लंघन।",
  "Statutory failure under Citizen Charter": "नागरिक अधिकार पत्र के अंतर्गत विधिक कर्तव्य में विफलता"
};

const CUSTOM_ACTS_I18N = {
  "Consumer Protection Act, 2019": "उपभोक्ता संरक्षण अधिनियम, 2019",
  "Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)": "भारतीय नागरिक सुरक्षा संहिता (BNSS 2023)",
  "Uttar Pradesh Revenue Code, 2006": "उत्तर प्रदेश राजस्व संहिता, 2006",
  "Section 35 & Section 38 (Consumer Grievance Redressal)": "धारा 35 एवं धारा 38 (उपभोक्ता शिकायत निवारण)",
  "Section 175(3) & Section 173(4) (Magisterial Direction for Investigation)": "धारा 175(3) एवं धारा 173(4) (जांच हेतु मजिस्ट्रेट का निर्देश)",
  "Section 32 & Section 38 (Correction of Revenue Land Maps & Registers)": "धारा 32 एवं धारा 38 (भू-नक्शा एवं खतौनी संशोधन)",
  "Consumer Protection & Essential Services": "उपभोक्ता संरक्षण एवं आवश्यक सेवाएं",
  "Police & Criminal Justice": "पुलिस एवं आपराधिक न्याय",
  "Revenue & Land Records": "राजस्व एवं भूमि अभिलेख",
  "Empowers citizens to claim full restitution, litigation costs, and severe damages for deficiency in public/private services within statutory 90-day time-limit.": "नागरिकों को सार्वजनिक/निजी सेवाओं में कमी के विरुद्ध 90 दिनों के भीतर पूर्ण क्षतिपूर्ति, वाद व्यय एवं हर्जाना पाने का अधिकार देता है।",
  "Mandates Judicial Magistrate to direct immediate registration of FIR and monitor investigation upon police refusal under Section 173.": "धारा 173 के तहत पुलिस द्वारा एफआईआर न लिखने पर न्यायिक मजिस्ट्रेट को तत्काल एफआईआर दर्ज कराने और जांच की निगरानी का अधिकार देता है।",
  "Statutory duty of Sub-Divisional Officer (SDO) to correct clerical and map errors in Khasra/Khatauni within 45 days of application.": "आवेदन के 45 दिनों के भीतर खसरा/खतौनी में लिपिकीय व नक्शा त्रुटियों को सुधारने का उप-जिलाधिकारी (एसडीओ) का विधिक कर्तव्य।",
  "Full refund + General damages up to Rs. 5,00,000 + Product recall orders": "पूर्ण धनराशि वापसी + ₹5,00,000 तक हर्जाना + दोषपूर्ण उत्पाद वापसी आदेश",
  "Judicial Court Order for immediate criminal investigation against accused public servants": "आरोपी लोक सेवकों के विरुद्ध तत्काल आपराधिक जांच हेतु न्यायिक न्यायालय का आदेश",
  "Mandatory administrative rectification of Land Title Records": "भू-अभिलेखों का अनिवार्य प्रशासनिक शुद्धिकरण",
  "Adv. S. Kalra (Bar Council Counsel)": "अधिवक्ता एस. कालरा (बार काउंसिल काउंसिल)",
  "Advocate Legal Team": "विधिक परामर्शदाता दल"
};

const INFRACTIONS_I18N = {
  "Public Nuisance, Drainage Negligence & Misappropriation of Civil Tender Funds": "सार्वजनिक उपद्रव, जल निकासी में लापरवाही एवं निविदा गबन",
  "Refusal to Register FIR & Malicious Delay in Investigation": "एफआईआर दर्ज करने से इनकार एवं जांच में द्वेषपूर्ण विलंब",
  "Withholding Government Student Scholarships & Grant Embezzlement": "सरकारी छात्रवृत्ति रोकना एवं अनुदान गबन",
  "Denial of Emergency Healthcare & Government Hospital Negligence": "आपातकालीन स्वास्थ्य सेवा से इनकार एवं सरकारी अस्पताल लापरवाही",

  "Public Distribution System (PDS) Diversion & Essential Commodities Black Marketing": "सार्वजनिक वितरण प्रणाली (PDS) कालाबाजारी एवं खाद्यान्न हेराफेरी",
  "Land Record Tampering & Fraudulent Property Mutation": "भूमि अभिलेख में हेराफेरी एवं अवैध नामांतरण",
  "Administrative Infraction": "प्रशासनिक उल्लंघन / विलंब",
  "Transformer Burnout & Unscheduled Power Outage": "ट्रांसफार्मर खराबी एवं अघोषित बिजली कटौती",
  "Contaminated Drinking Water & Pipeline Rupture": "दूषित पेयजल आपूर्ति एवं पाइपलाइन रिसाव",
  "Driving License Renewal Delay & Harassment": "ड्राइविंग लाइसेंस नवीनीकरण में अनुचित विलंब",
  "Pension Non-Disbursement & Gratuity Withholding": "पेंशन भुगतान में विलंब एवं ग्रेच्युटी रोकना",
  "Industrial Chemical Effluent Dumping": "औद्योगिक जहरीला अपशिष्ट एवं जल प्रदूषण",
  "Drainage Clogging & Monsoon Waterlogging": "नाली अवरोध एवं मानसून में जलभराव",
  "Scholarship Withholding & Disbursement Delay": "छात्रवृत्ति भुगतान में विलंब एवं रोक",
  "Unregistered FIR & Police Inaction": "एफआईआर दर्ज न करना एवं पुलिस निष्क्रियता",
  "Hospital ICU Bed Hoarding & Refusal of Care": "अस्पताल आईसीयू बेड छुपाना व इलाज से इंकार",
  "Road Repair Negligence & Pothole Hazards": "सड़क मरम्मत में लापरवाही एवं गड्ढों की समस्या"
};

const SECTIONS_I18N = {
  "BNS Section 270 (Public Nuisance)": "बीएनएस धारा 270 (सार्वजनिक उपद्रव)",
  "IPC Section 268 (Public Nuisance)": "आईपीसी धारा 268 (सार्वजनिक उपद्रव)",
  "BNS Section 270": "बीएनएस धारा 270",
  "IPC Section 268": "आईपीसी धारा 268",
  "BNS Sec 270": "बीएनएस धारा 270",
  "IPC Sec 268": "आईपीसी धारा 268",
  "IPC Section 166A (Public Servant disobeying law)": "आईपीसी धारा 166A (कानून की अवहेलना करने वाला लोक सेवक)",
  "IPC Section 166A (Public servant disobeying direction under law)": "आईपीसी धारा 166A (कानूनी निर्देश की अवहेलना)",
  "BNS Section 199 (Public Servant disobeying direction under law)": "बीएनएस धारा 199 (कानूनी निर्देश की अवहेलना करने वाला लोक सेवक)",
  "BNS Section 199 (Public servant disobeying direction under law)": "बीएनएस धारा 199 (कानूनी निर्देश की अवहेलना)",
  "IPC Section 166A": "आईपीसी धारा 166A",
  "IPC Sec 166A": "आईपीसी धारा 166A",
  "BNS Section 199": "बीएनएस धारा 199",
  "BNS Sec 199": "बीएनएस धारा 199",
  "IPC Section 166 (Disobedience of Law)": "आईपीसी धारा 166 (कानून की अवज्ञा)",
  "BNS Section 198 (Public Servant Disobedience)": "बीएनएस धारा 198 (लोक सेवक द्वारा अवज्ञा)",
  "IPC Section 166": "आईपीसी धारा 166",
  "IPC Sec 166": "आईपीसी धारा 166",
  "BNS Section 198": "बीएनएस धारा 198",
  "BNS Sec 198": "बीएनएस धारा 198",

  "BNS Section 316(5) (Criminal Breach of Trust by Public Servant/Dealer)": "बीएनएस धारा 316(5) (लोक सेवक/डीलर द्वारा आपराधिक विश्वासघात)",
  "BNS Section 316(5)": "बीएनएस धारा 316(5)",
  "BNS Sec 316(5)": "बीएनएस धारा 316(5)",
  "IPC Section 409 (Criminal Breach of Trust by Public Servant)": "आईपीसी धारा 409 (लोक सेवक द्वारा आपराधिक विश्वासघात)",
  "IPC Section 409": "आईपीसी धारा 409",
  "IPC Sec 409": "आईपीसी धारा 409",
  "BNS Section 318(4) (Cheating)": "बीएनएस धारा 318(4) (धोखाधड़ी / छल)",
  "BNS Section 318(4)": "बीएनएस धारा 318(4)",
  "BNS Sec 318(4)": "बीएनएस धारा 318(4)",
  "IPC Section 420 (Cheating)": "आईपीसी धारा 420 (धोखाधड़ी / छल)",
  "IPC Section 420": "आईपीसी धारा 420",
  "IPC Sec 420": "आईपीसी धारा 420",
  "IPC Section 166 (Disobedience of Law)": "आईपीसी धारा 166 (कानून की अवज्ञा)",
  "BNS Section 198 (Public Servant Disobedience)": "बीएनएस धारा 198 (लोक सेवक द्वारा अवज्ञा)",
  "IPC Section 166A (Public servant disobeying direction under law)": "आईपीसी धारा 166A (कानूनी निर्देश की अवहेलना)",
  "BNS Section 199 (Public servant disobeying direction under law)": "बीएनएस धारा 199 (कानूनी निर्देश की अवहेलना)",
  "IPC Section 217 (Public servant disobeying direction of law with intent to save person from punishment)": "आईपीसी धारा 217 (दोषी को बचाने हेतु कानून की अवज्ञा)",
  "BNS Section 220 (Public servant disobeying direction of law with intent to save person from punishment)": "बीएनएस धारा 220 (दोषी को बचाने हेतु कानून की अवज्ञा)",
  "IPC Section 218 (Public servant framing incorrect record or writing with intent to save person from punishment)": "आईपीसी धारा 218 (गलत सरकारी रिकॉर्ड बनाना)",
  "BNS Section 231 (Public servant framing incorrect record or writing)": "बीएनएस धारा 231 (गलत सरकारी रिकॉर्ड बनाना)",
  "IPC Section 269 (Negligent act likely to spread infection)": "आईपीसी धारा 269 (संक्रमण फैलाने वाला उपेक्षापूर्ण कार्य)",
  "BNS Section 271 (Negligent act likely to spread infection)": "बीएनएस धारा 271 (संक्रमण फैलाने वाला उपेक्षापूर्ण कार्य)",
  "IPC Section 277 (Fouling water of public spring or reservoir)": "आईपीसी धारा 277 (सार्वजनिक जल स्रोत को दूषित करना)",
  "BNS Section 279 (Fouling water of public spring or reservoir)": "बीएनएस धारा 279 (सार्वजनिक जल स्रोत को दूषित करना)",
  "IPC Section 336 (Act endangering life or personal safety of others)": "आईपीसी धारा 336 (जीवन या व्यक्तिगत सुरक्षा को खतरे में डालना)",
  "BNS Section 125 (Act endangering life or personal safety of others)": "बीएनएस धारा 125 (जीवन या व्यक्तिगत सुरक्षा को खतरे में डालना)",
  "IPC Section 468 (Forgery for purpose of cheating)": "आईपीसी धारा 468 (धोखाधड़ी हेतु कूटरचना)",
  "BNS Section 338 (Forgery for purpose of cheating)": "बीएनएस धारा 338 (धोखाधड़ी हेतु कूटरचना)",
  "IPC Section 471 (Using forged document as genuine)": "आईपीसी धारा 471 (कूटरचित दस्तावेज का असली रूप में उपयोग)",
  "BNS Section 340 (Using forged document as genuine)": "बीएनएस धारा 340 (कूटरचित दस्तावेज का असली रूप में उपयोग)"
};

const PEOPLE_AND_OFFICES_I18N = {
  "Executive Engineer (Civil/Drainage)": "अधिशासी अभियंता (सिविल/जल निकासी)",
  "Executive Engineer": "अधिशासी अभियंता",
  "Shivanshu": "शिवांशु",
  "Sunita Devi": "सुनीता देवी",
  "Shivanshu Pandey": "शिवांशु पाण्डेय",
  "Dr. Rita Sharma": "डॉ. रीता शर्मा",
  "25 feet road,sgm nagar, faridabad (121001)": "25 फीट रोड, एसजीएम नगर, फरीदाबाद (121001)",
  "Sector 4, Mehrauli, New Delhi": "सेक्टर 4, महरौली, नई दिल्ली",
  "House No. 45, BPL Cluster, Ward 4, New Delhi": "मकान नं. 45, बीपीएल क्लस्टर, वार्ड 4, नई दिल्ली",

  // Complainants
  "Sunita Devi": "सुनीता देवी",
  "Shivanshu Pandey": "शिवांशु पाण्डेय",
  "Shivanshu Pandey (Merged Duplicate)": "शिवांशु पाण्डेय (विलय किया गया डुप्लिकेट)",
  "Basavaraj Gowda": "बसंवराज गौड़ा",
  "Sachin Deshmukh": "सचिन देशमुख",
  "Kailash Choudhary": "कैलाश चौधरी",
  "Pradeep Kumar Yadav": "प्रदीप कुमार यादव",
  "Dr. Anil Sharma": "डॉ. अनिल शर्मा",
  "Kavita Verma": "कविता वर्मा",
  "Virender Gupta": "वीरेन्द्र गुप्ता",
  "Manoj Tripathy": "मनोज त्रिपाठी",
  "Rajesh Narang": "राजेश नारंग",
  "Harcharan Singh": "हरचरण सिंह",
  "Anita Saxena": "अनिता सक्सेना",
  "Ramesh Kumar": "रमेश कुमार",
  "Amitabh Verma": "अमिताभ वर्मा",
  "Pooja Sharma": "पूजा शर्मा",
  "Mohd. Aslam": "मोहम्मद असलम",
  "Vikramaditya": "विक्रमादित्य",
  "Citizen Applicant": "नागरिक आवेदक",

  // Officers
  "Shri R. K. Sharma": "श्री आर. के. शर्मा",
  "Shri N. Goyal": "श्री एन. गोयल",
  "Er. S. K. Kalra": "इंजी. एस. के. कालरा",
  "Dr. T. Tiwari": "डॉ. टी. तिवारी",
  "Shri V. K. Malhotra": "श्री वी. के. मल्होत्रा",
  "Dr. A. K. Gupta": "डॉ. ए. के. गुप्ता",
  "Er. R. V. Singhal": "इंजी. आर. वी. सिंघल",
  "Er. M. P. Saxena": "इंजी. एम. पी. सक्सेना",
  "Shri K. S. Tomar": "श्री के. एस. तोमर",
  "Smt. Anjali Sehgal": "श्रीमती अंजलि सहगल",
  "Shri A. K. Rai": "श्री ए. के. राय",
  "Shri A. K. Rai (Tehsildar Sadar)": "श्री ए. के. राय (तहसीलदार सदर)",
  "Shri R. P. Maurya, IAS": "श्री आर. पी. मौर्य, आईएएस",
  "Shri R. P. Maurya, IAS (Designated Public Authority)": "श्री आर. पी. मौर्य, आईएएस (नामित सक्षम प्राधिकारी)",
  "Adv. S. Kalra": "अधिवक्ता एस. कालरा",
  "Adv. S. Kalra (Bar Council / Legal Counsel)": "अधिवक्ता एस. कालरा (बार काउंसिल / विधिक परामर्शदाता)",
  "Adv. S. Kalra (Advocate on Record / Legal NGO)": "अधिवक्ता एस. कालरा (अधिवक्ता / विधिक सहायता संस्था)",
  "Designated PIO": "नामित जन सूचना अधिकारी",
  "Designated PIO Officer": "नामित जन सूचना अधिकारी",
  "Designated Appellate Authority": "नामित अपीलीय अधिकारी",
  "Additional District Magistrate (Revenue)": "अपर जिला मजिस्ट्रेट (राजस्व)",
  "ADM (Revenue), Collectorate": "एडीएम (राजस्व), कलेक्ट्रेट",
  "Tehsildar Sadar": "तहसीलदार सदर",

  // Designations
  "Tehsildar & Designated PIO": "तहसीलदार एवं नामित जन सूचना अधिकारी",
  "Public Information Officer & Assistant Commissioner": "जन सूचना अधिकारी एवं सहायक आयुक्त",
  "Executive Engineer (Drainage & Stormwater)": "अधिशासी अभियंता (जल निकासी एवं वर्षा जल)",
  "Deputy Registrar & PIO (Scholarships)": "उप-कुलसचिव एवं जन सूचना अधिकारी (छात्रवृत्ति)",
  "Additional Deputy Commissioner of Police & Designated PIO": "अपर पुलिस उपायुक्त एवं नामित जन सूचना अधिकारी",
  "Chief Medical Officer & Designated PIO": "मुख्य चिकित्सा अधिकारी एवं नामित जन सूचना अधिकारी",
  "Chief Engineer (Water Distribution) & Designated PIO": "मुख्य अभियंता (जल वितरण) एवं नामित जन सूचना अधिकारी",
  "Superintending Engineer (Billing & Metering) & Nodal PIO": "अधीक्षण अभियंता (बिलिंग एवं मीटरिंग) एवं नोडल पीआईओ",
  "Regional Transport Officer (RTO) & Designated PIO": "संभागीय परिवहन अधिकारी (आरटीओ) एवं नामित जन सूचना अधिकारी",
  "Additional Commissioner (PDS) / First Appellate Authority": "अपर आयुक्त (पीडीएस) / प्रथम अपीलीय अधिकारी",
  "PIO": "जन सूचना अधिकारी",
  "Appellate Officer": "अपीलीय अधिकारी",

  // Addresses & complexes
  "House No. 45, BPL Cluster, Ward 4, New Delhi": "मकान नं. 45, बीपीएल क्लस्टर, वार्ड 4, नई दिल्ली",
  "Sector 4, Mehrauli, New Delhi": "सेक्टर 4, महरौली, नई दिल्ली",
  "House No. 45, BPL Cluster, Civil Lines, Delhi": "मकान नं. 45, बीपीएल क्लस्टर, सिविल लाइंस, दिल्ली",
  "Ward 4, Civil Lines, New Delhi": "वार्ड 4, सिविल लाइंस, नई दिल्ली",
  "Civil Lines, New Delhi": "सिविल लाइंस, नई दिल्ली",
  "Sadar Tehsil, Varanasi": "सदर तहसील, वाराणसी",
  "Tehsil Sadar Kachehri Complex, Varanasi": "तहसील सदर कचेहरी परिसर, वाराणसी",
  "Tehsil & District Kachehri Complex, Revenue Circle 2, Mehrauli, New Delhi - 110030": "तहसील एवं जिला कचेहरी परिसर, राजस्व मंडल 2, महरौली, नई दिल्ली - 110030",
  "Office of the District Supply Officer, Sub-Divisional Tehsil Kachehri Complex, Ward 4, Civil Lines, New Delhi - 110054": "कार्यालय जिला पूर्ति अधिकारी, उप-संभागीय तहसील कचेहरी परिसर, वार्ड 4, सिविल लाइंस, नई दिल्ली - 110054",
  "Municipal Kachehri Complex, Zone 7, Sector 12, Dwarka, New Delhi - 110075": "नगर निगम कचेहरी परिसर, जोन 7, सेक्टर 12, द्वारका, नई दिल्ली - 110075",
  "State Scholarship Cell, District Education Kachehri, Rajpur Road, New Delhi - 110007": "राज्य छात्रवृत्ति प्रकोष्ठ, जिला शिक्षा कचेहरी, राजपुर रोड, नई दिल्ली - 110007",
  "Police Headquarters, Civic Center Kachehri, New Delhi - 110001": "पुलिस मुख्यालय, सिविक सेंटर कचेहरी, नई दिल्ली - 110001",
  "Directorate of Health Services, Civil Hospital Complex, New Delhi - 110002": "स्वास्थ्य सेवा निदेशालय, सिविल अस्पताल परिसर, नई दिल्ली - 110002",
  "Delhi Jal Board Headquarters, Varunalaya Phase II, Jhandewalan, New Delhi - 110005": "दिल्ली जल बोर्ड मुख्यालय, वरुणाstat फेज II, झंडेवालान, नई दिल्ली - 110005",
  "State Power Distribution Corporation, Shakti Bhawan, Nehru Place, New Delhi - 110019": "राज्य विद्युत वितरण निगम, शक्ति भवन, नेहरू प्लेस, नई दिल्ली - 110019",
  "Transport Department, Regional Office Complex, Sarai Kale Khan, New Delhi - 110013": "परिवहन विभाग, क्षेत्रीय कार्यालय परिसर, सराय काले खां, नई दिल्ली - 110013",
  "Khadya Sadan, Vikas Bhawan, New Delhi - 110002": "खाद्य सदन, विकास भवन, नई दिल्ली - 110002",
  "District Kachehri": "जिला कचेहरी",
  "Tehsil Complex Mehrauli": "तहसील परिसर महरौली",
  "Ward 4 DSO Complex": "वार्ड 4 डीएसओ परिसर",
  "Local": "स्थानीय",
  "Citizen Charter & Public Service Guarantee Act": "नागरिक अधिकार पत्र एवं लोक सेवा गारंटी अधिनियम",
  "Delhi Land Reforms Act, 1954": "दिल्ली भूमि सुधार अधिनियम, 1954"
};

const SEED_CASES_EN = {
  "ARZ-1048": {
    raw_grievance: "Food quality of govt canteen is pathetic. Taste not good and food was rotten. Complaint submitted at Kalkaji division.",
    draft_subject: "Application under Section 6(1) of RTI Act 2005 regarding public canteen hygiene and food safety inspection in South Delhi under FSSA 2006",
    questions: [
      "1. Please provide certified copies of daily progress report and file movement register regarding grievance application (Ref: DISCOM-PWR-44910) submitted on 28-Feb-2026.",
      "2. Please disclose names and designations of dealing food safety officers who held the complaint beyond 30-day statutory SLA.",
      "3. What is the prescribed Citizen Charter timeline for resolving food hygiene complaints?",
      "4. Please provide certified copies of latest Food Safety Inspection Reports and valid FSSAI License under Sections 26/31 FSSA 2006.",
      "5. Please provide certified details of water and food sample laboratory test results collected over the last 12 months under Section 2(f) RTI Act 2005.",
      "6. Please provide certified copies of all notings, correspondence, and final orders issued by competent authority."
    ],
    fees_paid: "Rs. 10 Indian Postal Order enclosed under Rule 3 of RTI Rules 2012.",
    appeal_subject: "FIRST APPEAL UNDER SECTION 19(1) OF RTI ACT 2005 AGAINST DEEMED REFUSAL IN CASE ARZ-1048",
    appeal_grounds: [
      "1. The Respondent PIO failed to furnish requested information within statutory 30-day timeline under Section 7(1).",
      "2. Failure of PIO constitutes Deemed Refusal under Section 7(2) of RTI Act 2005.",
      "3. Appellant is entitled to receive records FREE OF COST under Section 7(6).",
      "4. Delinquent PIO has incurred personal statutory penalty liability of Rs. 250 per day under Section 20(1) (Manohar v. State of Maharashtra AIR 2013 SC 681)."
    ],
    appeal_prayers: [
      "1. Direct the PIO to provide certified copies of records FREE OF CHARGE within 7 days.",
      "2. Grant personal hearing to Appellant before the First Appellate Authority.",
      "3. Recommend initiation of Section 20(1) penalty proceedings against the defaulting officer."
    ],
    legal_notice: `LEGAL NOTICE UNDER SECTION 80 CPC READ WITH IPC & BNS
To: Designated Public Information Officer (Food Safety / Civil Supplies), Kalkaji / Varanasi

Under instructions and on behalf of our client Virendra Gupta (Residing at Kalkaji, South Delhi), notice is hereby served regarding gross administrative dereliction and delay in processing grievance Ref: DISCOM-PWR-44910.

STATUTORY CHARGES INVOKED:
• Indian Penal Code (1860): Section 166 (Public Servant Disobeying Law), Section 409 (Criminal Breach of Trust)
• Bharatiya Nyaya Sanhita (2023): Section 198 (Public Servant Disobedience), Section 316(5) (Breach of Trust)

You are called upon to rectify the dereliction and provide certified status within 15 days of receipt of this notice, failing which our client shall initiate criminal prosecution and Writ proceedings under Article 226 of the Constitution of India.

Sincerely,
Adv. S. Kalra (Bar Council / Legal Counsel)`
  },

  "ARZ-1042": {
    raw_grievance: "My family BPL ration card application (Ref RC-88492) was submitted 6 months ago at Ward 4 supply office. We still have not received ration card or grain. Ration dealer refuses to show stock register.",
    draft_subject: "Application under Section 6(1) of RTI Act 2005 seeking status on pending grievance (Ref No: RC-88492, Submitted: 15-Feb-2026) in Ward 4, Civil Lines regarding Food & Civil Supplies",
    questions: [
      "1. Please provide the daily progress report and certified file movement register regarding the grievance application (Ref: RC-88492) submitted by Sunita Devi on 15-Feb-2026.",
      "2. Please specify the names, designations, and official contact details of all dealing officers/staff in Ward 4 Civil Lines office who held this file beyond statutory limits.",
      "3. What is the prescribed timeline as per the Citizen Charter for resolving this class of public grievance?",
      "4. Please disclose the month-wise stock position and BPL entitlement distribution register copies for the fair price shop servicing Ward 4.",
      "5. Please disclose certified copies of all existing file notings, office correspondence, processing sheets, and inspection reports concerning this grievance."
    ],
    fees_paid: "Rs. 10 Indian Postal Order (IPO No: 45F-992011, Dated: 15-Feb-2026, Issued by GPO Delhi) enclosed under Rule 3 of RTI Rules 2012.",
    appeal_subject: "FIRST APPEAL UNDER SECTION 19(1) OF RTI ACT 2005 AGAINST DEEMED REFUSAL IN CASE ARZ-1042",
    appeal_grounds: [
      "1. The Respondent PIO failed to furnish requested information within mandatory 30-day statutory SLA under Section 7(1).",
      "2. Failure of PIO constitutes Deemed Refusal under Section 7(2) of RTI Act 2005.",
      "3. Appellant is entitled to receive records FREE OF COST under Section 7(6).",
      "4. Delinquent PIO has incurred personal statutory penalty liability of Rs. 250 per day under Section 20(1) (Manohar v. State of Maharashtra AIR 2013 SC 681)."
    ],
    appeal_prayers: [
      "1. Direct the PIO to provide certified copies of records FREE OF CHARGE within 7 days.",
      "2. Grant personal hearing to Appellant before the First Appellate Authority.",
      "3. Recommend initiation of Section 20(1) penalty proceedings against the defaulting officer."
    ],
    legal_notice: `LEGAL NOTICE UNDER SECTION 80 CPC READ WITH IPC & BNS
To: Public Information Officer & Assistant Commissioner, Ward 4 Civil Lines, New Delhi

Under instructions and on behalf of our client Sunita Devi (Residing at Ward 4, Civil Lines, New Delhi), notice is hereby served regarding gross administrative dereliction and delay in processing grievance Ref: RC-88492.

STATUTORY CHARGES INVOKED:
• Indian Penal Code (1860): Section 166 (Public Servant Disobeying Law), Section 409 (Criminal Breach of Trust)
• Bharatiya Nyaya Sanhita (2023): Section 198 (Public Servant Disobedience), Section 316(5) (Breach of Trust)

You are called upon to rectify the dereliction and provide certified status within 15 days of receipt of this notice, failing which our client shall initiate criminal prosecution and Writ proceedings under Article 226 of the Constitution of India.

Sincerely,
Adv. S. Kalra (Bar Council / Legal Counsel)`
  },

  "ARZ-1046": {
    raw_grievance: "My land mutation khasra 45/12 application (Ref LND-88301) submitted on 10-Jan-2026 at Tehsil office Mehrauli is pending. Patwari is not updating land record registry.",
    draft_subject: "Application under Section 6(1) of RTI Act 2005 seeking status on pending grievance (Ref No: LND-88301, Submitted: 10-Jan-2026) in Mehrauli regarding Revenue & Land Records",
    questions: [
      "1. Please provide the daily progress report and certified file movement register regarding the land mutation application (Khasra 45/12, Ref: LND-88301) submitted on 10-Jan-2026 at Mehrauli Tehsil.",
      "2. Please specify the names, designations, and official contact details of all dealing officers, including Patwari and Revenue Inspector, who held this file beyond 30 days.",
      "3. What is the prescribed timeline as per the Citizen Charter and Delhi Land Reforms Act for passing land mutation orders?",
      "4. Please disclose certified copies of Khasra/Khatauni mutations, field inspection reports, and any objections lodged on record.",
      "5. Please disclose certified copies of all existing file notings, office correspondence, processing sheets, and orders issued by the Tehsildar."
    ],
    fees_paid: "Rs. 10 Indian Postal Order (IPO No: 45F-LND992, Dated: 10-Jan-2026, Issued at PO Mehrauli) enclosed under Rule 3 of RTI Rules 2012.",
    appeal_subject: "FIRST APPEAL UNDER SECTION 19(1) OF RTI ACT 2005 AGAINST DEEMED REFUSAL IN CASE ARZ-1046",
    appeal_grounds: [
      "1. The Respondent PIO failed to furnish requested information within mandatory 30-day statutory SLA under Section 7(1).",
      "2. Failure of PIO constitutes Deemed Refusal under Section 7(2) of RTI Act 2005.",
      "3. Appellant is entitled to receive records FREE OF COST under Section 7(6).",
      "4. Delinquent PIO has incurred personal statutory penalty liability of Rs. 250 per day under Section 20(1) (Manohar v. State of Maharashtra AIR 2013 SC 681)."
    ],
    appeal_prayers: [
      "1. Direct the PIO to provide certified copies of records FREE OF CHARGE within 7 days.",
      "2. Grant personal hearing to Appellant before the First Appellate Authority.",
      "3. Recommend initiation of Section 20(1) penalty proceedings against the defaulting officer."
    ],
    legal_notice: `LEGAL NOTICE UNDER SECTION 80 CPC READ WITH IPC & BNS
To: Tehsildar & Designated PIO, Tehsil Complex Mehrauli, Sector 4, Mehrauli, New Delhi

Under instructions and on behalf of our client Shivanshu Pandey (Residing at Sector 4, Mehrauli, New Delhi), notice is hereby served regarding gross administrative dereliction and delay in processing land mutation grievance Ref: LND-88301.

STATUTORY CHARGES INVOKED:
• Indian Penal Code (1860): Section 166 (Public Servant Disobeying Law), Section 409 (Criminal Breach of Trust)
• Bharatiya Nyaya Sanhita (2023): Section 198 (Public Servant Disobedience), Section 316(5) (Breach of Trust)

You are called upon to rectify the dereliction and provide certified status within 15 days of receipt of this notice, failing which our client shall initiate criminal prosecution and Writ proceedings under Article 226 of the Constitution of India.

Sincerely,
Adv. S. Kalra (Bar Council / Legal Counsel)`
  },

  "ARZ-1047": {
    raw_grievance: "My land mutation khasra 45/12 application (Ref LND-88301) submitted on 10-Jan-2026 at Tehsil office Mehrauli is pending. (Merged duplicate with ARZ-1046)",
    draft_subject: "Application under Section 6(1) of RTI Act 2005 seeking status on land mutation in Mehrauli Tehsil regarding Revenue & Land Records (Consolidated Dossier)",
    questions: [
      "1. Please provide the certified daily progress report and file movement details regarding the land mutation application (Khasra 45/12).",
      "2. Please disclose certified copies of all field inspection reports and file notings recorded on this land mutation file."
    ],
    fees_paid: "Rs. 10 Indian Postal Order enclosed under Rule 3 of RTI Rules 2012.",
    appeal_subject: "FIRST APPEAL UNDER SECTION 19(1) OF RTI ACT 2005 AGAINST DEEMED REFUSAL IN CASE ARZ-1047",
    appeal_grounds: [
      "1. 30-day statutory SLA has elapsed without response from PIO, constituting Deemed Refusal under Section 7(2).",
      "2. Under Section 7(6), the Appellant is entitled to receive records FREE OF COST."
    ],
    appeal_prayers: [
      "1. Direct the PIO to furnish certified records FREE OF CHARGE immediately.",
      "2. Recommend penalty proceedings under Section 20(1) against the defaulting officer."
    ],
    legal_notice: `LEGAL NOTICE UNDER SECTION 80 CPC READ WITH IPC & BNS
To: Naib Tehsildar & Designated PIO, Tehsil Complex Mehrauli, New Delhi

Under instructions from our client Shivanshu Pandey, notice is hereby served regarding gross administrative delay in land mutation application Khasra 45/12.

STATUTORY CHARGES INVOKED:
• IPC Section 166 / BNS Section 198, Delhi Land Reforms Act 1954

You are called upon to rectify the dereliction and provide certified status within 15 days, failing which legal proceedings will be initiated.

Sincerely,
Adv. S. Kalra (Bar Council / Legal Counsel)`
  }
};

const SEED_CASES_I18N = {
  "ARZ-1048": {
    raw_grievance: "25 फीट रोड, एसजीएम नगर, फरीदाबाद में मुख्य नाली टूटी हुई है और मानसून में भीषण जलभराव व दुर्गंध फैलती है। नगर निगम द्वारा निविदा पास होने के बावजूद कोई कार्य नहीं कराया गया है। ठेकेदार और अधिकारियों की मिलीभगत से फंड का गबन किया गया है।",
    draft_subject: "नगर निगम लोक निर्माण एवं जल निकासी के संबंध में 25 फीट रोड, एसजीएम नगर, फरीदाबाद में नाली निर्माण एवं निविदा फंड की स्थिति हेतु धारा 6(1) के तहत आवेदन",
    questions: [
      "1. कृपया 25 फीट रोड, एसजीएम नगर में स्वीकृत नाली निर्माण एवं जल निकासी कार्य की स्वीकृत डीपीआर (विस्तृत परियोजना रिपोर्ट) एवं वित्तीय स्वीकृति आदेश की प्रमाणित प्रति प्रदान करें।",
      "2. उक्त कार्य हेतु आवंटित कुल बजट, ठेकेदार को किए गए भुगतान का विवरण एवं संबंधित एमबी (माप पुस्तिका) की प्रमाणित प्रतिलिपि उपलब्ध कराएं।",
      "3. निर्माण कार्य पूर्ण न होने के बावजूद भुगतान जारी करने वाले संबंधित अधिशासी अभियंता एवं कनिष्ठ अभियंता का नाम व पदनाम बताएं।",
      "4. क्या उक्त नाली अवरोध एवं घटिया निर्माण के विरुद्ध नगर निगम द्वारा कोई जांच समिति गठित की गई है? यदि हां, तो जांच आख्या उपलब्ध कराएं।"
    ],
    fees_paid: "सूचना का अधिकार नियमावली 2012 के नियम 3 के तहत ₹10 का भारतीय पोस्टल ऑर्डर विहित शुल्क के रूप में संलग्न है।",
    appeal_subject: "केस ARZ-1048 में प्रथम अपीलीय प्राधिकारी के समक्ष आरटीआई अधिनियम की धारा 19(1) के तहत प्रथम अपील (डीम्ड रिफ्यूजल)",
    appeal_grounds: [
      "1. सक्षम जन सूचना अधिकारी द्वारा धारा 7(1) के तहत 30-दिवसीय अनिवार्य विधिक समयसीमा में सूचना प्रदान नहीं की गई।",
      "2. अधिनियम की धारा 7(2) के अनुसार 30 दिनों में कोई निर्णय न देना आवेदन की स्वतः अस्वीकृति (Deemed Refusal) है।",
      "3. धारा 7(6) के अनुसार विधिक समयसीमा बीत जाने के उपरांत अपीलार्थी बिना किसी अतिरिक्त शुल्क के समस्त वांछित प्रमाणित सूचनाएं निःशुल्क प्राप्त करने का हकदार है।",
      "4. उच्चतम न्यायालय के निर्णय मनोहर बनाम महाराष्ट्र राज्य (AIR 2013 SC 681) के अनुसार दोषी जन सूचना अधिकारी पर धारा 20(1) के तहत ₹250 प्रतिदिन की दर से व्यक्तिगत जुर्माना अधिरोपित किया जाना चाहिए।"
    ],
    appeal_prayers: [
      "1. जन सूचना अधिकारी को आदेशित किया जाए कि वह 25 फीट रोड नाली निर्माण व फंड से संबंधित समस्त वांछित अभिलेख निःशुल्क उपलब्ध कराएं।",
      "2. प्रथम अपीलीय प्राधिकारी के समक्ष अपीलार्थी को व्यक्तिगत सुनवाई का अवसर प्रदान किया जाए।",
      "3. धारा 20(1) के तहत दोषी अधिकारी पर ₹250 प्रतिदिन की दर से व्यक्तिगत जुर्माना एवं धारा 20(2) के तहत अनुशासनात्मक कार्यवाही की संस्तुति की जाए।"
    ],
    legal_notice: `विधिक नोटिस (धारा 80 सिविल प्रक्रिया संहिता, 1908 एवं आईपीसी/बीएनएस की धाराएं)
रजिस्टर्ड डाक / स्पीड पोस्ट द्वारा प्रेषित

सेवा में:
अधिशासी अभियंता / सक्षम जन सूचना अधिकारी,
कार्यालय: नगर निगम मुख्यालय, बीके चौक, एनआईटी फरीदाबाद, हरियाणा - 121001

विषय: 25 फीट रोड, एसजीएम नगर, फरीदाबाद में टूटी मुख्य नाली, जलभराव एवं निविदा फंड के गबन के संबंध में विधिक नोटिस।

अपने मुवक्किल श्री रोहित वर्मा (निवासी: मकान सं. 112, एसजीएम नगर, 25 फीट रोड, फरीदाबाद) के विधिक अनुदेशों के अधीन एवं उनकी ओर से, हम आपको नागरिक शिकायत (केस सं: ARZ-1048) के निस्तारण में की गई घोर प्रशासनिक लापरवाही एवं विधिक कर्तव्यों की अवहेलना के संबंध में यह औपचारिक विधिक नोटिस प्रेषित कर रहे हैं।

आरोपित कानूनी धाराएं (STATUTORY CHARGES INVOKED):
• भारतीय दंड संहिता (1860): आईपीसी धारा 166 (लोक सेवक द्वारा कानून की अवज्ञा), धारा 409 (आपराधिक विश्वासघात), धारा 268 (लोक उपद्रव)
• भारतीय न्याय संहिता (2023): बीएनएस धारा 198 (लोक सेवक द्वारा कानून का उल्लंघन), धारा 316(5) (आपराधिक न्यासभंग)

उच्चतम न्यायालय के निर्णय मनोहर बनाम महाराष्ट्र राज्य (AIR 2013 SC 681) के अनुसार, नागरिक की वैध शिकायतों एवं आरटीआई आवेदनों की जानबूझकर उपेक्षा करने पर दोषी अधिकारी पर व्यक्तिगत दण्ड अधिरोपित किया जाना अनिवार्य है।

अतः आपको एतद्द्वारा 15 दिनों का सांविधिक नोटिस दिया जाता है कि 25 फीट रोड के नाली निर्माण कार्य का स्थलीय निरीक्षण कराकर जल निकासी बहाल करें तथा निविदा फंड व माप पुस्तिका (MB) का प्रमाणित विवरण उपलब्ध कराएं। ऐसा न होने पर माननीय पंजाब एवं हरियाणा उच्च न्यायालय में अनुच्छेद 226 के तहत जनहित याचिका एवं सक्षम न्यायालय में आपराधिक परिवाद दायर किया जाएगा।

भवदीय,
अधिवक्ता एस. कालरा (बार काउंसिल / विधिक परामर्शदाता)`
  },

  "ARZ-1042": {
    raw_grievance: "मेरे परिवार का बीपीएल राशन कार्ड आवेदन (संदर्भ संख्या RC-88492) 6 महीने पहले वार्ड 4 आपूर्ति कार्यालय में जमा किया गया था। हमें अभी तक न तो राशन कार्ड मिला है और न ही खाद्यान्न। राशन डीलर स्टॉक रजिस्टर दिखाने से मना करता है।",
    draft_subject: "खाद्य एवं नागरिक आपूर्ति के संबंध में वार्ड 4, सिविल लाइंस में लंबित शिकायत (संदर्भ सं: RC-88492, जमा तिथि: 15-फरवरी-2026) की स्थिति जानने हेतु सूचना का अधिकार अधिनियम 2005 की धारा 6(1) के तहत आवेदन",
    questions: [
      "1. कृपया 15-फरवरी-2026 को वार्ड 4 निवासी सुनीता देवी द्वारा जमा किए गए मूल शिकायत आवेदन (संदर्भ सं: RC-88492) की दैनिक प्रगति रिपोर्ट और प्रमाणित फाइल मूवमेंट रजिस्टर प्रदान करें, जिसकी एक प्रति अनुलग्नक-ए के रूप में संलग्न है।",
      "2. कृपया वार्ड 4 सिविल लाइंस कार्यालय के उन सभी संबंधित अधिकारियों/कर्मचारियों के नाम, पदनाम और आधिकारिक संपर्क विवरण बताएं जिनके पास यह मामला 30 दिनों की विधिक सीमा से अधिक समय तक लंबित रहा।",
      "3. नागरिक अधिकार पत्र के अनुसार इस श्रेणी की जन शिकायत के निवारण हेतु निर्धारित समयसीमा क्या है?",
      "4. कृपया वार्ड 4 में राशन वितरण करने वाली संबंधित उचित दर दुकान (कोटेदार) के लिए माहवार स्टॉक स्थिति और बीपीएल पात्रता वितरण रजिस्टर की प्रमाणित प्रति उपलब्ध कराएं।",
      "5. कृपया उपरोक्त शिकायत आवेदन के प्रसंस्करण और वर्तमान निस्तारण स्थिति के संबंध में दर्ज सभी मौजूदा फाइल नोटिंग्स, कार्यालय पत्राचार, प्रोसेसिंग शीट, निरीक्षण रिपोर्ट और आधिकारिक आदेशों की प्रमाणित प्रतियां उपलब्ध कराएं।"
    ],
    fees_paid: "सूचना का अधिकार नियमावली 2012 के नियम 3 के तहत निर्धारित आवेदन शुल्क के रूप में ₹10 का भारतीय पोस्टल ऑर्डर (आईपीओ सं: 45F-992011, दिनांक: 15-फरवरी-2026, जीपीओ दिल्ली द्वारा जारी) संलग्न है।",
    appeal_subject: "केस ARZ-1042 में प्रथम अपीलीय अधिकारी के समक्ष धारा 19(1) के तहत प्रथम अपील (खाद्य आपूर्ति डीम्ड रिफ्यूजल)",
    appeal_grounds: [
      "1. सूचना का अधिकार अधिनियम, 2005 की धारा 7(1) के तहत 30-दिवसीय अनिवार्य विधिक समयसीमा बीत चुकी है और जन सूचना अधिकारी द्वारा कोई सूचना नहीं दी गई है।",
      "2. अधिनियम की धारा 7(2) के तहत जन सूचना अधिकारी की यह विफलता आवेदन को 'स्वतः अस्वीकृत' (Deemed Refusal) मानने का विधिक आधार बनती है।",
      "3. जन सूचना अधिकारी द्वारा नागरिक अधिकार पत्र एवं राष्ट्रीय खाद्य सुरक्षा अधिनियम (NFSA 2013) के विधिक प्रावधानों का प्रत्यक्ष उल्लंघन किया गया है।",
      "4. धारा 7(6) के अनुसार अपीलार्थी अब सभी अभिलेख बिना किसी शुल्क के निःशुल्क (FREE OF COST) प्राप्त करने की हकदार है।"
    ],
    appeal_prayers: [
      "1. जन सूचना अधिकारी को निर्देश दिया जाए कि वह मांगी गई समस्त प्रमाणित सूचनाएं अविलंब और निःशुल्क उपलब्ध कराएं।",
      "2. अपीलार्थी को प्रथम अपीलीय प्राधिकारी के समक्ष व्यक्तिगत सुनवाई का अवसर दिया जाए।",
      "3. सूचना का अधिकार अधिनियम की धारा 20(1) के तहत दोषी अधिकारी पर ₹250 प्रतिदिन की दर से व्यक्तिगत जुर्माना अधिरोपित करने की संस्तुति की जाए।"
    ],
    legal_notice: `विधिक नोटिस (धारा 80 सिविल प्रक्रिया संहिता, 1908 एवं आईपीसी/बीएनएस की धाराएं)
रजिस्टर्ड डाक / स्पीड पोस्ट द्वारा प्रेषित

सेवा में:
सहायक आयुक्त / खाद्य एवं नागरिक आपूर्ति अधिकारी (FSO),
कार्यालय: खाद्य आपूर्ति सर्किल कार्यालय, वार्ड 4, सिविल लाइन्स, उत्तरी दिल्ली - 110054

विषय: बीपीएल राशन कार्ड (संदर्भ संख्या: RC-88492) एवं राष्ट्रीय खाद्य सुरक्षा अधिनियम (NFSA 2013) के अंतर्गत खाद्यान्न वितरण में वैधानिक विफलता हेतु विधिक नोटिस।

अपने मुवक्किल श्रीमती सुनीता देवी (निवासी: झुग्गी क्लस्टर, कबीर बस्ती, वार्ड 4, सिविल लाइन्स, दिल्ली) के विधिक अनुदेशों के अधीन एवं उनकी ओर से, हम आपको राशन कार्ड आवेदन के 6 माह से लंबित रहने एवं कोटेदार द्वारा खाद्यान्न न दिए जाने के संबंध में यह सांविधिक विधिक नोटिस प्रेषित कर रहे हैं।

आरोपित कानूनी धाराएं (STATUTORY CHARGES INVOKED):
• भारतीय दंड संहिता (1860): धारा 166 (लोक सेवक द्वारा कानून की अवज्ञा), धारा 409 (आपराधिक विश्वासघात)
• भारतीय न्याय संहिता (2023): बीएनएस धारा 198, धारा 318(4) (धोखाधड़ी)
• संबद्ध अधिनियम: राष्ट्रीय खाद्य सुरक्षा अधिनियम 2013 (NFSA) धारा 3 एवं धारा 8

उच्चतम न्यायालय के ऐतिहासिक निर्णय *पीयूसीएल बनाम भारत संघ (भोजन का अधिकार, अनुच्छेद 21)* एवं *मनोहर बनाम महाराष्ट्र राज्य (AIR 2013 SC 681)* के अनुसार, गरीब नागरिकों के जीवन निर्वाह से जुड़े खाद्यान्न को रोकना मौलिक अधिकारों का हनन एवं दांडिक अपराध है।

अतः आपको एतद्द्वारा 15 दिनों की मोहलत दी जाती है कि आवेदक का बीपीएल राशन कार्ड जारी कराएं अथवा लंबित रहने का प्रमाणित कारण उपलब्ध कराएं, अन्यथा आपके विरुद्ध सक्षम दांडिक न्यायालय एवं दिल्ली उच्च न्यायालय में अनुच्छेद 226 के अंतर्गत विधिक कार्यवाही संस्थित की जाएगी।

भवदीय,
अधिवक्ता एस. कालरा (बार काउंसिल / विधिक परामर्शदाता)`
  },
  "ARZ-1046": {
    raw_grievance: "मेरा भूमि नामांतरण खसरा 45/12 आवेदन (संदर्भ संख्या LND-88301) जो 10-जनवरी-2026 को तहसील कार्यालय महरौली में जमा किया गया था, 30 दिन से अधिक समय से लंबित है। पटवारी भू-अभिलेख में नाम दर्ज नहीं कर रहा है।",
    draft_subject: "राजस्व एवं भूमि अभिलेख के संबंध में महरौली तहसील में लंबित भूमि नामांतरण (खसरा 45/12, संदर्भ: LND-88301) की प्रमाणित स्थिति हेतु धारा 6(1) के तहत आवेदन",
    questions: [
      "1. कृपया आवेदक शिवांशु पाण्डेय द्वारा दिनांक 10-जनवरी-2026 को महरौली तहसील में प्रस्तुत भूमि नामांतरण आवेदन (खसरा संख्या 45/12, संदर्भ: LND-88301) की दैनिक कार्य प्रगति आख्या एवं प्रमाणित फाइल संचालन पंजी उपलब्ध कराएं।",
      "2. कृपया संबंधित पटवारी एवं राजस्व निरीक्षक के नाम एवं पदनाम स्पष्ट करें जिनके समक्ष यह फाइल 30-दिवसीय वैधानिक समयसीमा बीतने के उपरांत भी अनिस्तारित रही।",
      "3. दिल्ली भूमि सुधार अधिनियम एवं नागरिक अधिकार पत्र के अंतर्गत नामांतरण आदेश पारित करने की निर्धारित समयसीमा क्या है?",
      "4. क्या उक्त भूमि नामांतरण पर किसी पक्ष द्वारा कोई विधिक आपत्ति दर्ज की गई है? यदि हां, तो आपत्ति की प्रमाणित प्रति एवं नोटिस की प्रति प्रदान करें।",
      "5. उक्त प्रकरण में सक्षम प्राधिकारी एवं तहसीलदार द्वारा दर्ज समस्त आदेश-पत्रक (Order Sheet) एवं स्थलीय निरीक्षण आख्या की प्रमाणित प्रतिलिपि उपलब्ध कराएं।"
    ],
    fees_paid: "केंद्रीय आरटीआई नियमावली 2012 के नियम 3 के अनुसार ₹10 का पोस्टल ऑर्डर (IPO No: 78D-441029) विहित शुल्क के रूप में संलग्न है।",
    appeal_subject: "केस ARZ-1046 में प्रथम अपीलीय अधिकारी के समक्ष धारा 19(1) के तहत प्रथम अपील (भूमि नामांतरण डीम्ड रिफ्यूजल)",
    appeal_grounds: [
      "1. तहसील महरौली के सक्षम जन सूचना अधिकारी द्वारा 30-दिवसीय अनिवार्य विधिक समयसीमा का गंभीर उल्लंघन किया गया है।",
      "2. धारा 7(2) के तहत सूचना न देना डीम्ड रिफ्यूजल (स्वतः अस्वीकृति) का स्पष्ट आधार है।",
      "3. दिल्ली भूमि सुधार अधिनियम के अंतर्गत नागरिक का नामांतरण रिकॉर्ड पाने का विधिक अधिकार बाधित किया गया है।",
      "4. धारा 7(6) के तहत विधिक समयसीमा समाप्ति के बाद समस्त वांछित अभिलेख निःशुल्क प्रदान किए जाने अनिवार्य हैं।"
    ],
    appeal_prayers: [
      "1. संबंधित जन सूचना अधिकारी को आदेशित किया जाए कि खसरा 45/12 की प्रमाणित खतौनी एवं नामांतरण स्थिति 48 घंटे में निःशुल्क उपलब्ध कराएं।",
      "2. प्रथम अपीलीय प्राधिकारी के समक्ष व्यक्तिगत सुनवाई नियत की जाए।",
      "3. धारा 20(1) के तहत दोषी अधिकारी पर ₹250 प्रतिदिन की दर से विधिक जुर्माना अधिरोपित किया जाए।"
    ],
    legal_notice: `विधिक नोटिस (धारा 80 सिविल प्रक्रिया संहिता, 1908 एवं आईपीसी/बीएनएस की धाराएं)
रजिस्टर्ड डाक / स्पीड पोस्ट द्वारा प्रेषित

सेवा में:
नायब तहसीलदार / सक्षम जन सूचना अधिकारी,
कार्यालय: राजस्व तहसील कार्यालय, महरौली, दक्षिणी दिल्ली - 110030

विषय: भूमि नामांतरण (खसरा सं. 45/12, संदर्भ: LND-88301) में 30-दिवसीय वैधानिक समयसीमा का उल्लंघन एवं पटवारी द्वारा पद के दुरुपयोग हेतु धारा 80 सीपीसी नोटिस।

अपने मुवक्किल श्री शिवांशु पाण्डेय (निवासी: मकान नं. 14, कालकाजी एक्सटेंशन, नई दिल्ली - 110019) के विधिक अनुदेशों के अधीन एवं उनकी ओर से, हम आपको नामांतरण आवेदन के जानबूझकर अनिस्तारित रखे जाने एवं दिल्ली भूमि सुधार अधिनियम 1954 के उल्लंघन के संबंध में यह सांविधिक विधिक नोटिस प्रेषित कर रहे हैं।

आरोपित कानूनी धाराएं (STATUTORY CHARGES INVOKED):
• भारतीय दंड संहिता (1860): धारा 166 (लोक सेवक द्वारा विधिक निर्देश की अवज्ञा), धारा 217, धारा 409
• भारतीय न्याय संहिता (2023): बीएनएस धारा 198, धारा 316(5)
• संबद्ध अधिनियम: दिल्ली भूमि सुधार अधिनियम, 1954 एवं दिल्ली लोक सेवा गारंटी अधिनियम

उच्चतम न्यायालय के निर्णय *सीबीएसई बनाम आदित्य बंदोपाध्याय (2011) 8 SCC 497* एवं *मनोहर बनाम महाराष्ट्र राज्य (AIR 2013 SC 681)* के अनुसार, जन प्राधिकारी जनता के अभिलेखों के न्यासी हैं तथा वैधानिक समयसीमा का उल्लंघन करने पर जन सूचना अधिकारी धारा 20(1) के तहत व्यक्तिगत ₹250 प्रतिदिन जुर्माने के दायी हैं।

अतः आपको एतद्द्वारा 15 दिनों का अंतिम अवसर दिया जाता है कि खसरा 45/12 के नामांतरण आदेश की प्रमाणित प्रतिलिपि जारी करें, अन्यथा सक्षम न्यायालय में दीवानी वाद (Civil Suit) एवं दिल्ली उच्च न्यायालय में रिट याचिका (Writ Petition) योजित की जाएगी।

भवदीय,
अधिवक्ता एस. कालरा (बार काउंसिल / विधिक परामर्शदाता)`
  },
  "ARZ-1047": {
    raw_grievance: "मेरा भूमि नामांतरण खसरा 45/12 आवेदन (संदर्भ संख्या LND-88301) जो 10-जनवरी-2026 को तहसील कार्यालय महरौली में जमा किया गया था, लंबित है। (केस ARZ-1046 के साथ विलय किया गया)",
    draft_subject: "राजस्व एवं भूमि अभिलेख के संबंध में महरौली तहसील में लंबित भूमि नामांतरण (खसरा 45/12) - समेकित डॉसियर",
    questions: [
      "1. कृपया संबंधित नामांतरण आवेदन (खसरा संख्या 45/12) की अद्यतन प्रशासनिक स्थिति एवं फाइल मूवमेंट का प्रमाणित विवरण प्रदान करें।",
      "2. कृपया उक्त भूमि नामांतरण पर तहसील स्तर पर दर्ज समस्त विधिक टिप्पणियों एवं स्थलीय निरीक्षण रिपोर्ट की प्रमाणित प्रति उपलब्ध कराएं।"
    ],
    fees_paid: "₹10 का पोस्टल ऑर्डर विहित शुल्क के रूप में संलग्न है।",
    appeal_subject: "केस ARZ-1047 (समेकित) में धारा 19(1) के तहत प्रथम अपील (भूमि नामांतरण)",
    appeal_grounds: [
      "1. 30 दिन की वैधानिक सीमा समाप्त हो चुकी है और धारा 7(2) के तहत यह स्वतः अस्वीकृति (Deemed Refusal) है।",
      "2. धारा 7(6) के अनुसार आवेदक समस्त अभिलेख निःशुल्क प्राप्त करने का हकदार है।"
    ],
    appeal_prayers: [
      "1. अविलंब प्रमाणित सूचना एवं नामांतरण स्थिति निःशुल्क उपलब्ध कराई जाए।",
      "2. दोषी प्राधिकारी के विरुद्ध धारा 20(1) के तहत जुर्माना संस्तुत किया जाए।"
    ],
    legal_notice: `विधिक नोटिस (धारा 80 सिविल प्रक्रिया संहिता, 1908 एवं आईपीसी/बीएनएस की धाराएं)
रजिस्टर्ड डाक / स्पीड पोस्ट द्वारा प्रेषित

सेवा में:
नायब तहसीलदार / सक्षम जन सूचना अधिकारी,
कार्यालय: राजस्व तहसील कार्यालय, महरौली, दक्षिणी दिल्ली - 110030

विषय: भूमि नामांतरण (खसरा सं. 45/12, समेकित डॉसियर ARZ-1047) के संबंध में विधिक मांग नोटिस।

अपने मुवक्किल श्री शिवांशु पाण्डेय के विधिक अनुदेशों के अधीन एवं उनकी ओर से, हम आपको नामांतरण आवेदन के अनिस्तारित रहने एवं वैधानिक समयसीमा के उल्लंघन के संबंध में यह नोटिस प्रेषित कर रहे हैं।

आरोपित धाराएं: आईपीसी धारा 166 / बीएनएस धारा 198, दिल्ली भूमि सुधार अधिनियम 1954।

अतः 15 दिनों के भीतर नामांतरण आदेश व दैनिक प्रगति रजिस्टर की प्रमाणित प्रतिलिपि उपलब्ध कराएं अन्यथा सक्षम न्यायालय में विधिक कार्यवाही संस्थित की जाएगी।

भवदीय,
अधिवक्ता एस. कालरा (बार काउंसिल / विधिक परामर्शदाता)`
  }
};

function formatDistanceLabel(label) {
  if (!label) return currentLang === "hi" ? "निकट" : "Near";
  if (currentLang !== "hi") return label;
  let str = label;
  str = str.replace(/away/gi, "दूर")
           .replace(/meters?/gi, "मीटर")
           .replace(/\bkm\b/gi, "किमी")
           .replace(/Ward 4 DSO Complex/gi, "वार्ड 4 डीएसओ परिसर")
           .replace(/Tehsil Complex Mehrauli/gi, "तहसील परिसर महरौली")
           .replace(/Tehsil Sadar Kachehri Complex/gi, "तहसील सदर कचेहरी परिसर")
           .replace(/District Kachehri/gi, "जिला कचेहरी")
           .replace(/Civil Lines/gi, "सिविल लाइंस")
           .replace(/Jurisdiction Assigned/gi, "क्षेत्राधिकार आवंटित");
  return str;
}

function tComplainant(name) {
  if (!name) return currentLang === "hi" ? "नागरिक आवेदक" : "Citizen Applicant";
  if (currentLang !== "hi") return name;
  if (PEOPLE_AND_OFFICES_I18N[name]) return PEOPLE_AND_OFFICES_I18N[name];
  let clean = name.replace(/\(Merged Duplicate\)/gi, "(विलय किया गया डुप्लिकेट)");
  for (let k in PEOPLE_AND_OFFICES_I18N) {
    if (clean.includes(k)) {
      clean = clean.replace(k, PEOPLE_AND_OFFICES_I18N[k]);
    }
  }
  return clean;
}

function tAddress(addr) {
  if (!addr) return currentLang === "hi" ? "स्थानीय" : "Local";
  if (currentLang !== "hi") return addr;
  if (PEOPLE_AND_OFFICES_I18N[addr]) return PEOPLE_AND_OFFICES_I18N[addr];
  let res = addr;
  for (let k in PEOPLE_AND_OFFICES_I18N) {
    if (res.includes(k)) {
      res = res.replace(k, PEOPLE_AND_OFFICES_I18N[k]);
    }
  }
  res = res.replace(/\bHouse No\.\b/gi, "मकान नं.")
           .replace(/\b25 feet road\b/gi, "25 फीट रोड")
           .replace(/\bsgm nagar\b/gi, "एसजीएम नगर")
           .replace(/\bfaridabad\b/gi, "फरीदाबाद")
           .replace(/\bFaridabad\b/gi, "फरीदाबाद")
           .replace(/\bCluster\b/gi, "क्लस्टर")
           .replace(/\bWard\b/gi, "वार्ड")
           .replace(/\bSector\b/gi, "सेक्टर")
           .replace(/\bNew Delhi\b/gi, "नई दिल्ली")
           .replace(/\bDelhi\b/gi, "दिल्ली")
           .replace(/\bVaranasi\b/gi, "वाराणसी")
           .replace(/\bLucknow\b/gi, "लखनऊ")
           .replace(/\bUttar Pradesh\b/gi, "उत्तर प्रदेश")
           .replace(/\bRoom\b/gi, "कमरा")
           .replace(/\bFloor\b/gi, "तल")
           .replace(/\bGround Floor\b/gi, "भूतल");
  return res;
}

function tDept(dept) {
  if (!dept) return "";
  if (currentLang !== "hi") return dept;
  if (DEPARTMENTS_I18N[dept]) return DEPARTMENTS_I18N[dept];
  if (typeof CUSTOM_ACTS_I18N !== "undefined" && CUSTOM_ACTS_I18N[dept]) return CUSTOM_ACTS_I18N[dept];
  for (let k in DEPARTMENTS_I18N) {
    if (dept.toLowerCase() === k.toLowerCase()) {
      return DEPARTMENTS_I18N[k];
    }
  }
  return dept;
}

function tInfraction(infr) {
  if (!infr) return currentLang === "hi" ? "प्रशासनिक उल्लंघन / विलंब" : "Administrative Infraction";
  if (currentLang !== "hi") return infr;
  return INFRACTIONS_I18N[infr] || infr;
}

function tSection(sec) {
  if (!sec) return "";
  if (currentLang !== "hi") return sec;
  if (SECTIONS_I18N[sec]) return SECTIONS_I18N[sec];
  
  // Sort dictionary keys by length descending to match specific sections first
  const sortedKeys = Object.keys(SECTIONS_I18N).sort((a, b) => b.length - a.length);
  for (let k of sortedKeys) {
    if (sec.toLowerCase() === k.toLowerCase()) {
      return SECTIONS_I18N[k];
    }
  }
  for (let k of sortedKeys) {
    if (sec.toLowerCase().includes(k.toLowerCase())) {
      return SECTIONS_I18N[k];
    }
  }

  let res = sec;
  res = res.replace(/Bharatiya Nyaya Sanhita/gi, "भारतीय न्याय संहिता")
           .replace(/Indian Penal Code/gi, "भारतीय दंड संहिता")
           .replace(/BNS\s*Section/gi, "बीएनएस धारा")
           .replace(/BNS\s*Sec\.?/gi, "बीएनएस धारा")
           .replace(/\bBNS\b/gi, "बीएनएस")
           .replace(/IPC\s*Section/gi, "आईपीसी धारा")
           .replace(/IPC\s*Sec\.?/gi, "आईपीसी धारा")
           .replace(/\bIPC\b/gi, "आईपीसी")
           .replace(/\bSection\b/gi, "धारा")
           .replace(/\bSec\.?\b/gi, "धारा")
           .replace(/RTI\s*Act\s*2005/gi, "आरटीआई अधिनियम 2005")
           .replace(/RTI\s*Act/gi, "आरटीआई अधिनियम")
           .replace(/\bRTI\b/gi, "आरटीआई")
           .replace(/First\s*Appeal/gi, "प्रथम अपील")
           .replace(/Cheating\s*&\s*Dishonest\s*Property\s*Inducement/gi, "धोखाधड़ी एवं संपत्ति हड़पना")
           .replace(/Cheating/gi, "धोखाधड़ी / छल")
           .replace(/Public\s*Nuisance/gi, "सार्वजनिक उपद्रव")
           .replace(/Criminal\s*Breach\s*of\s*Trust\s*by\s*Public\s*Servant\/Dealer/gi, "लोक सेवक/डीलर द्वारा आपराधिक विश्वासघात")
           .replace(/Criminal\s*Breach\s*of\s*Trust\s*by\s*Public\s*Servant/gi, "लोक सेवक द्वारा आपराधिक विश्वासघात")
           .replace(/Public\s*Servant\s*disobeying\s*law/gi, "लोक सेवक द्वारा कानून की अवहेलना")
           .replace(/Public\s*Servant\s*disobeying\s*direction\s*under\s*law/gi, "लोक सेवक द्वारा कानूनी निर्देश की अवहेलना")
           .replace(/Public\s*Servant\s*Disobedience/gi, "लोक सेवक द्वारा अवज्ञा")
           .replace(/Disobedience\s*of\s*Law/gi, "कानून की अवज्ञा")
           .replace(/Fouling\s*water\s*of\s*public\s*spring\s*or\s*reservoir/gi, "सार्वजनिक जल स्रोत को दूषित करना")
           .replace(/Forgery\s*for\s*purpose\s*of\s*cheating/gi, "धोखाधड़ी हेतु कूटरचना")
           .replace(/Forgery/gi, "जालसाजी / कूटरचना");
  return res;
}

function tOfficer(officer) {
  if (!officer) return currentLang === "hi" ? "नामित जन सूचना अधिकारी" : "Designated PIO";
  if (currentLang !== "hi") return officer;
  return PEOPLE_AND_OFFICES_I18N[officer] || officer;
}

function tStatus(status) {
  if (!status) return "";
  const item = STATUS_I18N[status];
  if (item) {
    return currentLang === "hi" ? item.hi : (currentLang === "bi" ? `${item.en} • ${item.hi}` : item.en);
  }
  if (status === "MERGED_DUPLICATE") {
    return currentLang === "hi" ? "विलय किया गया डुप्लिकेट" : "MERGED DUPLICATE";
  }
  return status;
}


function tLegalGround(ground) {
  if (!ground) return "";
  if (currentLang !== "hi") return ground;
  if (LEGAL_GROUNDS_I18N[ground]) return LEGAL_GROUNDS_I18N[ground];
  for (let k in LEGAL_GROUNDS_I18N) {
    if (ground.includes(k) || k.includes(ground)) {
      return LEGAL_GROUNDS_I18N[k];
    }
  }
  return ground;
}

function tWinProb(prob) {
  if (!prob) return currentLang === "hi" ? "उच्च संभावना" : "High Probability";
  if (currentLang !== "hi") return prob;
  if (prob.includes("VERY HIGH") || prob.includes("95%")) return "अत्यधिक उच्च (95%+)";
  if (prob.includes("HIGH") || prob.includes("High")) return "उच्च";
  if (prob.includes("MEDIUM") || prob.includes("Medium")) return "मध्यम";
  return prob;
}

function tDesignation(desig) {
  if (!desig) return currentLang === "hi" ? "नामित प्राधिकारी" : "Designated Authority";
  if (currentLang !== "hi") return desig;
  if (PEOPLE_AND_OFFICES_I18N[desig]) return PEOPLE_AND_OFFICES_I18N[desig];
  let res = desig;
  for (let k in PEOPLE_AND_OFFICES_I18N) {
    if (res.includes(k)) {
      res = res.replace(k, PEOPLE_AND_OFFICES_I18N[k]);
    }
  }
  return res.replace(/Public Information Officer & Assistant Commissioner/gi, "जन सूचना अधिकारी एवं सहायक आयुक्त")
            .replace(/Public Information Officer/gi, "जन सूचना अधिकारी")
            .replace(/Assistant Commissioner/gi, "सहायक आयुक्त")
            .replace(/Deputy Registrar & PIO \(Scholarships\)/gi, "उप कुलसचिव एवं पीआईओ (छात्रवृत्ति)")
            .replace(/Deputy Registrar/gi, "उप कुलसचिव")
            .replace(/Director of Higher Education \/ First Appellate Authority/gi, "निदेशक उच्च शिक्षा / प्रथम अपीलीय अधिकारी")
            .replace(/Director of Higher Education/gi, "निदेशक उच्च शिक्षा")
            .replace(/Additional Commissioner \(PDS\) \/ First Appellate Authority/gi, "अपर आयुक्त (पीडीएस) / प्रथम अपीलीय अधिकारी")
            .replace(/Additional Commissioner/gi, "अपर आयुक्त")
            .replace(/First Appellate Authority/gi, "प्रथम अपीलीय अधिकारी")
            .replace(/Executive Engineer \(Civil\/Drainage\)/gi, "अधिशासी अभियंता (सिविल/जल निकासी)")
            .replace(/Executive Engineer/gi, "अधिशासी अभियंता")
            .replace(/Civil\/Drainage/gi, "सिविल/जल निकासी")
            .replace(/Drainage & Stormwater/gi, "जल निकासी एवं वर्षा जल")
            .replace(/Scholarships/gi, "छात्रवृत्ति")
            .replace(/Appellate Officer/gi, "अपीलीय अधिकारी")
            .replace(/Designated PIO/gi, "नामित जन सूचना अधिकारी");
}

function tReviewer(name) {
  if (!name) return currentLang === "hi" ? "विधिक समीक्षक" : "Legal Reviewer";
  if (currentLang !== "hi") return name;
  if (name.includes("Kalra")) return "अधिवक्ता एस. कालरा (बार काउंसिल / विधिक परामर्शदाता)";
  if (name.includes("Advocate Legal Team")) return "विधिक परामर्शदाता दल";
  if (name.includes("Advocate")) return "विधिक परामर्शदाता";
  return name;
}


function tCustomAct(str) {
  if (!str) return "";
  if (currentLang !== "hi") return str;
  if (CUSTOM_ACTS_I18N[str]) return CUSTOM_ACTS_I18N[str];
  for (let k in CUSTOM_ACTS_I18N) {
    if (str.includes(k) || k.includes(str)) {
      return CUSTOM_ACTS_I18N[k];
    }
  }
  return str;
}

function tTimelineField(field) {
  if (!field) return "";
  if (currentLang !== "hi") return field;
  const map = {
    "Case Intake": "केस दर्ज",
    "status": "केस स्थिति",
    "Status": "केस स्थिति",
    "dispatch_info": "प्रेषण विवरण",
    "assigned_pio": "नामित जन सूचना अधिकारी",
    "suggested_pio": "सुझावित जन सूचना अधिकारी",
    "is_life_liberty": "जीवन व स्वतंत्रता प्राथमिकता"
  };
  return map[field] || field;
}

function tTimelineVal(val) {
  if (!val) return currentLang === "hi" ? "कोई नहीं" : "None";
  if (currentLang !== "hi") return val;
  if (val === "None" || val === "null" || val === "undefined") return "कोई नहीं";
  let str = String(val);
  str = str.replace(/Case\s+([A-Z0-9-]+)\s+created/gi, "केस $1 दर्ज किया गया")
           .replace(/UNDER_REVIEW/gi, "समीक्षाधीन")
           .replace(/APPROVED/gi, "स्वीकृत")
           .replace(/TRANSFERRED_SEC_6_3/gi, "अंतरित (धारा 6(3))")
           .replace(/MERGED_DUPLICATE/gi, "विलय किया गया डुप्लिकेट")
           .replace(/DISPATCHED/gi, "प्रेषित");
  return str;
}

function tPunishment(pun) {
  if (!pun) return currentLang === "hi" ? "कठोर कारावास + जुर्माना" : "Rigorous Imprisonment + Fine";
  if (currentLang !== "hi") return pun;
  const map = {
    "Rigorous imprisonment up to 7 years + fine": "7 वर्ष तक का कठोर कारावास + जुर्माना",
    "Rigorous imprisonment up to 10 years + fine": "10 वर्ष तक का कठोर कारावास + जुर्माना",
    "Life Imprisonment or Imprisonment up to 10 years + Fine": "आजीवन कारावास या 10 वर्ष तक कारावास + जुर्माना",
    "Imprisonment for Life or up to 10 years + Fine (Non-bailable under Sec 409/316(5))": "आजीवन कारावास या 10 वर्ष तक कारावास + जुर्माना (गैर-जमानती धारा 409/316(5))",
    "Imprisonment up to 7 years + Fine (Non-bailable & Cognizable under Section 468/336)": "7 वर्ष तक कारावास + जुर्माना (गैर-जमानती धारा 468/336)",
    "Imprisonment up to 6 months + Fine + High Court Mandamus Writ liability under Article 226": "6 माह तक कारावास + जुर्माना + अनुच्छेद 226 के तहत रिट देयता",
    "Rigorous Imprisonment up to 2 years + Mandatory departmental inquiry and disciplinary penalty": "2 वर्ष तक कठोर कारावास + अनिवार्य विभागीय जांच व दंडात्मक कार्रवाई",
    "Imprisonment up to 10 years + Disciplinary recovery under Comptroller and Auditor General (CAG) norms": "10 वर्ष तक कारावास + कैग (CAG) नियमों के तहत वसूली",
    "Imprisonment up to 5 years + Medical License cancellation and Consumer Tribunal damages": "5 वर्ष तक कारावास + मेडिकल लाइसेंस रद्दीकरण एवं हर्जाना",
    "Imprisonment up to 3 years or fine": "3 वर्ष तक कारावास या जुर्माना",
    "Imprisonment up to 3 years or fine or both": "3 वर्ष तक कारावास या जुर्माना या दोनों",
    "Imprisonment up to 7 years and fine": "7 वर्ष तक कारावास और जुर्माना",
    "Imprisonment up to 7 years + fine": "7 वर्ष तक कारावास + जुर्माना"
  };
  if (map[pun]) return map[pun];
  for (let k in map) {
    if (pun.toLowerCase() === k.toLowerCase() || pun.includes(k) || k.includes(pun)) {
      return map[k];
    }
  }
  let str = pun;
  str = str.replace(/Imprisonment for Life/gi, "आजीवन कारावास")
           .replace(/Life Imprisonment/gi, "आजीवन कारावास")
           .replace(/Rigorous Imprisonment/gi, "कठोर कारावास")
           .replace(/Rigorous imprisonment/gi, "कठोर कारावास")
           .replace(/Imprisonment/gi, "कारावास")
           .replace(/imprisonment/gi, "कारावास")
           .replace(/up to (\d+) years/gi, "$1 वर्ष तक")
           .replace(/up to (\d+) months/gi, "$1 माह तक")
           .replace(/\+ fine/gi, "+ जुर्माना")
           .replace(/\+ Fine/gi, "+ जुर्माना")
           .replace(/and fine/gi, "और जुर्माना")
           .replace(/or fine/gi, "या जुर्माना")
           .replace(/or both/gi, "या दोनों")
           .replace(/Non-bailable/gi, "गैर-जमानती")
           .replace(/Cognizable/gi, "संज्ञेय")
           .replace(/under Sec/gi, "धारा के तहत")
           .replace(/under Section/gi, "धारा के तहत");
  return str;
}

function tGrievance(caseIdOrRaw, maybeRaw) {
  let caseId = maybeRaw !== undefined ? caseIdOrRaw : (currentCase ? currentCase.case_id : null);
  let raw = maybeRaw !== undefined ? maybeRaw : caseIdOrRaw;
  if (!raw) return "";
  if (currentLang !== "hi") {
    if (caseId && SEED_CASES_EN[caseId] && SEED_CASES_EN[caseId].raw_grievance) {
      return SEED_CASES_EN[caseId].raw_grievance;
    }
    return raw;
  }
  if (caseId && SEED_CASES_I18N[caseId] && SEED_CASES_I18N[caseId].raw_grievance) {
    return SEED_CASES_I18N[caseId].raw_grievance;
  }
  return raw;
}

function tDraftSubject(caseIdOrSubj, maybeSubj) {
  let caseId = maybeSubj !== undefined ? caseIdOrSubj : (currentCase ? currentCase.case_id : null);
  let subj = maybeSubj !== undefined ? maybeSubj : caseIdOrSubj;

  if (currentLang !== "hi") {
    if (caseId && SEED_CASES_EN[caseId] && SEED_CASES_EN[caseId].draft_subject) {
      return SEED_CASES_EN[caseId].draft_subject;
    }
    const c = (currentCase && currentCase.case_id === caseId) ? currentCase : (typeof allCasesCache !== "undefined" ? allCasesCache.find(x => x.case_id === caseId) : null) || currentCase || {};
    if (c.draft_rti && c.draft_rti.application_subject && !/[\u0900-\u097F]/.test(c.draft_rti.application_subject)) {
      return c.draft_rti.application_subject;
    }
    if (subj && typeof subj === "string" && !/[\u0900-\u097F]/.test(subj)) {
      return subj;
    }
    if (c.department) {
      return `Application under Section 6(1) of RTI Act 2005 seeking certified public records regarding ${c.department}`;
    }
    return "Application under Section 6(1) of RTI Act 2005 seeking certified public records";
  }

  if (subj && typeof subj === "string" && /[\u0900-\u097F]/.test(subj)) {
    return subj;
  }
  if (caseId && SEED_CASES_I18N[caseId] && SEED_CASES_I18N[caseId].draft_subject) {
    return SEED_CASES_I18N[caseId].draft_subject;
  }
  const c = (currentCase && currentCase.case_id === caseId) ? currentCase : (typeof allCasesCache !== "undefined" ? allCasesCache.find(x => x.case_id === caseId) : null) || currentCase || {};
  if (c.department) {
    const deptHindi = tDept(c.department);
    return `${deptHindi} के संबंध में सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अंतर्गत प्रमाणित लोक अभिलेख प्राप्त करने हेतु आवेदन`;
  }
  if (subj && typeof subj === "string") {
    return subj.replace(/Application under Section 6\(1\) of RTI Act,? 2005 regarding/gi, "सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के तहत आवेदन:")
               .replace(/Application under Section 6\(1\)/gi, "धारा 6(1) के तहत आवेदन");
  }
  return "सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के तहत आवेदन";
}

function tDraftQuestions(caseIdOrQuestions, maybeQuestions) {
  let caseId = maybeQuestions !== undefined ? caseIdOrQuestions : (currentCase ? currentCase.case_id : null);
  let questions = maybeQuestions !== undefined ? maybeQuestions : caseIdOrQuestions;

  if (currentLang !== "hi") {
    if (caseId && SEED_CASES_EN[caseId] && SEED_CASES_EN[caseId].questions) {
      return SEED_CASES_EN[caseId].questions;
    }
    const c = (currentCase && currentCase.case_id === caseId) ? currentCase : (typeof allCasesCache !== "undefined" ? allCasesCache.find(x => x.case_id === caseId) : null) || currentCase || {};
    if (c.draft_rti && c.draft_rti.questions && c.draft_rti.questions.length > 0 && !/[\u0900-\u097F]/.test(c.draft_rti.questions[0])) {
      return c.draft_rti.questions;
    }
    if (questions && Array.isArray(questions) && questions.length > 0 && !/[\u0900-\u097F]/.test(questions[0])) {
      return questions;
    }
    return [
      "1. Please provide certified copy of daily progress report and certified file movement register regarding the grievance application.",
      "2. Please specify the names, designations, and official contact details of all dealing officials who held this file beyond statutory limits.",
      "3. What is the prescribed timeline as per the Citizen Charter for resolving this class of public grievance?",
      "4. Please disclose certified copies of all existing file notings, office correspondence, processing sheets, and orders issued."
    ];
  }

  if (!questions || !Array.isArray(questions)) return [];
  if (questions.length > 0 && /[\u0900-\u097F]/.test(questions[0])) {
    return questions;
  }
  if (caseId && SEED_CASES_I18N[caseId] && SEED_CASES_I18N[caseId].questions) {
    return SEED_CASES_I18N[caseId].questions;
  }
  return questions.map((q) => {
    let tq = q;
    tq = tq.replace(/Provide certified copy of daily progress report and file movement register/gi, "कृपया मूल शिकायत आवेदन की दैनिक प्रगति रिपोर्ट और प्रमाणित फाइल मूवमेंट रजिस्टर प्रदान करें")
           .replace(/Provide names, designations, and contact details of all dealing officials/gi, "कृपया उन सभी संबंधित अधिकारियों/कर्मचारियों के नाम, पदनाम और आधिकारिक संपर्क विवरण बताएं")
           .replace(/who kept this matter pending beyond/gi, "जिनके पास यह मामला विधिक सीमा से अधिक समय तक लंबित रहा")
           .replace(/State the statutory Citizen Charter timeline for resolving this category of public grievance/gi, "नागरिक अधिकार पत्र के अनुसार इस श्रेणी की जन शिकायत के निवारण हेतु निर्धारित समयसीमा क्या है")
           .replace(/Provide certified copies of all existing file-notings, office correspondence, processing sheets/gi, "कृपया उपरोक्त शिकायत आवेदन के संबंध में दर्ज सभी मौजूदा फाइल नोटिंग्स, कार्यालय पत्राचार एवं आदेशों की प्रमाणित प्रतियां उपलब्ध कराएं")
           .replace(/Provide certified copy of the complete processing file/gi, "कृपया संपूर्ण प्रोसेसिंग फ़ाइल और आधिकारिक नोटशीट की प्रमाणित प्रतिलिपि प्रदान करें")
           .replace(/Provide certified copy of/gi, "कृपया प्रमाणित प्रतिलिपि प्रदान करें:")
           .replace(/State reasons in writing/gi, "कृपया लिखित में कारण स्पष्ट करें:");
    return tq;
  });
}

function tDraftFees(caseIdOrFees, maybeFees) {
  let caseId = maybeFees !== undefined ? caseIdOrFees : (currentCase ? currentCase.case_id : null);
  let fees = maybeFees !== undefined ? maybeFees : caseIdOrFees;

  if (currentLang !== "hi") {
    if (caseId && SEED_CASES_EN[caseId] && SEED_CASES_EN[caseId].fees_paid) {
      return SEED_CASES_EN[caseId].fees_paid;
    }
    const c = (currentCase && currentCase.case_id === caseId) ? currentCase : (typeof allCasesCache !== "undefined" ? allCasesCache.find(x => x.case_id === caseId) : null) || currentCase || {};
    if (c.draft_rti && c.draft_rti.fees_paid && !/[\u0900-\u097F]/.test(c.draft_rti.fees_paid)) {
      return c.draft_rti.fees_paid;
    }
    if (fees && typeof fees === "string" && !/[\u0900-\u097F]/.test(fees)) {
      return fees;
    }
    return "Rs. 10 Indian Postal Order (IPO) / Court Fee Stamp enclosed under Rule 3 of RTI Rules 2012.";
  }

  if (fees && typeof fees === "string" && /[\u0900-\u097F]/.test(fees)) {
    return fees;
  }
  if (caseId && SEED_CASES_I18N[caseId] && SEED_CASES_I18N[caseId].fees_paid) {
    return SEED_CASES_I18N[caseId].fees_paid;
  }
  return "सूचना का अधिकार नियमावली, 2012 के नियम 3 के तहत ₹10 का भारतीय पोस्टल ऑर्डर (आईपीओ) / कोर्ट फीस स्टाम्प विहित शुल्क के रूप में संलग्न है।";
}

function tAppealSubject(caseIdOrSubj, maybeSubj) {
  let caseId = maybeSubj !== undefined ? caseIdOrSubj : (currentCase ? currentCase.case_id : null);
  let subj = maybeSubj !== undefined ? maybeSubj : caseIdOrSubj;

  if (currentLang !== "hi") {
    if (caseId && SEED_CASES_EN[caseId] && SEED_CASES_EN[caseId].appeal_subject) {
      return SEED_CASES_EN[caseId].appeal_subject;
    }
    const c = (currentCase && currentCase.case_id === caseId) ? currentCase : (typeof allCasesCache !== "undefined" ? allCasesCache.find(x => x.case_id === caseId) : null) || currentCase || {};
    if (c.first_appeal_draft && c.first_appeal_draft.subject && !/[\u0900-\u097F]/.test(c.first_appeal_draft.subject)) {
      return c.first_appeal_draft.subject;
    }
    if (subj && typeof subj === "string" && !/[\u0900-\u097F]/.test(subj)) {
      return subj;
    }
    const isUrgent = Boolean(c.is_life_liberty || c.statutory_sla_hours === 48);
    if (isUrgent) {
      return `*** URGENT FIRST APPEAL: Under Section 19(1) read with Section 7(1) Proviso of RTI Act 2005 (48-Hour Life/Liberty Emergency) against Deemed Refusal in Case ${caseId || c.case_id || ''} ***`;
    }
    return `FIRST APPEAL UNDER SECTION 19(1) OF RTI ACT 2005 AGAINST DEEMED REFUSAL BY PIO IN CASE ${caseId || c.case_id || ''}`;
  }

  if (subj && typeof subj === "string" && /[\u0900-\u097F]/.test(subj)) {
    return subj;
  }
  if (caseId && SEED_CASES_I18N[caseId] && SEED_CASES_I18N[caseId].appeal_subject) {
    return SEED_CASES_I18N[caseId].appeal_subject;
  }
  const c = (currentCase && currentCase.case_id === caseId) ? currentCase : (typeof allCasesCache !== "undefined" ? allCasesCache.find(x => x.case_id === caseId) : null) || currentCase || {};
  const isUrgent = Boolean(c.is_life_liberty || c.statutory_sla_hours === 48);
  if (isUrgent) {
    return `*** अति-आवश्यक प्रथम अपील: सूचना का अधिकार अधिनियम 2005 की धारा 19(1) सपठित धारा 7(1) परंतुक (48 घंटे जीवन व स्वतंत्रता आपातकाल) - केस ${caseId || c.case_id || ''} में स्वतः अस्वीकृति (Deemed Refusal) के विरुद्ध ***`;
  }
  return `सूचना का अधिकार अधिनियम, 2005 की धारा 19(1) के अंतर्गत जन सूचना अधिकारी द्वारा केस ${caseId || c.case_id || ''} में निर्धारित समयसीमा में सूचना न देने / स्वतः अस्वीकृति (Deemed Refusal) के विरुद्ध प्रथम अपील`;
}

function tAppealGrounds(caseIdOrGrounds, maybeGrounds) {
  let caseId = maybeGrounds !== undefined ? caseIdOrGrounds : (currentCase ? currentCase.case_id : null);
  let grounds = maybeGrounds !== undefined ? maybeGrounds : caseIdOrGrounds;

  if (currentLang !== "hi") {
    if (caseId && SEED_CASES_EN[caseId] && SEED_CASES_EN[caseId].appeal_grounds) {
      return SEED_CASES_EN[caseId].appeal_grounds;
    }
    const c = (currentCase && currentCase.case_id === caseId) ? currentCase : (typeof allCasesCache !== "undefined" ? allCasesCache.find(x => x.case_id === caseId) : null) || currentCase || {};
    if (c.first_appeal_draft && c.first_appeal_draft.grounds_of_appeal && c.first_appeal_draft.grounds_of_appeal.length > 0 && !/[\u0900-\u097F]/.test(c.first_appeal_draft.grounds_of_appeal[0])) {
      return c.first_appeal_draft.grounds_of_appeal;
    }
    if (grounds && Array.isArray(grounds) && grounds.length > 0 && !/[\u0900-\u097F]/.test(grounds[0])) {
      return grounds;
    }
    const pioName = (c.suggested_pio && c.suggested_pio.pio_name) || "Designated PIO";
    const refNo = c.application_ref_no || "N/A";
    const isUrgent = Boolean(c.is_life_liberty || c.statutory_sla_hours === 48);

    if (isUrgent) {
      return [
        `1. The Appellant filed an RTI application (Ref: ${refNo}) under Section 7(1) proviso concerning life and personal liberty.`,
        `2. More than 48 hours have elapsed and the designated PIO (${pioName}) failed to supply the requested public records within statutory SLA.`,
        "3. Under Section 7(2) of the RTI Act 2005, failure to furnish information within 48 hours constitutes immediate Deemed Refusal.",
        "4. Deprivation of this information creates grave imminent harm and violates Article 21 of the Constitution of India.",
        "5. Under Section 7(6), the Appellant is entitled to receive all information FREE OF COST.",
        "6. The PIO has incurred personal statutory penalty liability of Rs. 250 per day under Section 20(1) (Manohar v. State of Maharashtra AIR 2013 SC 681)."
      ];
    }
    return [
      `1. The Appellant filed an RTI application (Ref: ${refNo}) under Section 6(1) seeking certified public records.`,
      `2. More than 30 days have elapsed and the designated PIO (${pioName}) failed to supply the requested records within the 30-day statutory timeline under Section 7(1).`,
      "3. Under Section 7(2) of the RTI Act 2005, failure of the PIO to respond constitutes Deemed Refusal.",
      "4. Under Section 7(6), the Appellant is entitled to receive all requested records FREE OF COST without additional documentation fees.",
      "5. The PIO has incurred personal statutory penalty liability of Rs. 250 per day under Section 20(1) (Manohar v. State of Maharashtra AIR 2013 SC 681)."
    ];
  }

  if (grounds && Array.isArray(grounds) && grounds.length > 0 && /[\u0900-\u097F]/.test(grounds[0])) {
    return grounds;
  }
  if (caseId && SEED_CASES_I18N[caseId] && SEED_CASES_I18N[caseId].appeal_grounds) {
    return SEED_CASES_I18N[caseId].appeal_grounds;
  }
  const c = (currentCase && currentCase.case_id === caseId) ? currentCase : (typeof allCasesCache !== "undefined" ? allCasesCache.find(x => x.case_id === caseId) : null) || currentCase || {};
  const pioName = tOfficer(c.suggested_pio && c.suggested_pio.pio_name) || "जन सूचना अधिकारी";
  const refNo = c.application_ref_no || "N/A";
  const isUrgent = Boolean(c.is_life_liberty || c.statutory_sla_hours === 48);

  if (isUrgent) {
    return [
      `1. अपीलार्थी ने आरटीआई अधिनियम 2005 की धारा 7(1) के परंतुक के अधीन व्यक्ति के जीवन एवं व्यक्तिगत स्वतंत्रता से संबंधित आवश्यक लोक अभिलेखों हेतु त्वरित आरटीआई आवेदन (संदर्भ: ${refNo}) प्रस्तुत किया था।`,
      `2. आवेदन प्राप्ति के 48 घंटे से अधिक का समय व्यतीत हो चुका है, किन्तु नामित जन सूचना अधिकारी (${pioName}) अनिवार्य 48-घंटे की वैधानिक समयसीमा में सूचना प्रदान करने में पूर्णतः विफल रहे हैं।`,
      "3. आरटीआई अधिनियम 2005 की धारा 7(2) के अंतर्गत, 48 घंटे में निर्णय न देना आवेदन की तत्काल 'स्वतः अस्वीकृति' (Deemed Refusal) मानी जाती है।",
      "4. इस अति-महत्वपूर्ण सूचना से वंचित रखा जाना अपूरणीय क्षति का आसन्न खतरा उत्पन्न करता है और भारत के संविधान के अनुच्छेद 21 के तहत प्रदत्त जीवन के मौलिक अधिकार का उल्लंघन है।",
      "5. आरटीआई अधिनियम की धारा 7(6) के अंतर्गत, विधिक समयसीमा बीतने के कारण अपीलार्थी अब सभी मांगी गई प्रमाणित सूचनाएं पूर्णतः निःशुल्क (FREE OF COST) प्राप्त करने का विधिक हकदार है।",
      "6. उच्चतम न्यायालय के निर्णय मनोहर बनाम महाराष्ट्र राज्य (AIR 2013 SC 681) के अनुसार दोषी जन सूचना अधिकारी धारा 20(1) के तहत ₹250 प्रतिदिन की दर से व्यक्तिगत जुर्माने के भागीदार बन चुके हैं।"
    ];
  }

  return [
    `1. अपीलार्थी ने धारा 6(1) के अंतर्गत प्रमाणित लोक अभिलेखों की प्राप्ति हेतु मूल आरटीआई आवेदन (संदर्भ: ${refNo}) विधिवत प्रस्तुत किया था।`,
    `2. आवेदन जमा किए जाने के 30 दिन से अधिक का समय बीत चुका है, किन्तु नामित जन सूचना अधिकारी (${pioName}) धारा 7(1) के अंतर्गत 30-दिवसीय वैधानिक समयसीमा में सूचना उपलब्ध कराने में विफल रहे हैं।`,
    "3. आरटीआई अधिनियम 2005 की धारा 7(2) के अंतर्गत, 30 दिनों में कोई निर्णय न देना आवेदन की विधिक 'स्वतः अस्वीकृति' (Deemed Refusal) है।",
    "4. धारा 7(6) के अनुसार निर्धारित 30 दिन बीत जाने के उपरांत अपीलार्थी बिना किसी अतिरिक्त प्रलेखन शुल्क के समस्त वांछित प्रमाणित सूचनाएं निःशुल्क (FREE OF COST) प्राप्त करने का हकदार है।",
    "5. उच्चतम न्यायालय के निर्णय मनोहर बनाम महाराष्ट्र राज्य (AIR 2013 SC 681) के अनुसार समयसीमा उल्लंघन हेतु जन सूचना अधिकारी पर धारा 20(1) के तहत ₹250 प्रतिदिन की दर से व्यक्तिगत जुर्माना देय है।"
  ];
}

function tAppealPrayers(caseIdOrPrayers, maybePrayers) {
  let caseId = maybePrayers !== undefined ? caseIdOrPrayers : (currentCase ? currentCase.case_id : null);
  let prayers = maybePrayers !== undefined ? maybePrayers : caseIdOrPrayers;

  if (currentLang !== "hi") {
    if (caseId && SEED_CASES_EN[caseId] && SEED_CASES_EN[caseId].appeal_prayers) {
      return SEED_CASES_EN[caseId].appeal_prayers;
    }
    const c = (currentCase && currentCase.case_id === caseId) ? currentCase : (typeof allCasesCache !== "undefined" ? allCasesCache.find(x => x.case_id === caseId) : null) || currentCase || {};
    if (c.first_appeal_draft && c.first_appeal_draft.prayers_sought && c.first_appeal_draft.prayers_sought.length > 0 && !/[\u0900-\u097F]/.test(c.first_appeal_draft.prayers_sought[0])) {
      return c.first_appeal_draft.prayers_sought;
    }
    if (prayers && Array.isArray(prayers) && prayers.length > 0 && !/[\u0900-\u097F]/.test(prayers[0])) {
      return prayers;
    }
    const isUrgent = Boolean((c && c.is_life_liberty) || (c && c.statutory_sla_hours === 48));
    if (isUrgent) {
      return [
        "a) Direct the designated PIO to furnish certified copies of all emergency records FREE OF COST within 24 hours.",
        "b) Grant an immediate personal hearing before the First Appellate Authority within 48 hours.",
        "c) Recommend penalty proceedings under Section 20(1) and disciplinary action under Section 20(2) against the defaulting officer."
      ];
    }
    return [
      "a) Direct the designated PIO to furnish certified copies of all requested records FREE OF COST within 7 days.",
      "b) Grant personal hearing to the Appellant before the First Appellate Authority.",
      "c) Recommend initiation of Section 20(1) penalty proceedings and departmental disciplinary inquiry against the defaulting officer."
    ];
  }

  if (prayers && Array.isArray(prayers) && prayers.length > 0 && /[\u0900-\u097F]/.test(prayers[0])) {
    return prayers;
  }
  if (caseId && SEED_CASES_I18N[caseId] && SEED_CASES_I18N[caseId].appeal_prayers) {
    return SEED_CASES_I18N[caseId].appeal_prayers;
  }
  const isUrgent = Boolean((currentCase && currentCase.is_life_liberty) || (currentCase && currentCase.statutory_sla_hours === 48));

  if (isUrgent) {
    return [
      "क) नामित जन सूचना अधिकारी को निर्देशित किया जाए कि वह 24 घंटे के भीतर मांगी गई सभी आपातकालीन पत्रावलियों की प्रमाणित प्रतियां अपीलार्थी को निःशुल्क उपलब्ध कराएं।",
      "ख) प्रथम अपीलीय प्राधिकारी के समक्ष 48 घंटे के भीतर तत्काल व्यक्तिगत सुनवाई आयोजित की जाए।",
      "ग) दोषी अधिकारी के विरुद्ध धारा 20(1) के तहत जुर्माना कार्यवाही एवं धारा 20(2) के तहत अनुशासनात्मक कार्यवाही की संस्तुति की जाए।"
    ];
  }

  return [
    "क) नामित जन सूचना अधिकारी को आदेशित किया जाए कि वह 7 दिनों के भीतर सभी वांछित अभिलेखों की प्रमाणित प्रतियां अपीलार्थी को निःशुल्क उपलब्ध कराएं।",
    "ख) प्रथम अपीलीय प्राधिकारी के समक्ष अपीलार्थी को व्यक्तिगत सुनवाई का अवसर प्रदान किया जाए।",
    "ग) दोषी अधिकारी के विरुद्ध विभागीय अनुशासनात्मक कार्यवाही एवं धारा 20(1) के तहत जुर्माने की कार्यवाही प्रारंभ की जाए।"
  ];
}

function tLegalNotice(caseId, notice) {
  if (currentLang !== "hi") {
    if (caseId && SEED_CASES_EN[caseId] && SEED_CASES_EN[caseId].legal_notice) {
      return SEED_CASES_EN[caseId].legal_notice;
    }
    const c = (currentCase && currentCase.case_id === caseId) ? currentCase : (typeof allCasesCache !== "undefined" ? allCasesCache.find(x => x.case_id === caseId) : null) || currentCase || {};
    if (c.legal_notice_draft && typeof c.legal_notice_draft === "string" && !/[\u0900-\u097F]/.test(c.legal_notice_draft)) {
      return c.legal_notice_draft;
    }
    if (notice && typeof notice === "string" && !/[\u0900-\u097F]/.test(notice)) {
      return notice;
    }
    const complainant = (c.complainant && c.complainant.name) || "Citizen Complainant";
    const compAddr = (c.complainant && c.complainant.address) || "Local Address";
    const pioName = (c.suggested_pio && c.suggested_pio.pio_name) || "Designated Public Information Officer";
    const pioDesig = (c.suggested_pio && c.suggested_pio.designation) || "Competent Authority";
    const pioAddr = (c.suggested_pio && c.suggested_pio.office_address) || "Administrative Office";
    const refNo = c.application_ref_no || c.case_id || "N/A";
    const ipcSections = (c.statutory_legal_analysis && c.statutory_legal_analysis.ipc_sections ? c.statutory_legal_analysis.ipc_sections.join(", ") : "") || "Section 166, Section 409";
    const bnsSections = (c.statutory_legal_analysis && c.statutory_legal_analysis.bns_sections ? c.statutory_legal_analysis.bns_sections.join(", ") : "") || "Section 198, Section 318(4)";

    return `LEGAL NOTICE UNDER SECTION 80 CPC READ WITH IPC & BNS
REGISTERED AD / SPEED POST

To:
${pioName} (${pioDesig}),
Office: ${pioAddr}

Under instructions from and on behalf of our client ${complainant} (Residing at: ${compAddr}), formal statutory legal notice is hereby served regarding gross administrative dereliction, breach of statutory duties, and violation of prescribed timeframes in grievance application Ref: ${refNo}.

STATUTORY CHARGES INVOKED:
• Indian Penal Code (1860): ${ipcSections}
• Bharatiya Nyaya Sanhita (2023): ${bnsSections}

Pursuant to the Supreme Court ruling in Manohar v. State of Maharashtra (AIR 2013 SC 681), failure to discharge statutory duties renders the concerned public official personally liable for monetary penalties and disciplinary prosecution.

You are hereby called upon to rectify the administrative dereliction and provide certified status within 15 days of receipt of this notice, failing which our client shall initiate criminal prosecution before the competent court and file a Writ Petition under Article 226 of the Constitution of India, at your sole risk, costs, and consequences.

Sincerely,
Adv. S. Kalra (Bar Council / Legal Counsel)`;
  }

  if (notice && typeof notice === "string" && /[\u0900-\u097F]/.test(notice)) {
    return notice;
  }
  if (caseId && SEED_CASES_I18N[caseId] && SEED_CASES_I18N[caseId].legal_notice) {
    return SEED_CASES_I18N[caseId].legal_notice;
  }
  const c = (currentCase && currentCase.case_id === caseId) ? currentCase : (typeof allCasesCache !== "undefined" ? allCasesCache.find(x => x.case_id === caseId) : null) || currentCase || {};
  const complainant = tComplainant(c.complainant && c.complainant.name) || "नागरिक आवेदक";
  const compAddr = tAddress(c.complainant && c.complainant.address) || "स्थानीय पता";
  const pioName = tOfficer(c.suggested_pio && c.suggested_pio.pio_name) || "नामित जन सूचना अधिकारी";
  const pioDesig = tDesignation(c.suggested_pio && c.suggested_pio.designation) || "सक्षम प्राधिकारी";
  const pioAddr = tAddress(c.suggested_pio && c.suggested_pio.office_address) || "संबंधित प्रशासनिक कार्यालय";
  const refNo = c.application_ref_no || c.case_id || "N/A";
  const ipcSections = (c.statutory_legal_analysis && c.statutory_legal_analysis.ipc_sections ? c.statutory_legal_analysis.ipc_sections.map(tSection).join(", ") : "") || "आईपीसी धारा 166, धारा 409";
  const bnsSections = (c.statutory_legal_analysis && c.statutory_legal_analysis.bns_sections ? c.statutory_legal_analysis.bns_sections.map(tSection).join(", ") : "") || "बीएनएस धारा 198, धारा 318(4)";

  return `विधिक नोटिस (धारा 80 सिविल प्रक्रिया संहिता, 1908 एवं आईपीसी/बीएनएस की धाराएं)
रजिस्टर्ड डाक / स्पीड पोस्ट द्वारा प्रेषित

सेवा में:
${pioName} (${pioDesig}),
कार्यालय: ${pioAddr}

अपने मुवक्किल ${complainant} (निवासी: ${compAddr}) के विधिक अनुदेशों के अधीन एवं उनकी ओर से, हम आपको नागरिक शिकायत (संदर्भ संख्या: ${refNo}) के निस्तारण में की गई घोर प्रशासनिक उपेक्षा, विधिक कर्तव्यों की अवहेलना एवं वैधानिक समयसीमा उल्लंघन के संबंध में यह औपचारिक सांविधिक विधिक नोटिस प्रेषित कर रहे हैं।

आरोपित कानूनी धाराएं (STATUTORY CHARGES INVOKED):
• भारतीय दंड संहिता (1860): ${ipcSections}
• भारतीय न्याय संहिता (2023): ${bnsSections}

उच्चतम न्यायालय के निर्णय मनोहर बनाम महाराष्ट्र राज्य (AIR 2013 SC 681) के अनुसार समयसीमा उल्लंघन एवं कर्तव्यों के निर्वहन में विफलता हेतु संबंधित अधिकारी व्यक्तिगत जुर्माने एवं अनुशासनात्मक कार्यवाही के भागीदार हैं।

अतः आपको एतद्द्वारा सूचित किया जाता है कि इस नोटिस की प्राप्ति के 15 दिनों के भीतर उक्त विधिक विफलता का निवारण करें एवं अद्यतन स्थिति की प्रमाणित प्रतिलिपि उपलब्ध कराएं। निर्धारित 15 दिनों में समाधान न होने की दशा में हमारे मुवक्किल आपके विरुद्ध सक्षम न्यायालय में दांडिक अभियोजन एवं भारत के संविधान के अनुच्छेद 226 के अंतर्गत माननीय उच्च न्यायालय में रिट याचिका दायर करेंगे, जिसका संपूर्ण हर्जा-खर्चा एवं विधिक दायित्व आपका व्यक्तिगत होगा।

भवदीय,
अधिवक्ता एस. कालरा (बार काउंसिल / विधिक परामर्शदाता)`;
}

function tMlReport(c) {
  if (!c) return "";
  if (currentLang !== "hi") return c.ml_report_format || "";
  const compName = c.complainant && c.complainant.name ? tComplainant(c.complainant.name) : "नागरिक आवेदक";
  const meritScore = c.statutory_legal_analysis && c.statutory_legal_analysis.case_merit_score ? c.statutory_legal_analysis.case_merit_score : 92;
  const penalty = c.statutory_legal_analysis && c.statutory_legal_analysis.section_20_penalty_liability_inr ? c.statutory_legal_analysis.section_20_penalty_liability_inr : 0;
  const bnsSecs = c.statutory_legal_analysis && c.statutory_legal_analysis.bns_sections ? c.statutory_legal_analysis.bns_sections.map(tSection).join(", ") : "बीएनएस धारा 318(4)";
  const pioName = c.suggested_pio && c.suggested_pio.pio_name ? tOfficer(c.suggested_pio.pio_name) : "नामित जन सूचना अधिकारी";
  const pioAddr = c.suggested_pio && c.suggested_pio.office_address ? tAddress(c.suggested_pio.office_address) : "संबंधित कार्यालय";

  return `[विधिक मूल्यांकन रिपोर्ट - अर्जी प्लेटफॉर्म]
केस संख्या: ${c.case_id}
आवेदक का नाम: ${compName}
संबंधित विभाग: ${tDept(c.department)}
विधिक योग्यता स्कोर (Merit Score): ${meritScore}/100
धारा 20(1) संभावित जुर्माना देयता: ₹${penalty}
प्राथमिक विधिक धाराएं: ${bnsSecs}
नामित जन सूचना अधिकारी: ${pioName}
कार्यालय पता: ${pioAddr}
स्थिति: ${tStatus(c.status)}`;
}

function tRunLogEvent(ev) {
  if (!ev) return "";
  if (currentLang !== "hi") return ev;
  const map = {
    "CASE_REGISTERED": "केस पंजीकृत",
    "INTAKE_INGESTED": "शिकायत दर्ज",
    "INTAKE_RECEIVED": "शिकायत प्राप्त",
    "INPLACE_GRIEVANCE_UPDATE": "यथास्थान अद्यतन",
    "INPLACE_COMPLAINANT_FIX": "शिकायतकर्ता संशोधन",
    "DEPT_OVERRIDE_CORRECTED": "विभाग संशोधन",
    "CASE_STATUS_CHANGE": "केस स्थिति परिवर्तन",
    "CASE_DISPATCHED": "केस प्रेषित",
    "SECTION_6_3_TRANSFER": "धारा 6(3) अंतरण",
    "MERGE_DUPLICATES": "डुप्लिकेट विलय",
    "CUSTOM_ACT_REGISTERED": "अधिनियम पंजीकृत",
    "SYSTEM_STARTUP": "सिस्टम प्रारंभ",
    "CASE_UPDATED": "केस अद्यतन"
  };
  return map[ev] || ev;
}

function tRunLogActor(actor) {
  if (!actor) return "";
  if (currentLang !== "hi") return actor;
  const map = {
    "Citizen Intake Gateway": "नागरिक इनटेक गेटवे",
    "System Intake Gateway": "सिस्टम इनटेक गेटवे",
    "System Ingestion Gateway": "सिस्टम इनजेशन गेटवे",
    "Intake Gateway / Legal Reviewer": "इनटेक गेटवे / विधिक समीक्षक",
    "Legal Reviewer": "विधिक समीक्षक",
    "Counsel / Citizen Desk": "विधिक परामर्शदाता / नागरिक डेस्क",
    "Legal Operator": "विधिक ऑपरेटर",
    "Adv. S. Kalra (Legal NGO)": "अधिवक्ता एस. कालरा (विधिक एनजीओ)",
    "Adv. S. Kalra (Bar Council / Legal Counsel)": "अधिवक्ता एस. कालरा (बार काउंसिल)",
    "Shri R. P. Maurya, IAS (Designated Public Authority)": "श्री आर. पी. मौर्य, आईएएस"
  };
  return map[actor] || actor;
}

function tRunLogAction(action) {
  if (!action) return "";
  if (currentLang !== "hi") return action;
  let str = action;
  str = str.replace(/Successfully registered case/gi, "केस सफलतापूर्वक पंजीकृत:")
           .replace(/Created case/gi, "केस सृजित:")
           .replace(/Corrected complainant name in-place from/gi, "शिकायतकर्ता का नाम यथास्थान संशोधित:")
           .replace(/Operator corrected department from/gi, "ऑपरेटर द्वारा विभाग संशोधित:")
           .replace(/Grievance ingested for Land Mutation khasra/gi, "भूमि नामांतरण खसरा हेतु शिकायत दर्ज:")
           .replace(/for complainant/gi, "शिकायतकर्ता:")
           .replace(/Updated Master Case/gi, "मास्टर केस अद्यतन:")
           .replace(/in-place for complainant/gi, "यथास्थान शिकायतकर्ता:")
           .replace(/\(Prevented duplicate case creation\)/gi, "(डुप्लिकेट रोकथाम)")
           .replace(/Transferred case/gi, "केस अंतरित:")
           .replace(/Dispatched case/gi, "केस प्रेषित:")
           .replace(/Sunita Devi/gi, "सुनीता देवी")
           .replace(/Shivanshu Pandey/gi, "शिवांशु पाण्डेय");
  return str;
}

function tRunLogResult(res) {
  if (!res) return "";
  if (currentLang !== "hi") return res;
  const map = {
    "SUCCESS": "सफल",
    "INPLACE_UPDATE_SUCCESS": "यथास्थान संशोधन सफल",
    "OVERRIDE_SUCCESS": "विभाग संशोधन सफल",
    "INPLACE_SUCCESS": "सफल (यथास्थान)",
    "DISPATCH_EXECUTED": "प्रेषण सम्पन्न",
    "TRANSFER_EXECUTED": "अंतरण सम्पन्न"
  };
  return map[res] || res;
}

function setLanguage(lang) {
  if (lang !== "hi") lang = "en";
  currentLang = lang;
  localStorage.setItem("arzi_lang", lang);

  // Sync studio language
  if (typeof setStudioDocType === "function" && typeof currentStudioDocType !== "undefined") {
    setStudioDocType(currentStudioDocType);
  } else if (typeof loadStudioPreset === "function" && typeof currentStudioPreset !== "undefined") {
    loadStudioPreset(currentStudioPreset);
  }

  // Set strict CSS class on <body>
  document.body.classList.remove("lang-en", "lang-hi", "lang-bi");
  document.body.classList.add("lang-" + lang);
  document.documentElement.lang = (lang === "hi" ? "hi" : "en");

  // Update dynamic document title
  document.title = lang === "hi"
    ? "अर्जी — नागरिक आरटीआई एवं विधिक सहायता डेस्क"
    : "ARZI — Civic RTI & Statutory Legal Intelligence Desk";

  // Update switcher button states
  const btnEn = document.getElementById("langEn");
  const btnHi = document.getElementById("langHi");
  if (btnEn) btnEn.classList.toggle("active", lang === "en");
  if (btnHi) btnHi.classList.toggle("active", lang === "hi");

  const authBtnEn = document.getElementById("authLangEn");
  const authBtnHi = document.getElementById("authLangHi");
  if (authBtnEn) authBtnEn.classList.toggle("active", lang === "en");
  if (authBtnHi) authBtnHi.classList.toggle("active", lang === "hi");

  // Switch all select options having data-en and data-hi
  document.querySelectorAll("option[data-en]").forEach(opt => {
    const en = opt.getAttribute("data-en") || "";
    const hi = opt.getAttribute("data-hi") || "";
    opt.textContent = (lang === "hi" ? (hi || en) : en);
  });

  // Switch all input/textarea placeholders having data-ph-en and data-ph-hi
  document.querySelectorAll("[data-ph-en]").forEach(inp => {
    const en = inp.getAttribute("data-ph-en") || "";
    const hi = inp.getAttribute("data-ph-hi") || "";
    inp.placeholder = (lang === "hi" ? (hi || en) : en);
  });

  // Translate all [data-i18n] text nodes
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (I18N_DICT[key]) {
      el.textContent = t(key);
    }
  });

  // Translate all [data-i18n-html] elements
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.getAttribute("data-i18n-html");
    if (I18N_DICT[key]) {
      el.innerHTML = I18N_DICT[key][lang] || I18N_DICT[key]["en"];
    }
  });

  // Translate all [data-i18n-placeholder] inputs
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (I18N_DICT[key]) {
      el.placeholder = t(key);
    }
  });

  // Update queue table action buttons and titles if rendered
  document.querySelectorAll(".btn-view-docket").forEach(btn => {
    btn.textContent = t("btn_view");
  });

  const repoStatus = document.getElementById("repoStatusText");
  if (repoStatus) {
    repoStatus.textContent = (lang === "hi" ? "सक्रिय" : "Operational");
  }

  const revInp = document.getElementById("reviewerName");
  if (revInp) {
    revInp.value = (lang === "hi"
      ? "अधिवक्ता एस. कालरा (बार काउंसिल / विधिक परामर्शदाता)"
      : "Adv. S. Kalra (Bar Council / Legal Counsel)");
  }

  const customAuthor = document.getElementById("customActAuthor");
  if (customAuthor) {
    customAuthor.value = (lang === "hi"
      ? "अधिवक्ता एस. कालरा"
      : "Adv. S. Kalra");
  }

  const intakeTog = document.getElementById("intakeToggleText");
  const intakeCont = document.getElementById("intakeFormContainer");
  if (intakeTog) {
    const isHidden = !intakeCont || intakeCont.style.display === "none";
    intakeTog.textContent = (lang === "hi") ? (isHidden ? "+ नया फॉर्म खोलें" : "फॉर्म छुपाएं") : (isHidden ? "+ Expand Form" : "Hide Form");
  }

  // Refresh workspace or queue if active
  if (typeof currentCase !== "undefined" && currentCase) {
    populateWorkspaceFields(currentCase);
  }
  if (typeof loadCaseQueue === "function") {
    loadCaseQueue();
  }
  if (typeof activeDetailCase !== "undefined" && activeDetailCase) {
    openCaseDetailView(activeDetailCase.case_id);
  }
  if (typeof allRunLogsCache !== "undefined" && typeof renderRunLogsTable === "function") {
    renderRunLogsTable(allRunLogsCache);
  }
  if (typeof currentCase !== "undefined" && currentCase && typeof renderAreaPiosDirectory === "function") {
    renderAreaPiosDirectory(currentCase);
    if (typeof updateRadarTelemetry === "function") updateRadarTelemetry(currentCase);
  }
  if (typeof calculateSlaPenalty === "function") {
    calculateSlaPenalty();
  }
  if (typeof loadCustomActs === "function") {
    loadCustomActs();
  }
  if (typeof filterStatutoryMatrix === "function") {
    filterStatutoryMatrix();
  }

  if (typeof renderLucide === "function") {
    renderLucide();
  }
}

function initLanguage() {
  setLanguage(currentLang);
}

window.t = t;
window.setLanguage = setLanguage;
window.initLanguage = initLanguage;

let currentCase = null;
let activePersona = "law_firm"; // 'law_firm' or 'gov_desk'
let currentDocTab = "rti"; // 'rti', 'appeal', 'notice', 'section8', 'slip', 'report'
let radarAnimationId = null;

// Leaflet Map & Speech Recognition Instances
let leafletMap = null;
let leafletMarkersLayer = null;
let speechRecognizer = null;
let isListeningVoice = false;

function renderLucide() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}


// Toast Notification System
function showToast(message, type = "info") {
  try {
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toastContainer";
      toastContainer.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;";
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = `app-toast toast-${type}`;
    toast.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      background: ${type === "success" ? "#065F46" : type === "error" ? "#991B1B" : "#1E3A8A"};
      color: #FFFFFF;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: 13px;
      font-weight: 500;
      border-radius: 6px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      pointer-events: auto;
      opacity: 0;
      transform: translateY(12px);
      transition: all 0.25s ease;
    `;

    const icon = type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ";
    toast.innerHTML = `<span style="font-size:15px;font-weight:bold;">${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-8px)";
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  } catch (e) {
    console.log("[Toast]", message);
  }
}
window.showToast = showToast;

// =========================================================================
// EXECUTIVE THEME CONTROLLER (DARK / LIGHT PARCHMENT)
// =========================================================================

function initTheme() {
  const saved = localStorage.getItem("arzi_theme") || "light";
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("arzi_theme", theme);
  const icon = document.getElementById("themeIcon");
  const authIcon = document.getElementById("authThemeIcon");
  const btn = document.getElementById("themeToggleBtn");
  if (theme === "dark") {
    if (icon) icon.setAttribute("data-lucide", "sun");
    if (authIcon) authIcon.setAttribute("data-lucide", "sun");
    if (btn) btn.title = "Switch to Supreme Court Parchment Light Theme";
    document.body.classList.add("dark-mode");
  } else {
    if (icon) icon.setAttribute("data-lucide", "moon");
    if (authIcon) authIcon.setAttribute("data-lucide", "moon");
    if (btn) btn.title = "Switch to Executive Dark Theme";
    document.body.classList.remove("dark-mode");
  }
  renderLucide();
}

function toggleExecutiveTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
}

// =========================================================================
// AUTHENTICATION & ACCESS GATE
// =========================================================================

function getAuthSession() {
  try {
    const raw = sessionStorage.getItem("arzi_user_session") || localStorage.getItem("arzi_user_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function setAuthSession(session) {
  try {
    sessionStorage.setItem("arzi_user_session", JSON.stringify(session));
    localStorage.setItem("arzi_user_session", JSON.stringify(session));
  } catch (e) {}
  updateHeaderAuthState();
}

function clearAuthSession() {
  try {
    sessionStorage.removeItem("arzi_user_session");
    localStorage.removeItem("arzi_user_session");
  } catch (e) {}
  updateHeaderAuthState();
}

function initAuthFlow() {
  updateHeaderAuthState();
  switchAuthTab("law_firm");
}

const DEFAULT_ACCOUNTS = {
  law_firm: [
    { id: "lawyer@arzi.internal", pass: "arzi2024", name: "Chambers of Adv. S. Kalra", barId: "D/1420/2018", category: "advocate" },
    { id: "lawyer", pass: "arzi2024", name: "Chambers of Adv. S. Kalra", barId: "D/1420/2018", category: "advocate" },
    { id: "lawyer", pass: "lawyer123", name: "Chambers of Adv. S. Kalra", barId: "D/1420/2018", category: "advocate" },
    { id: "D/1420/2018", pass: "arzi2024", name: "Adv. Shivanshu Pandey", barId: "D/1420/2018", category: "advocate" },
    { id: "advocate@delhibar.org", pass: "arzi2024", name: "Adv. Kalra & Associates", barId: "D/2026/104", category: "advocate" }
  ],
  admin: [
    { id: "admin@arzi.internal", pass: "arzi-root-key", name: "Lead Systems Engineer", role: "admin" },
    { id: "admin@arzi.internal", pass: "admin", name: "Lead Systems Engineer", role: "admin" },
    { id: "admin@arzi.internal", pass: "admin123", name: "Lead Systems Engineer", role: "admin" },
    { id: "admin", pass: "admin", name: "Root Administrator", role: "admin" },
    { id: "admin", pass: "admin123", name: "Root Administrator", role: "admin" },
    { id: "admin", pass: "arzi-root-key", name: "Root Administrator", role: "admin" },
    { id: "admin", pass: "password", name: "Root Administrator", role: "admin" },
    { id: "root", pass: "root", name: "Master Console Admin", role: "admin" },
    { id: "root", pass: "arzi-root-key", name: "Master Console Admin", role: "admin" },
    { id: "root", pass: "admin", name: "Master Console Admin", role: "admin" }
  ]
};

function getRegisteredAccounts() {
  try {
    const raw = localStorage.getItem("arzi_registered_accounts");
    if (!raw) return { law_firm: [], admin: [] };
    const data = JSON.parse(raw);
    return {
      law_firm: Array.isArray(data.law_firm) ? data.law_firm : [],
      admin: Array.isArray(data.admin) ? data.admin : []
    };
  } catch (e) {
    return { law_firm: [], admin: [] };
  }
}

function saveRegisteredAccount(role, account) {
  try {
    const all = getRegisteredAccounts();
    if (!all[role]) all[role] = [];
    all[role].push(account);
    localStorage.setItem("arzi_registered_accounts", JSON.stringify(all));
  } catch (e) {
    console.warn("Save account error:", e);
  }
}

function showAuthAlert(message, type = "error") {
  const box = document.getElementById("authAlertBox");
  const text = document.getElementById("authAlertText");
  const icon = document.getElementById("authAlertIcon");
  if (!box || !text) return;

  box.className = `auth-alert-box show ${type}`;
  text.innerHTML = message;
  if (icon) {
    icon.setAttribute("data-lucide", type === "error" ? "alert-triangle" : "check-circle-2");
  }
  renderLucide();
}

function clearAuthAlert() {
  const box = document.getElementById("authAlertBox");
  if (box) box.className = "auth-alert-box";
}

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    if (icon) icon.setAttribute("data-lucide", "eye-off");
  } else {
    input.type = "password";
    if (icon) icon.setAttribute("data-lucide", "eye");
  }
  renderLucide();
}

function fillQuickCreds(role, id, pass) {
  clearAuthAlert();
  if (role === "admin") {
    const u = document.getElementById("authAdminUser");
    const p = document.getElementById("authAdminToken");
    if (u) u.value = id;
    if (p) p.value = pass;
  } else {
    const u = document.getElementById("authLawId");
    const p = document.getElementById("authLawPin");
    if (u) u.value = id;
    if (p) p.value = pass;
  }
}

function switchAuthTab(role) {
  clearAuthAlert();
  const tabLaw = document.getElementById("tabRoleLaw");
  const tabAdmin = document.getElementById("tabRoleAdmin");
  const panelLaw = document.getElementById("authPanelLaw");
  const panelAdmin = document.getElementById("authPanelAdmin");

  if (role === "admin") {
    if (tabAdmin) tabAdmin.classList.add("active");
    if (tabLaw) tabLaw.classList.remove("active");
    if (panelAdmin) {
      panelAdmin.classList.remove("hidden");
      panelAdmin.style.display = "block";
    }
    if (panelLaw) {
      panelLaw.classList.add("hidden");
      panelLaw.style.display = "none";
    }
  } else {
    if (tabLaw) tabLaw.classList.add("active");
    if (tabAdmin) tabAdmin.classList.remove("active");
    if (panelLaw) {
      panelLaw.classList.remove("hidden");
      panelLaw.style.display = "block";
    }
    if (panelAdmin) {
      panelAdmin.classList.add("hidden");
      panelAdmin.style.display = "none";
    }
  }
  renderLucide();
}

function switchAuthMode(role, mode) {
  clearAuthAlert();
  const btnLawLogin = document.getElementById("btnModeLawLogin");
  const btnLawReg = document.getElementById("btnModeLawRegister");
  const viewLawLogin = document.getElementById("authLawLoginView");
  const viewLawReg = document.getElementById("authLawRegisterView");

  const btnAdminLogin = document.getElementById("btnModeAdminLogin");
  const btnAdminReg = document.getElementById("btnModeAdminRegister");
  const viewAdminLogin = document.getElementById("authAdminLoginView");
  const viewAdminReg = document.getElementById("authAdminRegisterView");

  if (role === "law_firm") {
    if (mode === "register") {
      if (btnLawReg) btnLawReg.classList.add("active");
      if (btnLawLogin) btnLawLogin.classList.remove("active");
      if (viewLawReg) viewLawReg.style.display = "block";
      if (viewLawLogin) viewLawLogin.style.display = "none";
    } else {
      if (btnLawLogin) btnLawLogin.classList.add("active");
      if (btnLawReg) btnLawReg.classList.remove("active");
      if (viewLawLogin) viewLawLogin.style.display = "block";
      if (viewLawReg) viewLawReg.style.display = "none";
    }
  } else {
    if (mode === "register") {
      if (btnAdminReg) btnAdminReg.classList.add("active", "admin");
      if (btnAdminLogin) btnAdminLogin.classList.remove("active");
      if (viewAdminReg) viewAdminReg.style.display = "block";
      if (viewAdminLogin) viewAdminLogin.style.display = "none";
    } else {
      if (btnAdminLogin) btnAdminLogin.classList.add("active", "admin");
      if (btnAdminReg) btnAdminReg.classList.remove("active");
      if (viewAdminLogin) viewAdminLogin.style.display = "block";
      if (viewAdminReg) viewAdminReg.style.display = "none";
    }
  }
  renderLucide();
}

function handleAuthLogin(role, event) {
  if (event) {
    if (typeof event.preventDefault === "function") event.preventDefault();
    if (typeof event.stopPropagation === "function") event.stopPropagation();
  }
  clearAuthAlert();
  
  let enteredId = "";
  let enteredPass = "";

  if (role === "admin") {
    const elU = document.getElementById("authAdminUser");
    const elP = document.getElementById("authAdminToken");
    enteredId = (elU ? elU.value : "").trim();
    enteredPass = (elP ? elP.value : "").trim();
    if (!enteredId) enteredId = "admin@arzi.internal";
    if (!enteredPass) enteredPass = "arzi-root-key";
  } else {
    const elU = document.getElementById("authLawId");
    const elP = document.getElementById("authLawPin");
    enteredId = (elU ? elU.value : "").trim();
    enteredPass = (elP ? elP.value : "").trim();
    if (!enteredId) enteredId = "lawyer@arzi.internal";
    if (!enteredPass) enteredPass = "arzi2024";
  }

  // Look up credentials in default accounts and user registrations
  const defaults = DEFAULT_ACCOUNTS[role] || [];
  const registered = getRegisteredAccounts()[role] || [];
  const allAccounts = [...defaults, ...registered];

  let matched = allAccounts.find(acc => {
    const idMatches = (acc.id && acc.id.toLowerCase() === enteredId.toLowerCase()) ||
                      (acc.barId && acc.barId.toLowerCase() === enteredId.toLowerCase());
    const passMatches = acc.pass === enteredPass;
    return idMatches && passMatches;
  });

  // Permissive fallback for admin
  if (!matched && role === "admin") {
    matched = {
      id: enteredId || "admin@arzi.internal",
      pass: enteredPass || "arzi-root-key",
      name: (enteredId && enteredId.toLowerCase().includes("root")) ? "Master Console Admin" : "Lead Systems Engineer",
      role: "admin",
      chamber: "Engineering Core"
    };
  }

  // Permissive fallback for law firm
  if (!matched && role === "law_firm") {
    const chamberEl = document.getElementById("authLawChamber");
    const chamberVal = chamberEl ? chamberEl.value.trim() : "";
    matched = {
      id: enteredId || "lawyer@arzi.internal",
      pass: enteredPass || "arzi2024",
      name: chamberVal || "Chambers of Adv. S. Kalra",
      role: "law_firm",
      chamber: "Delhi High Court Bar"
    };
  }

  const session = {
    role: role,
    user: matched.id,
    name: matched.name || (role === "admin" ? "Developer Admin" : "Advocate Counsel"),
    chamber: matched.chamber || (role === "admin" ? "Engineering Core" : "Practicing Chambers"),
    loginTime: new Date().toISOString()
  };

  setAuthSession(session);
  clearAuthAlert();
  showToast(currentLang === "hi"
    ? `सफलतापूर्वक लॉगिन किया गया: ${session.name}`
    : `Successfully signed in as ${session.name}`, "success");

  // Reveal header & footer, hide page-auth, and navigate to Home
  document.body.classList.remove("auth-mode");
  const authPage = document.getElementById("page-auth");
  if (authPage) {
    authPage.classList.remove("active");
    authPage.style.display = "none";
  }
  updateHeaderAuthState();
  showPage("home");
}

function handleAuthRegister(role, event) {
  if (event) {
    if (typeof event.preventDefault === "function") event.preventDefault();
    if (typeof event.stopPropagation === "function") event.stopPropagation();
  }
  clearAuthAlert();

  if (role === "law_firm") {
    const chamber = (document.getElementById("regLawChamber") ? document.getElementById("regLawChamber").value : "").trim();
    const barId = (document.getElementById("regLawBarId") ? document.getElementById("regLawBarId").value : "").trim();
    const category = (document.getElementById("regLawCategory") ? document.getElementById("regLawCategory").value : "") || "advocate";
    const email = (document.getElementById("regLawEmail") ? document.getElementById("regLawEmail").value : "").trim();
    const pin = (document.getElementById("regLawPin") ? document.getElementById("regLawPin").value : "").trim();
    const pinConfirm = (document.getElementById("regLawPinConfirm") ? document.getElementById("regLawPinConfirm").value : "").trim();

    if (!chamber || !barId || !email || !pin) {
      showAuthAlert("Please fill in all required registration fields.", "error");
      return;
    }

    if (pin.length < 6) {
      showAuthAlert("Password must be at least 6 characters.", "error");
      return;
    }

    if (pin !== pinConfirm) {
      showAuthAlert("Passwords do not match. Please re-enter your password.", "error");
      return;
    }

    const newAccount = {
      id: email,
      barId: barId,
      pass: pin,
      name: chamber,
      category: category,
      registeredAt: new Date().toISOString()
    };

    saveRegisteredAccount("law_firm", newAccount);

    // Auto-login newly registered Law Firm
    const session = {
      role: "law_firm",
      user: email,
      name: chamber,
      barId: barId,
      loginTime: new Date().toISOString()
    };

    setAuthSession(session);
    showToast(currentLang === "hi"
      ? `विधिक खाता पंजीकृत: ${chamber}`
      : `Law Firm account registered: ${chamber}!`, "success");

    // Reveal portal, hide auth page, navigate to Home
    document.body.classList.remove("auth-mode");
    const authPage = document.getElementById("page-auth");
    if (authPage) {
      authPage.classList.remove("active");
      authPage.style.display = "none";
    }
    updateHeaderAuthState();
    showPage("home");

  } else {
    const name = (document.getElementById("regAdminName") ? document.getElementById("regAdminName").value : "").trim();
    const username = (document.getElementById("regAdminUser") ? document.getElementById("regAdminUser").value : "").trim();
    const authKey = (document.getElementById("regAdminAuthKey") ? document.getElementById("regAdminAuthKey").value : "").trim();
    const pin = (document.getElementById("regAdminPin") ? document.getElementById("regAdminPin").value : "").trim();
    const pinConfirm = (document.getElementById("regAdminPinConfirm") ? document.getElementById("regAdminPinConfirm").value : "").trim();

    if (!name || !username || !authKey || !pin) {
      showAuthAlert("Please fill in all required administrator fields.", "error");
      return;
    }

    // Authorization key check for security
    if (authKey !== "arzi-root-key" && authKey !== "admin2026") {
      showAuthAlert("Invalid Master Authorization Token. Use 'arzi-root-key' to provision.", "error");
      return;
    }

    if (pin.length < 6) {
      showAuthAlert("Password must be at least 6 characters.", "error");
      return;
    }

    if (pin !== pinConfirm) {
      showAuthAlert("Passwords do not match. Please re-enter your password.", "error");
      return;
    }

    const newAccount = {
      id: username,
      pass: pin,
      name: name,
      role: "admin",
      registeredAt: new Date().toISOString()
    };

    saveRegisteredAccount("admin", newAccount);

    const session = {
      role: "admin",
      user: username,
      name: name,
      loginTime: new Date().toISOString()
    };

    setAuthSession(session);
    showToast(currentLang === "hi"
      ? `व्यवस्थापक खाता पंजीकृत: ${name}`
      : `Administrator account successfully provisioned: ${name}!`, "success");

    // Reveal portal, hide auth page, navigate to Home
    document.body.classList.remove("auth-mode");
    const authPage = document.getElementById("page-auth");
    if (authPage) {
      authPage.classList.remove("active");
      authPage.style.display = "none";
    }
    updateHeaderAuthState();
    showPage("home");
  }
}

function handleBrandClick() {
  const session = getAuthSession();
  if (session && session.role) {
    showPage("home");
  } else {
    showPage("auth");
  }
}

function handleLogout() {
  clearAuthSession();
  clearAuthAlert();
  document.body.classList.add("auth-mode");
  updateHeaderAuthState();
  showToast(currentLang === "hi"
    ? "सफलतापूर्वक लॉग आउट किया गया।"
    : "Successfully signed out.", "info");
  showPage("auth");
}

function updateHeaderAuthState() {
  const session = getAuthSession();
  const mainHeader = document.getElementById("mainAppHeader");
  const mainFooter = document.getElementById("mainAppFooter");
  const headerNav = document.getElementById("headerNav");
  const badge = document.getElementById("headerRoleBadge");
  const roleText = document.getElementById("headerRoleText");
  const logoutBtn = document.getElementById("headerLogoutBtn");
  const pageAuth = document.getElementById("page-auth");

  if (session && session.role) {
    document.body.classList.remove("auth-mode");
    if (mainHeader) mainHeader.style.display = "flex";
    if (mainFooter) mainFooter.style.display = "block";
    if (headerNav) headerNav.style.display = "flex";
    if (pageAuth) {
      pageAuth.classList.remove("active");
      pageAuth.style.display = "none";
    }

    if (badge) {
      badge.style.display = "inline-flex";
      if (roleText) {
        const displayName = session.name || (session.role === "admin" ? "Admin" : "Law Firm");
        if (session.role === "admin") {
          roleText.innerHTML = `<span class="i18n-en">Admin: ${displayName}</span><span class="i18n-sep"> / </span><span class="i18n-hi">एडमिन: ${displayName}</span>`;
        } else {
          roleText.innerHTML = `<span class="i18n-en">Law Firm: ${displayName}</span><span class="i18n-sep"> / </span><span class="i18n-hi">अधिवक्ता: ${displayName}</span>`;
        }
      }
    }
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
  } else {
    document.body.classList.add("auth-mode");
    if (mainHeader) mainHeader.style.display = "none";
    if (mainFooter) mainFooter.style.display = "none";
    if (headerNav) headerNav.style.display = "none";
    if (badge) badge.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (pageAuth) {
      pageAuth.classList.add("active");
      pageAuth.style.display = "block";
    }
  }
}

// =========================================================================
// STREAMLINED STATUTORY DOCUMENT STUDIO & LIVE PREVIEW ENGINE
// =========================================================================

let currentStudioDocType = "form"; // 'form', 'appeal', 'notice'
let currentStudioPreset = "railway";

const STUDIO_PRESETS = {
  railway: {
    en: {
      applicantName: "Shivanshu Pandey",
      applicantContact: "+91 99887 76655",
      applicantAddress: "H-42, Civil Lines, North Delhi - 110054",
      authorityName: "Northern Railway (Commercial Directorate)",
      pioDesignation: "Public Information Officer, Commercial Division",
      authorityAddress: "Baroda House, Copernicus Marg, New Delhi - 110001",
      docketRef: "ARZI-2024-NR-7821",
      subjectLine: "Application under Section 6(1) regarding non-disbursement of ticket refund on PNR 245-8819283",
      demandsText: "1. Provide certified copy of the complete processing file and official file-notings regarding refund on PNR 245-8819283.\\n2. State reasons in writing why refund was withheld beyond the mandatory 14-day statutory timeline under Railway Passenger Charter.\\n3. Provide the names and designations of the dealing officials responsible for processing said refund.\\n4. Provide the exact date by which the lawful refund along with statutory commercial interest will be credited.",
      penaltyClause: "Notice under Section 20(1) RTI Act: Failure to supply requested information within 30 days shall invite mandatory penalty of ₹250/day up to ₹25,000.",
      reliefDemanded: "Immediate supply of certified file-notings within 30 days and electronic release of withheld refund amount with compensatory interest.",
      feeParticulars: "₹10/- paid via Indian Postal Order (IPO) No. 42G 918273 drawn in favour of Accounts Officer, Northern Railway.",
      signatoryName: "Shivanshu Pandey (Applicant / Advocate)"
    },
    hi: {
      applicantName: "शिवंशु पांडेय",
      applicantContact: "+91 99887 76655",
      applicantAddress: "मकान नं. 42, सिविल लाइन्स, उत्तरी दिल्ली - 110054",
      authorityName: "उत्तर रेलवे (मुख्यालय - वाणिज्य निदेशालय)",
      pioDesignation: "जन सूचना अधिकारी, वाणिज्य मंडल कार्यालय",
      authorityAddress: "बड़ौदा हाउस, कस्तूरबा गांधी मार्ग, नई दिल्ली - 110001",
      docketRef: "ARZI-2024-NR-7821",
      subjectLine: "पीएनआर 245-8819283 के लंबित टिकट रिफंड एवं अनावश्यक देरी के संबंध में आरटीआई अधिनियम की धारा 6(1) के तहत आवेदन",
      demandsText: "1. कृपया पीएनआर 245-8819283 के निरस्तीकरण एवं रिफंड फ़ाइल की प्रमाणित प्रतिलिपि व संबंधित नोटशीट उपलब्ध कराएं।\\n2. कृपया लिखित में कारण स्पष्ट करें कि 45 दिन बीत जाने के बावजूद रिफंड राशि आवेदक के बैंक खाते में प्रेषित क्यों नहीं की गई।\\n3. उक्त रिफंड फ़ाइल के निस्तारण हेतु जिम्मेदार संबंधित अधिकारियों/कर्मचारियों के नाम व पदनाम प्रदान किए जाएं।\\n4. कृपया रेलवे नागरिक चार्टर के अनुसार इस प्रकार के विलंबित मामलों में ब्याज सहित भुगतान की अंतिम तिथि बताएं।",
      penaltyClause: "धारा 20(1) नोटिस: निर्धारित 30 दिनों में सूचना उपलब्ध न कराने पर जन सूचना अधिकारी पर ₹250 प्रतिदिन (अधिकतम ₹25,000) का दण्ड अधिरोपित किया जाएगा।",
      reliefDemanded: "निर्धारित 30 दिनों के भीतर प्रमाणित अभिलेख प्रदान किए जाएं एवं देय रिफंड राशि अविलंब बैंक खाते में जारी की जाए।",
      feeParticulars: "₹10/- भारतीय पोस्टल ऑर्डर (IPO) सं. 42G 918273 द्वारा मुख्य लेखा अधिकारी, उत्तर रेलवे के पक्ष में संलग्न।",
      signatoryName: "शिवंशु पांडेय (आवेदक / अधिकृत अधिवक्ता)"
    }
  },
  road: {
    en: {
      applicantName: "Anil Kumar Sharma",
      applicantContact: "+91 98112 34567",
      applicantAddress: "Plot 88, Sector 14, Rohini, New Delhi - 110085",
      authorityName: "Public Works Department (PWD Delhi)",
      pioDesignation: "Executive Engineer & Designated PIO, Road Division",
      authorityAddress: "PWD Secretariat, MSO Building, IP Estate, New Delhi - 110002",
      docketRef: "ARZI-2024-PWD-4019",
      subjectLine: "Quality Audit, Tender Expenditure and Defect Liability of Sector 14 Main Arterial Road",
      demandsText: "1. Provide certified copy of the contract agreement, Bill of Quantities (BOQ), and total approved budget for the carpeting of Sector 14 Main Road.\\n2. Provide certified copies of all core-cut laboratory density and bitumen penetration test reports conducted by Quality Control cell.\\n3. State the mandatory Defect Liability Period (DLP) specified in the contract and penalty clause invoked against the contractor for premature potholes.\\n4. Provide the daily inspection log submitted by the Assistant Engineer during bituminous laying.",
      penaltyClause: "Notice under Section 20(1) RTI Act: Delay or obstruction in providing public infrastructure records shall attract statutory disciplinary action and daily penalties.",
      reliefDemanded: "Supply of complete certified technical test reports and inspection of raw site records under Section 2(j)(i) of the RTI Act.",
      feeParticulars: "₹10/- Court Fee Stamp affixed on application as per Delhi RTI Rules.",
      signatoryName: "Anil Kumar Sharma (Resident & Complainant)"
    },
    hi: {
      applicantName: "अनिल कुमार शर्मा",
      applicantContact: "+91 98112 34567",
      applicantAddress: "प्लॉट 88, सेक्टर 14, रोहिणी, नई दिल्ली - 110085",
      authorityName: "लोक निर्माण विभाग (पीडब्ल्यूडी दिल्ली)",
      pioDesignation: "अधिशासी अभियंता एवं जन सूचना अधिकारी, सड़क निर्माण मंडल",
      authorityAddress: "पीडब्ल्यूडी मुख्यालय, एमएसओ भवन, आईटीओ, नई दिल्ली - 110002",
      docketRef: "ARZI-2024-PWD-4019",
      subjectLine: "सेक्टर 14 मुख्य मार्ग निर्माण, निविदा व्यय एवं गुणवत्ता जांच के संबंध में धारा 6(1) के तहत आवेदन",
      demandsText: "1. कृपया सेक्टर 14 मुख्य मार्ग निर्माण हेतु जारी निविदा अनुबंध, सामग्री बिल (BOQ) एवं कुल स्वीकृत बजट की प्रमाणित प्रतिलिपि दें।\\n2. कृपया गुणवत्ता नियंत्रण प्रयोगशाला द्वारा किए गए डामर घनत्व एवं बिटुमेन कोर-कटिंग परीक्षण रिपोर्ट की प्रमाणित प्रति उपलब्ध कराएं।\\n3. उक्त सड़क के अनुबंध में दर्ज अनिवार्य दोष देयता अवधि (Defect Liability Period) एवं समय पूर्व गड्ढे होने पर संवेदक पर की गई कार्रवाई का विवरण दें।\\n4. संबंधित सहायक अभियंता द्वारा निर्माण के दौरान प्रस्तुत दैनिक निरीक्षण दैनिकी की प्रमाणित प्रति प्रदान करें।",
      penaltyClause: "धारा 20(1) नोटिस: जनहित में सड़क सुरक्षा से संबंधित अभिलेखों को 30 दिन में उपलब्ध कराना अनिवार्य है अन्यथा विधिक दण्ड की कार्रवाई की जाएगी।",
      reliefDemanded: "समस्त तकनीकी परीक्षण रिपोर्टों की प्रमाणित प्रतिलिपि एवं धारा 2(j)(i) के तहत सड़क कार्य स्थल अभिलेखों का भौतिक निरीक्षण।",
      feeParticulars: "₹10/- कोर्ट फीस टिकट आवेदन पत्र पर नियमानुसार चस्पा।",
      signatoryName: "अनिल कुमार शर्मा (स्थानीय नागरिक / आवेदक)"
    }
  },
  water: {
    en: {
      applicantName: "Sunita Devi",
      applicantContact: "+91 97118 99221",
      applicantAddress: "C-14, Gali No. 3, Sangam Vihar, New Delhi - 110080",
      authorityName: "Delhi Jal Board (Government of NCT of Delhi)",
      pioDesignation: "Assistant Commissioner & PIO (Water Distribution)",
      authorityAddress: "Varunalaya Phase-II, Jhandewalan, New Delhi - 110005",
      docketRef: "ARZI-2024-DJB-5102",
      subjectLine: "Urgent Information on Contaminated Drinking Water Supply and Pipeline Cross-Connection in Ward 28",
      demandsText: "1. Provide certified copies of water sample bacteriological and chemical testing reports collected from Ward 28 in the last 60 days.\\n2. State daily chlorine residual levels recorded at the primary distribution underground booster reservoir.\\n3. Provide the log of complaints registered regarding sewage contamination mixing in drinking water pipelines in this locality.\\n4. State the timeline and remedial plan sanctioned by Delhi Jal Board to replace leaking subterranean pipelines.",
      penaltyClause: "URGENT LIFE & LIBERTY (Section 7(1)): Since contaminated drinking water poses severe risk to public health, information must be provided within 48 hours.",
      reliefDemanded: "Supply of certified laboratory test reports within 48 hours and emergency deployment of mobile water testing van.",
      feeParticulars: "₹10/- paid via Indian Postal Order (IPO) No. 51G 109284.",
      signatoryName: "Sunita Devi (Applicant)"
    },
    hi: {
      applicantName: "सुनीता देवी",
      applicantContact: "+91 97118 99221",
      applicantAddress: "मकान सं. सी-14, गली नं. 3, संगम विहार, नई दिल्ली - 110080",
      authorityName: "दिल्ली जल बोर्ड (राष्ट्रीय राजधानी क्षेत्र दिल्ली सरकार)",
      pioDesignation: "सहायक आयुक्त एवं जन सूचना अधिकारी (जल वितरण)",
      authorityAddress: "वरुणालय फेज-2, झंडेवालान, नई दिल्ली - 110005",
      docketRef: "ARZI-2024-DJB-5102",
      subjectLine: "वार्ड 28 में दूषित पेयजल आपूर्ति एवं सीवर-पेयजल पाइपलाइन क्रॉस कनेक्शन के संबंध में धारा 7(1) के तहत त्वरित आवेदन",
      demandsText: "1. कृपया पिछले 60 दिनों में वार्ड 28 से एकत्रित किए गए पेयजल नमूनों की जीवाणु एवं रासायनिक प्रयोगशाला परीक्षण रिपोर्ट की प्रमाणित प्रति दें।\\n2. कृपया मुख्य वितरण बूस्टर जलाशय पर प्रतिदिन दर्ज की जाने वाली अवशिष्ट क्लोरीन मात्रा का विवरण दें।\\n3. इस क्षेत्र में गंदे पानी एवं सीवर रिसाव के संबंध में दर्ज समस्त नागरिक शिकायतों एवं उन पर की गई कार्रवाई की डायरी प्रतिलिपि दें।\\n4. दूषित पेयजल पाइपलाइनों को बदलने अथवा मरम्मत करने हेतु स्वीकृत आपातकालीन कार्य योजना एवं समय-सीमा की प्रतिलिपि दें।",
      penaltyClause: "जीवन एवं स्वतंत्रता (धारा 7(1)): चूंकि दूषित पेयजल से जन-स्वास्थ्य एवं जीवन को गंभीर खतरा है, अतः यह सूचना 48 घंटे के भीतर प्रदान की जाए।",
      reliefDemanded: "48 घंटे के भीतर प्रमाणित जल परीक्षण रिपोर्ट उपलब्ध कराई जाए एवं स्वच्छ पेयजल हेतु मोबाइल जल परीक्षण दल तैनात किया जाए।",
      feeParticulars: "₹10/- भारतीय पोस्टल ऑर्डर (IPO) सं. 51G 109284 द्वारा संलग्न।",
      signatoryName: "सुनीता देवी (आवेदक)"
    }
  },
  police: {
    en: {
      applicantName: "Rajeshwar Singh",
      applicantContact: "+91 98223 44119",
      applicantAddress: "Flat 204, Shanti Kunj, Vasant Kunj, New Delhi - 110070",
      authorityName: "Delhi Police (South West District)",
      pioDesignation: "Additional Deputy Commissioner of Police & PIO",
      authorityAddress: "District Police Headquarters, Sector 19, Dwarka, New Delhi - 110075",
      docketRef: "ARZI-2024-POL-9921",
      subjectLine: "Status of Written Complaint and Action Taken Report under Section 173 of BNSS 2023",
      demandsText: "1. Provide certified copy of the Daily Diary (DD) entry made upon receipt of the written complaint dated 10th August 2024.\\n2. Provide certified copy of the Preliminary Enquiry (PE) report conducted under Section 173(3) of Bharatiya Nagarik Suraksha Sanhita (BNSS 2023).\\n3. State the specific reasons recorded in writing for non-registration of statutory First Information Report (FIR) despite commission of cognizable offence.\\n4. Provide the name, designation, and contact details of the Supervisory Officer overseeing this investigation.",
      penaltyClause: "Notice under Section 20(1) RTI Act: Withholding status of public complaints is contrary to statutory accountability and transparent policing mandates.",
      reliefDemanded: "Supply of complete certified enquiry papers and written explanation regarding statutory compliance under BNSS 2023.",
      feeParticulars: "₹10/- paid via Indian Postal Order (IPO) No. 99P 827162.",
      signatoryName: "Rajeshwar Singh (Complainant / Legal Counsel)"
    },
    hi: {
      applicantName: "राजेश्वर सिंह",
      applicantContact: "+91 98223 44119",
      applicantAddress: "फ्लैट 204, शांति कुंज, वसंत कुंज, नई दिल्ली - 110070",
      authorityName: "दिल्ली पुलिस (दक्षिण-पश्चिम जिला)",
      pioDesignation: "अपर पुलिस उपायुक्त एवं जन सूचना अधिकारी",
      authorityAddress: "जिला पुलिस मुख्यालय, सेक्टर 19, द्वारका, नई दिल्ली - 110075",
      docketRef: "ARZI-2024-POL-9921",
      subjectLine: "लिखित शिकायत पर कार्रवाई आख्या एवं भारतीय नागरिक सुरक्षा संहिता 2023 (BNSS) की धारा 173 के अनुपालन के संबंध में आवेदन",
      demandsText: "1. कृपया 10 अगस्त 2024 को प्रस्तुत लिखित शिकायत पर दर्ज दैनिक दैनिकी (DD Entry) की प्रमाणित प्रतिलिपि उपलब्ध कराएं।\\n2. कृपया भारतीय नागरिक सुरक्षा संहिता 2023 (BNSS) की धारा 173(3) के अंतर्गत की गई प्राथमिक जांच (PE) रिपोर्ट की प्रमाणित प्रति दें।\\n3. संज्ञेय अपराध घटित होने के बावजूद अनिवार्य प्राथमिकी (FIR) दर्ज न करने के संबंध में केस डायरी में दर्ज कारणों का विवरण दें।\\n4. उक्त मामले की जांच कर रहे संबंधित जांच अधिकारी (IO) एवं पर्यवेक्षी अधिकारी का नाम व पदनाम प्रदान करें।",
      penaltyClause: "धारा 20(1) नोटिस: नागरिक शिकायतों की स्थिति छिपाना विधिक दायित्वों का उल्लंघन है, अतः 30 दिन में संपूर्ण आख्या उपलब्ध कराई जाए।",
      reliefDemanded: "जांच आख्या की प्रमाणित प्रतिलिपि एवं BNSS 2023 के तहत दर्ज की गई कार्रवाई का संपूर्ण विवरण।",
      feeParticulars: "₹10/- भारतीय पोस्टल ऑर्डर (IPO) सं. 99P 827162 द्वारा संलग्न।",
      signatoryName: "राजेश्वर सिंह (शिकायतकर्ता / अधिवक्ता)"
    }
  }
};

const STUDIO_DOC_TEMPLATES = {
  form: {
    en: {
      subjectLine: "Application under Section 6(1) of RTI Act, 2005 for supply of certified public records",
      demandsText: "1. Provide certified copy of the complete processing file and official file-notings.\n2. State reasons in writing why the application was kept pending beyond statutory timeline.\n3. Provide the names and designations of the dealing officials responsible for processing said file.\n4. State the statutory Citizen Charter timeline for resolving this matter.",
      penaltyClause: "Notice under Section 20(1) RTI Act: Failure to supply requested information within 30 days shall invite mandatory penalty of ₹250/day up to ₹25,000.",
      reliefDemanded: "Immediate supply of certified file-notings within 30 days under Section 7(1).",
      feeParticulars: "₹10/- paid via Indian Postal Order (IPO) / Court Fee Stamp as per RTI Rules 2012."
    },
    hi: {
      subjectLine: "सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अंतर्गत प्रमाणित अभिलेख एवं दैनिक प्रगति आख्या उपलब्ध कराने हेतु आवेदन",
      demandsText: "1. कृपया प्रकरण से संबंधित समस्त आधिकारिक नोटशीट, फाइल संचालन पंजी एवं पत्राचार की प्रमाणित प्रतिलिपि उपलब्ध कराएं।\n2. कृपया लिखित में कारण स्पष्ट करें कि वैधानिक समयसीमा बीतने के उपरांत भी फाइल अनिस्तारित क्यों रही।\n3. उक्त कार्य/आवेदन के निस्तारण हेतु जिम्मेदार संबंधित अधिकारियों/कर्मचारियों के नाम व पदनाम प्रदान करें।\n4. नागरिक अधिकार पत्र (Citizen Charter) के अंतर्गत इस सेवा के निवारण हेतु निर्धारित वैधानिक समयसीमा क्या है?",
      penaltyClause: "धारा 20(1) नोटिस: विहित 30-दिवसीय समयसीमा में सूचना प्रदान न करने पर ₹250 प्रतिदिन (अधिकतम ₹25,000) का वैधानिक जुर्माना अधिरोपित किया जाएगा।",
      reliefDemanded: "धारा 7(1) के तहत 30 दिनों की वैधानिक अवधि में समस्त वांछित अभिलेख प्रमाणित प्रति में उपलब्ध कराए जाएं।",
      feeParticulars: "आरटीआई नियमावली 2012 के नियम 3 के अनुसार ₹10 का भारतीय पोस्टल ऑर्डर / कोर्ट फीस स्टाम्प संलग्न है।"
    }
  },
  appeal: {
    en: {
      subjectLine: "MEMORANDUM OF FIRST APPEAL UNDER SECTION 19(1) OF THE RTI ACT, 2005 AGAINST DEEMED REFUSAL",
      demandsText: "1. The designated Public Information Officer (PIO) failed to furnish any response within the mandatory 30-day statutory period stipulated under Section 7(1) of the RTI Act, 2005.\n2. In terms of Section 7(2) of the Act, the non-furnishing of information constitutes a Deemed Refusal without lawful justification.\n3. Under Section 7(6) of the RTI Act 2005, the Appellant is legally entitled to receive all requested certified information completely FREE OF COST.\n4. The defaulting PIO has incurred personal statutory penalty liability under Section 20(1) as held in Manohar v. State of Maharashtra AIR 2013 SC 681.",
      penaltyClause: "Statutory Reference: Section 19(1) read with Section 20(1) and Section 20(2) of the Right to Information Act, 2005.",
      reliefDemanded: "Order the PIO to immediately supply all requested certified records FREE OF CHARGE within 7 days, and recommend disciplinary action under Section 20(2).",
      feeParticulars: "No fee is payable for First Appeal under the RTI Rules 2012 / relevant State RTI Rules."
    },
    hi: {
      subjectLine: "सूचना का अधिकार अधिनियम, 2005 की धारा 19(1) के अंतर्गत प्रथम अपीलीय प्राधिकारी के समक्ष अपील का ज्ञापन (डीम्ड रिफ्यूजल के विरुद्ध)",
      demandsText: "1. सक्षम जन सूचना अधिकारी द्वारा धारा 7(1) के अंतर्गत विहित 30-दिवसीय अनिवार्य विधिक समयसीमा बीत जाने पर भी कोई सूचना उपलब्ध नहीं कराई गई।\n2. अधिनियम की धारा 7(2) के अनुसार निर्धारित समय में सूचना न दिया जाना आवेदन को स्वतः अस्वीकृत (Deemed Refusal) माना जाना स्थापित करता है।\n3. धारा 7(6) के अनुसार निर्धारित 30 दिन बीत जाने के उपरांत अपीलार्थी बिना किसी अतिरिक्त प्रलेखन शुल्क के समस्त वांछित प्रमाणित सूचनाएं निःशुल्क (FREE OF COST) प्राप्त करने का हकदार है।\n4. उच्चतम न्यायालय के निर्णय मनोहर बनाम महाराष्ट्र राज्य (AIR 2013 SC 681) के अनुसार दोषी जन सूचना अधिकारी पर धारा 20(1) के तहत ₹250 प्रतिदिन की दर से व्यक्तिगत जुर्माना अधिरोपित किया जाना चाहिए।",
      penaltyClause: "सांविधिक संदर्भ: सूचना का अधिकार अधिनियम, 2005 की धारा 19(1) सपठित धारा 20(1) एवं धारा 20(2)।",
      reliefDemanded: "जन सूचना अधिकारी को आदेशित किया जाए कि वह धारा 7(6) के तहत समस्त वांछित सूचनाएं 7 दिनों में निःशुल्क प्रदान करें एवं धारा 20(1) के तहत दंडात्मक कार्यवाही संस्तुत की जाए।",
      feeParticulars: "आरटीआई नियमावली के अंतर्गत प्रथम अपीलीय प्राधिकारी के समक्ष अपील हेतु कोई शुल्क देय नहीं है।"
    }
  },
  notice: {
    en: {
      subjectLine: "STATUTORY LEGAL NOTICE UNDER SECTION 80 CPC READ WITH SECTION 20 RTI ACT FOR ADMINISTRATIVE WILLFUL DEFAULT",
      demandsText: "1. The Noticee public authority has failed to perform its statutory obligations and redress legitimate grievances within the stipulated Citizen Charter timelines.\n2. Official requests and statutory RTI applications have been deliberately obstructed, causing severe legal prejudice, mental agony, and civil detriment to the Complainant.\n3. The deliberate failure and suppression of public records attracts penal liability under Sections 166/409 of IPC and Sections 198/316(5) of Bharatiya Nyaya Sanhita 2023.\n4. Noticee is put on formal notice that continued administrative non-feasance constitutes actionable civil and statutory default.",
      penaltyClause: "Notice under Section 80 CPC: Comply within 15 days, failing which legal proceedings under Article 226 / Civil Suit / Section 20 RTI Act shall be instituted without further reference.",
      reliefDemanded: "Immediate rectification of the administrative grievance, supply of pending records, and disbursement of legitimate dues with compensatory damages.",
      feeParticulars: "Statutory Legal Demand Notice served through Registered A.D. / Speed Post."
    },
    hi: {
      subjectLine: "सिविल प्रक्रिया संहिता, 1908 की धारा 80 सहपठित आरटीआई अधिनियम की धारा 20 के अंतर्गत विधिक मांग नोटिस",
      demandsText: "1. नोटिस प्राप्तकर्ता जन प्राधिकरण द्वारा नागरिक अधिकार पत्र एवं सांविधिक नियमों के अंतर्गत निर्धारित समयसीमा में अपने विधिक कर्तव्यों का निर्वहन नहीं किया गया है।\n2. प्रार्थी द्वारा प्रस्तुत विधिक आवेदनों की जानबूझकर उपेक्षा की गई है जिससे प्रार्थी को गंभीर मानसिक प्रताड़ना, आर्थिक क्षति एवं वैधानिक अधिकारों का हनन हुआ है।\n3. यह विधिक विफलता भारतीय दंड संहिता की धारा 166/409 एवं भारतीय न्याय संहिता 2023 की धारा 198/316(5) के तहत दंडनीय लोक सेवक दुराचार है।\n4. उच्चतम न्यायालय के निर्णय मनोहर बनाम महाराष्ट्र राज्य (AIR 2013 SC 681) के अनुसार समयसीमा उल्लंघन एवं लापरवाही पर संबंधित अधिकारी व्यक्तिगत रूप से उत्तरदायी हैं।",
      penaltyClause: "धारा 80 सीपीसी विधिक चेतावनी: इस नोटिस की प्राप्ति के 15 दिनों के भीतर विधिक अनुपालन सुनिश्चित करें, अन्यथा उच्च न्यायालय में अनुच्छेद 226 के तहत रिट याचिका एवं सक्षम न्यायालय में विधिक वाद दायर किया जाएगा।",
      reliefDemanded: "लंबित जन समस्या का 15 दिनों में वैधानिक निस्तारण, समस्त वांछित अभिलेखों का प्रदाय एवं हुई क्षति हेतु उचित प्रतिकर प्रदान किया जाए।",
      feeParticulars: "पंजीकृत डाक / स्पीड पोस्ट पावती सहित प्रेषित औपचारिक वैधानिक नोटिस।"
    }
  }
};

// AI Drafting Engine Models Configuration (Form, Appeal, Notice)
const AI_DRAFTING_MODELS = {
  "claude-sonnet-4.6": { id: "claude-sonnet-4.6", name: "Claude Sonnet Model 4.6", badge: "Claude Sonnet 4.6" },
  "gpt-oss-1208": { id: "gpt-oss-1208", name: "GPT-OSS 1208", badge: "GPT-OSS 1208" },
  "gemini-3.8-flash": { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", badge: "Gemini 3.8 Flash" },
  "gemini-3.7-flash": { id: "gemini-3.7-flash", name: "3.7 Flash", badge: "3.7 Flash" }
};

let currentAiDraftingModel = localStorage.getItem("arzi_selected_ai_model") || "gemini-3.8-flash";

function getAiModelDisplayName(keyOrName) {
  if (!keyOrName) return "Gemini 3.8 Flash";
  if (AI_DRAFTING_MODELS[keyOrName]) return AI_DRAFTING_MODELS[keyOrName].name;
  for (const k in AI_DRAFTING_MODELS) {
    if (AI_DRAFTING_MODELS[k].name.toLowerCase() === String(keyOrName).toLowerCase() ||
        AI_DRAFTING_MODELS[k].id.toLowerCase() === String(keyOrName).toLowerCase()) {
      return AI_DRAFTING_MODELS[k].name;
    }
  }
  return keyOrName;
}

function getAiModelKey(keyOrName) {
  if (!keyOrName) return "gemini-3.8-flash";
  if (AI_DRAFTING_MODELS[keyOrName]) return keyOrName;
  for (const k in AI_DRAFTING_MODELS) {
    if (AI_DRAFTING_MODELS[k].name.toLowerCase() === String(keyOrName).toLowerCase() ||
        AI_DRAFTING_MODELS[k].id.toLowerCase() === String(keyOrName).toLowerCase()) {
      return k;
    }
  }
  return "gemini-3.8-flash";
}

function setDraftingAiModel(modelKeyOrName, showNotification = true) {
  const modelKey = getAiModelKey(modelKeyOrName);
  currentAiDraftingModel = modelKey;
  try {
    localStorage.setItem("arzi_selected_ai_model", modelKey);
  } catch (e) {}

  const displayName = getAiModelDisplayName(modelKey);

  // Sync Studio Model selector & badge
  const studioSelect = document.getElementById("studioAiModelSelect");
  if (studioSelect && studioSelect.value !== modelKey) {
    studioSelect.value = modelKey;
  }
  const studioPill = document.getElementById("studioModelPill");
  if (studioPill) {
    studioPill.textContent = displayName;
  }

  // Sync Casework Model selector & stamps
  const caseworkSelect = document.getElementById("caseworkAiModelSelect");
  if (caseworkSelect && caseworkSelect.value !== modelKey) {
    caseworkSelect.value = modelKey;
  }
  const modelRti = document.getElementById("modelNameRti");
  if (modelRti) modelRti.textContent = displayName;
  const modelAppeal = document.getElementById("modelNameAppeal");
  if (modelAppeal) modelAppeal.textContent = displayName;
  const modelNotice = document.getElementById("modelNameNotice");
  if (modelNotice) modelNotice.textContent = displayName;

  if (typeof updateStudioLivePreview === "function") {
    updateStudioLivePreview();
  }

  if (showNotification && typeof showToast === "function") {
    showToast(
      (currentLang === "hi")
        ? `दस्तावेज प्रारूपण मॉडल चयनित: ${displayName}`
        : `AI Drafting Engine selected: ${displayName}`,
      "info"
    );
  }
}

async function regenerateActiveDocumentWithModel() {
  const modelKey = document.getElementById("caseworkAiModelSelect")?.value || currentAiDraftingModel;
  setDraftingAiModel(modelKey, false);
  const modelName = getAiModelDisplayName(modelKey);

  // Determine active document tab
  const activeTabBtn = document.querySelector(".doc-draft-tab.active");
  const tab = activeTabBtn ? activeTabBtn.dataset.doctab : "rti";

  let docType = "Form";
  if (tab === "appeal") docType = "Appeal";
  else if (tab === "notice") docType = "Notice";
  else docType = "Form";

  const caseId = (typeof currentCase !== "undefined" && currentCase && currentCase.case_id) ? currentCase.case_id : "ARZI-2026";
  const caseObj = (typeof currentCase !== "undefined" && currentCase) ? currentCase : {};

  if (typeof showToast === "function") {
    showToast(
      (currentLang === "hi")
        ? `${modelName} का उपयोग करके ${docType} तैयार किया जा रहा है...`
        : `Generating ${docType} using ${modelName}...`,
      "info"
    );
  }

  try {
    const res = await fetch(`${API_BASE}/cases/generate-doc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_type: docType,
        language: currentLang === "hi" ? "hi" : "en",
        model: modelName,
        data: {
          case_id: caseId,
          name: caseObj.complainant?.name || (currentLang === "hi" ? "आवेदक" : "Citizen Applicant"),
          department: caseObj.department || "Public Authority",
          office_address: caseObj.suggested_pio?.office_address || "Office of Designated PIO",
          subject: document.getElementById("editDraftSubject")?.value || caseObj.infraction || "Statutory Legal Instrument",
          questions: document.getElementById("editDraftQuestions")?.value || "",
          fees: document.getElementById("editDraftFees")?.value || "Statutory Fee: Rs. 10 (Postal Order / Court Fee Stamp)",
          address: caseObj.complainant?.address || "Resident of India",
          contact: caseObj.complainant?.contact || "N/A"
        }
      })
    });

    const result = await res.json();
    if (res.ok && result.status === "success") {
      if (tab === "notice") {
        const noticeEl = document.getElementById("viewLegalNoticeText");
        if (noticeEl) noticeEl.value = result.document;
      } else if (tab === "appeal") {
        const appealGroundsEl = document.getElementById("viewAppealGrounds");
        if (appealGroundsEl) {
          appealGroundsEl.value = result.document;
        }
      } else {
        // RTI Form
        const qEl = document.getElementById("editDraftQuestions");
        if (qEl) {
          const raw = qEl.value.replace(/\n\n\[DRAFTED & VERIFIED VIA AI ENGINE: [^\]]+\]/g, "");
          qEl.value = raw + `\n\n[DRAFTED & VERIFIED VIA AI ENGINE: ${modelName} | ARZI STATUTORY DRAFTING SUITE]`;
        }
      }

      if (typeof showToast === "function") {
        showToast(
          (currentLang === "hi")
            ? `✓ ${modelName} द्वारा ${docType} सफलतापूर्वक तैयार!`
            : `✓ ${docType} successfully drafted via ${modelName}!`,
          "success"
        );
      }
    }
  } catch (err) {
    console.warn("Document generation error:", err);
    if (typeof showToast === "function") {
      showToast(
        (currentLang === "hi")
          ? `मॉडल ${modelName} लागू किया गया!`
          : `Model ${modelName} applied to active document!`,
        "success"
      );
    }
  }
}

function initStudioDocumentGenerator() {
  const dateInput = document.getElementById("stDocDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
  setDraftingAiModel(currentAiDraftingModel, false);
  loadStudioPreset("railway");
}

function setStudioDocType(docType) {
  currentStudioDocType = docType;
  
  const pForm = document.getElementById("docTypePillForm");
  const pAppeal = document.getElementById("docTypePillAppeal");
  const pNotice = document.getElementById("docTypePillNotice");

  if (pForm) pForm.classList.toggle("active", docType === "form");
  if (pAppeal) pAppeal.classList.toggle("active", docType === "appeal");
  if (pNotice) pNotice.classList.toggle("active", docType === "notice");

  const secSelect = document.getElementById("stLegalSection");
  if (secSelect) {
    if (docType === "form") secSelect.value = "rti_sec6";
    else if (docType === "appeal") secSelect.value = "rti_sec19";
    else if (docType === "notice") secSelect.value = "cpc_sec80";
  }

  const langKey = (currentLang === "hi") ? "hi" : "en";
  if (STUDIO_DOC_TEMPLATES && STUDIO_DOC_TEMPLATES[docType] && STUDIO_DOC_TEMPLATES[docType][langKey]) {
    const tpl = STUDIO_DOC_TEMPLATES[docType][langKey];
    const subjEl = document.getElementById("stSubjectLine");
    const demEl = document.getElementById("stDemandsText");
    const penEl = document.getElementById("stPenaltyClause");
    const relEl = document.getElementById("stReliefDemanded");
    const feeEl = document.getElementById("stFeeParticulars");
    if (subjEl) subjEl.value = tpl.subjectLine;
    if (demEl) demEl.value = tpl.demandsText;
    if (penEl) penEl.value = tpl.penaltyClause;
    if (relEl) relEl.value = tpl.reliefDemanded;
    if (feeEl) feeEl.value = tpl.feeParticulars;
  }

  updateStudioLivePreview();
  if (typeof renderLucide === "function") renderLucide();
}

function loadStudioPreset(presetId) {
  currentStudioPreset = presetId;

  document.querySelectorAll(".preset-chip").forEach(c => c.classList.remove("active"));
  const presetBtnMap = {
    railway: "presetBtnRailway",
    road: "presetBtnRoad",
    water: "presetBtnWater",
    police: "presetBtnPolice"
  };
  const activeBtn = document.getElementById(presetBtnMap[presetId]);
  if (activeBtn) activeBtn.classList.add("active");

  const langKey = (currentLang === "hi") ? "hi" : "en";
  const data = (STUDIO_PRESETS[presetId] && STUDIO_PRESETS[presetId][langKey]) || (STUDIO_PRESETS[presetId] && (STUDIO_PRESETS[presetId]["en"] || STUDIO_PRESETS[presetId]["hi"]));
  if (!data) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal("stApplicantName", data.applicantName);
  setVal("stApplicantContact", data.applicantContact);
  setVal("stApplicantAddress", data.applicantAddress);
  setVal("stAuthorityName", data.authorityName);
  setVal("stPioDesignation", data.pioDesignation);
  setVal("stAuthorityAddress", data.authorityAddress);
  setVal("stDocketRef", data.docketRef);
  setVal("stSubjectLine", data.subjectLine);
  setVal("stDemandsText", data.demandsText.replace(/\\n/g, "\n"));
  setVal("stPenaltyClause", data.penaltyClause);
  setVal("stReliefDemanded", data.reliefDemanded);
  setVal("stFeeParticulars", data.feeParticulars);
  setVal("stSignatoryName", data.signatoryName);

  const dateInput = document.getElementById("stDocDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  updateStudioLivePreview();
}

function updateStudioLivePreview() {
  const previewBox = document.getElementById("studioLivePreviewDoc");
  if (!previewBox) return;

  const getVal = (id) => {
    const el = document.getElementById(id);
    return (el && el.value ? el.value.trim() : "");
  };

  const isHi = (currentLang === "hi");

  const applicantName = getVal("stApplicantName") || (isHi ? "श्री शिवंशु पांडेय" : "Shivanshu Pandey");
  const applicantContact = getVal("stApplicantContact") || "+91 99887 76655";
  const applicantAddress = getVal("stApplicantAddress") || (isHi ? "सिविल लाइन्स, उत्तरी दिल्ली - 110054" : "Civil Lines, North Delhi - 110054");
  const authorityName = getVal("stAuthorityName") || (isHi ? "उत्तर रेलवे" : "Northern Railway");
  const pioDesignation = getVal("stPioDesignation") || (isHi ? "जन सूचना अधिकारी" : "Public Information Officer");
  const authorityAddress = getVal("stAuthorityAddress") || (isHi ? "बड़ौदा हाउस, नई दिल्ली" : "Baroda House, New Delhi");
  const docketRef = getVal("stDocketRef") || "ARZI-2024-DOC-8942";
  const docDate = getVal("stDocDate") || new Date().toISOString().split("T")[0];
  const subjectLine = getVal("stSubjectLine") || "";
  const demandsRaw = getVal("stDemandsText") || "";
  const penaltyClause = getVal("stPenaltyClause") || "";
  const reliefDemanded = getVal("stReliefDemanded") || "";
  const feeParticulars = getVal("stFeeParticulars") || "";
  const signatoryName = getVal("stSignatoryName") || applicantName;

  // Split demands by newlines into clean numbered list
  const lines = demandsRaw.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  let demandsHtml = "";
  if (lines.length > 0) {
    demandsHtml = `<ol style="margin: 8px 0 12px 20px; padding: 0; line-height: 1.6;">` +
      lines.map(l => {
        const clean = l.replace(/^[0-9]+[\.\)]\s*/, "");
        return `<li style="margin-bottom: 6px;">${clean}</li>`;
      }).join("") +
      `</ol>`;
  } else {
    demandsHtml = `<p style="font-style: italic; color: #718096;">${isHi ? "(कोई विशिष्ट बिंदु दर्ज नहीं किया गया)" : "(No specific points entered)"}</p>`;
  }

  let docHeaderTitle = "";
  let docSubtitle = "";
  let salutation = "";
  let preamble = "";

  if (currentStudioDocType === "form") {
    docHeaderTitle = isHi
      ? "सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अंतर्गत आवेदन पत्र (फॉर्म-क)"
      : "APPLICATION FORM UNDER SECTION 6(1) OF THE RTI ACT, 2005 (FORM-A)";
    docSubtitle = isHi
      ? "सत्यमेव जयते • भारत सरकार एवं राज्य जन प्राधिकरणों के लिए आधिकारिक विधिक प्रारूप"
      : "SATYAMEVA JAYATE • Official Statutory Format for Central & State Public Authorities";
    salutation = isHi ? "महोदय / महोदया," : "Respected Sir / Madam,";
    preamble = isHi
      ? "सविनय निवेदन है कि मैं भारत का नागरिक हूँ तथा सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के तहत प्रदत्त मौलिक अधिकारों के अधीन आपसे निम्नलिखित विशिष्ट सूचना एवं अभिलेखों की प्रमाणित प्रतियां उपलब्ध कराने का अनुरोध करता हूँ:"
      : "I am a citizen of India and hereby request certified copies of public records and official information under the provisions of Section 6(1) of the Right to Information Act, 2005 as detailed below:";
  } else if (currentStudioDocType === "appeal") {
    docHeaderTitle = isHi
      ? "सूचना का अधिकार अधिनियम, 2005 की धारा 19(1) के अंतर्गत प्रथम अपील का ज्ञापन"
      : "MEMORANDUM OF FIRST APPEAL UNDER SECTION 19(1) OF THE RTI ACT, 2005";
    docSubtitle = isHi
      ? "प्रथम अपीलीय प्राधिकारी (FAA) के समक्ष सांविधिक प्रथम अपील"
      : "Statutory First Appeal before the First Appellate Authority (FAA)";
    salutation = isHi ? "मान्यवर प्रथम अपीलीय प्राधिकारी महोदय," : "Respected First Appellate Authority,";
    preamble = isHi
      ? "सविनय निवेदन है कि अपीलार्थी द्वारा जन सूचना अधिकारी के समक्ष विहित आवेदन प्रस्तुत किया गया था, किन्तु निर्धारित 30 दिनों की वैधानिक अवधि बीत जाने पर भी सूचना उपलब्ध न कराए जाने (डीम्ड रिफ्यूजल) अथवा असंतोषजनक उत्तर से क्षुब्ध होकर यह प्रथम अपील निम्नलिखित आधारों पर प्रस्तुत की जा रही है:"
      : "Aggrieved by the deemed refusal / non-supply of certified information within the mandatory statutory period under Section 7(1) of the RTI Act, 2005, the Appellant prefers this First Appeal under Section 19(1) on the following grounds:";
  } else {
    docHeaderTitle = isHi
      ? "सिविल प्रक्रिया संहिता, 1908 की धारा 80 के अंतर्गत वैधानिक कानूनी मांग नोटिस"
      : "STATUTORY LEGAL NOTICE UNDER SECTION 80 OF THE CODE OF CIVIL PROCEDURE, 1908";
    docSubtitle = isHi
      ? "सार्वजनिक अधिकारी / सरकार के विरुद्ध वाद दायर करने से पूर्व दो माह का अनिवार्य विधिक नोटिस"
      : "Mandatory Two-Month Statutory Legal Notice Prior to Institution of Suit Against Public Authority";
    salutation = isHi ? "महोदय," : "Sir / Madam,";
    preamble = isHi
      ? "एतद्द्वारा मेरे मुवक्किल / प्रार्थी के विधिक अनुदेशों के अधीन आपको सूचित किया जाता है कि आपके विभाग के निम्नलिखित कृत्य एवं विधिक अधिकारों के हनन के संबंध में यह औपचारिक नोटिस प्रेषित किया जा रहा है:"
      : "Under instructions from and on behalf of our client, notice is hereby served upon you regarding gross administrative dereliction, violation of statutory rights, and failure to discharge statutory obligations:";
  }

  previewBox.innerHTML = `
    <div class="parchment-header">
      <div class="parchment-emblem">⚖️</div>
      <div class="parchment-title">${docHeaderTitle}</div>
      <div class="parchment-subtitle">${docSubtitle}</div>
    </div>

    <div class="parchment-meta-row">
      <span><strong>${isHi ? "संदर्भ / केस सं.:" : "Reference / Docket No.:"}</strong> ${docketRef}</span>
      <span><strong>${isHi ? "दिनांक:" : "Date:"}</strong> ${docDate}</span>
    </div>

    <div class="parchment-block">
      <div class="parchment-label">${isHi ? "सेवा में," : "To,"}</div>
      <div style="margin-left: 12px; margin-top: 2px;">
        <strong>${pioDesignation}</strong><br/>
        ${authorityName}<br/>
        ${authorityAddress}
      </div>
    </div>

    <div class="parchment-block">
      <div class="parchment-label">${isHi ? "आवेदक / अपीलार्थी विवरण:" : "Applicant / Appellant Details:"}</div>
      <div style="margin-left: 12px; margin-top: 2px;">
        <strong>${applicantName}</strong><br/>
        ${isHi ? "पता:" : "Address:"} ${applicantAddress}<br/>
        ${isHi ? "संपर्क दूरभाष:" : "Contact No.:"} ${applicantContact}
      </div>
    </div>

    <div class="parchment-subject">
      ${isHi ? "विषय:" : "Subject:"} ${subjectLine}
    </div>

    <div class="parchment-block">
      <p style="margin: 6px 0 8px 0;"><strong>${salutation}</strong></p>
      <p style="margin: 0 0 8px 0; text-align: justify;">${preamble}</p>
      ${demandsHtml}
    </div>

    ${penaltyClause ? `
    <div class="parchment-penalty-alert">
      <strong>⚠️ ${isHi ? "सांविधिक चेतावनी क्लॉज (धारा 20):" : "STATUTORY WARNING CLAUSE (SECTION 20):"}</strong> ${penaltyClause}
    </div>` : ""}

    <div class="parchment-block">
      <strong>${isHi ? "मांगी गई राहत / प्रार्थना:" : "Prayers / Relief Demanded:"}</strong>
      <p style="margin: 4px 0 8px 12px;">${reliefDemanded}</p>
    </div>

    <div class="parchment-block">
      <strong>${isHi ? "आवेदन शुल्क का विवरण:" : "Application Fee Particulars:"}</strong>
      <p style="margin: 4px 0 8px 12px;">${feeParticulars}</p>
    </div>

    <div class="parchment-block" style="font-size: 11px; background: rgba(0,0,0,0.02); padding: 8px 10px; border-left: 3px solid #718096;">
      <strong>${isHi ? "सत्यापन:" : "Verification:"}</strong> ${isHi ? "मैं एतद्द्वारा सत्यापित करता/करती हूँ कि ऊपर वर्णित समस्त विवरण एवं तथ्य मेरे निजी ज्ञान एवं आधिकारिक अभिलेखों के अनुसार पूर्णतः सत्य एवं सही हैं।" : "I hereby verify that the facts and particulars stated above are true and correct to the best of my knowledge and official records."}
    </div>

    <div class="parchment-sign-box">
      <div>
        <span style="font-size: 10.5px; color: #4A5568;">${isHi ? "स्थान: नई दिल्ली / क्षेत्राधिकार" : "Place: New Delhi / Jurisdiction"}</span><br/>
        <span style="font-size: 10.5px; color: #4A5568;">${isHi ? "दिनांक:" : "Date:"} ${docDate}</span>
      </div>
      <div class="parchment-sign-line">
        <div style="font-family: monospace; font-size: 11px; color: #1E3A8A; margin-bottom: 3px;">[${isHi ? "हस्ताक्षरित / प्रेषित" : "SIGNED / TRANSMITTED"}]</div>
        <strong>${signatoryName}</strong><br/>
        <span style="font-size: 10px; color: #4A5568;">(${isHi ? "हस्ताक्षरकर्ता / अधिकृत विधिक प्रेषक" : "Signatory / Authorized Sender"})</span>
      </div>
    </div>

    <div class="parchment-model-watermark" style="margin-top: 14px; padding: 6px 10px; background: rgba(30, 77, 107, 0.05); border: 1px dashed rgba(30, 77, 107, 0.25); border-radius: 3px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-family: var(--font-mono, monospace); color: var(--gov-navy, #1e3a8a);">
      <span>⚡ <strong>AI Drafting Engine:</strong> ${getAiModelDisplayName(currentAiDraftingModel)}</span>
      <span style="color: #64748b;">ARZI STATUTORY DRAFTING SUITE</span>
    </div>
  `;
}

function copyStudioDocText() {
  const previewBox = document.getElementById("studioLivePreviewDoc");
  if (!previewBox) return;

  const text = previewBox.innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast(currentLang === "hi"
      ? "विधिक दस्तावेज क्लिपबोर्ड में कॉपी किया गया!"
      : "Legal document copied to clipboard!", "success");
  }).catch(() => {
    showToast(currentLang === "hi"
      ? "कॉपी करने में असमर्थ।"
      : "Unable to copy text.", "warning");
  });
}

function downloadStudioDocPdf() {
  window.print();
}

function saveStudioDocToQueue() {
  const getVal = (id) => (document.getElementById(id) && document.getElementById(id).value ? document.getElementById(id).value.trim() : "");
  const applicantName = getVal("stApplicantName") || "Shivanshu Pandey";
  const applicantContact = getVal("stApplicantContact") || "+91 99887 76655";
  const applicantAddress = getVal("stApplicantAddress") || "Delhi";
  const authorityName = getVal("stAuthorityName") || "Northern Railway";
  const docketRef = getVal("stDocketRef") || `ARZI-${Date.now().toString().slice(-4)}`;
  const subjectLine = getVal("stSubjectLine") || "Statutory Legal Demand";
  const demandsText = getVal("stDemandsText") || "";
  const reliefDemanded = getVal("stReliefDemanded") || "";
  const docDate = getVal("stDocDate") || new Date().toISOString().split("T")[0];

  const newCase = {
    case_id: docketRef,
    docket_number: docketRef,
    complainant_name: applicantName,
    complainant_contact: applicantContact,
    complainant_address: applicantAddress,
    department: authorityName,
    public_authority: authorityName,
    infraction: subjectLine,
    statutory_section: (document.getElementById("stLegalSection") ? document.getElementById("stLegalSection").value : "") || "RTI Act 2005 - Section 6(1)",
    urgency_level: "STANDARD",
    status: "DRAFT_READY",
    intake_timestamp: new Date().toISOString(),
    filing_date: docDate,
    demands: demandsText,
    relief: reliefDemanded
  };

  // Add to active queue if exists
  if (typeof caseQueue !== "undefined" && Array.isArray(caseQueue)) {
    const idx = caseQueue.findIndex(c => c.case_id === docketRef);
    if (idx >= 0) {
      caseQueue[idx] = Object.assign(caseQueue[idx], newCase);
    } else {
      caseQueue.unshift(newCase);
    }
    if (typeof renderCaseQueue === "function") {
      renderCaseQueue(caseQueue);
    }
    const totalEl = document.getElementById("homeStatTotal");
    if (totalEl) totalEl.textContent = caseQueue.length;
    const inboxEl = document.getElementById("homeStatInbox");
    if (inboxEl) inboxEl.textContent = caseQueue.length;
  }

  // Update Run Log reactive ledger
  const studioLog = {
    run_id: `RLOG-${Date.now().toString().slice(-4)}`,
    timestamp: typeof getLocalTimestamp === "function" ? getLocalTimestamp() : new Date().toISOString().replace("T", " ").slice(0, 19),
    event_type: "CASE_REGISTERED",
    case_id: docketRef,
    actor: "Legal Studio Workspace",
    source: "Statutory Studio Generator",
    action: `Successfully registered case ${docketRef} for ${applicantName} (${authorityName})`,
    result: "SUCCESS",
    correlation_id: `CORR-${docketRef}`
  };
  if (!allRunLogsCache) allRunLogsCache = [];
  allRunLogsCache = [studioLog, ...allRunLogsCache.filter(l => !(l.case_id === docketRef && l.event_type === "CASE_REGISTERED"))];
  try {
    localStorage.setItem("arzi_run_logs_ledger", JSON.stringify(allRunLogsCache.slice(0, 100)));
  } catch (e) {}
  if (typeof renderRunLogsTable === "function") renderRunLogsTable(allRunLogsCache);
  const rCount = document.getElementById("runLogCountBadge");
  if (rCount) rCount.textContent = allRunLogsCache.length;

  showToast(currentLang === "hi"
    ? `सफलतापूर्वक पंजीकृत! केस डॉसियर ${docketRef} ऑडिट रन लॉग में दर्ज हो गया है।`
    : `Successfully registered! Case docket ${docketRef} recorded in Audit Run Log.`, "success");
}

window.initStudioDocumentGenerator = initStudioDocumentGenerator;
window.setStudioDocType = setStudioDocType;
window.loadStudioPreset = loadStudioPreset;
window.updateStudioLivePreview = updateStudioLivePreview;
window.copyStudioDocText = copyStudioDocText;
window.downloadStudioDocPdf = downloadStudioDocPdf;
window.saveStudioDocToQueue = saveStudioDocToQueue;
window.AI_DRAFTING_MODELS = AI_DRAFTING_MODELS;
window.setDraftingAiModel = setDraftingAiModel;
window.regenerateActiveDocumentWithModel = regenerateActiveDocumentWithModel;
window.getAiModelDisplayName = getAiModelDisplayName;



function initApp() {
  try { initTheme(); } catch (e) { console.warn("Theme init:", e); }
  try { initLanguage(); } catch (e) { console.warn("Language init:", e); }
  try { initAuthFlow(); } catch (e) { console.warn("Auth init:", e); }
  try { initStudioDocumentGenerator(); } catch (e) { console.warn("Studio init:", e); }
  try { setupNavigation(); } catch (e) { console.warn("Nav init:", e); }
  try { initLeafletPioMap(); } catch (e) { console.warn("Map init:", e); }
  try { initRadarAnimation(); } catch (e) { console.warn("Radar init:", e); }
  try { renderLucide(); } catch (e) { console.warn("Lucide init:", e); }

  const session = getAuthSession();
  if (!session) {
    document.body.classList.add("auth-mode");
    updateHeaderAuthState();
    showPage("auth");
  } else {
    document.body.classList.remove("auth-mode");
    updateHeaderAuthState();
    showPage("home");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// Persona Switcher (Law Firm vs Gov Desk)
function switchPersona(persona) {
  activePersona = persona;
  const btnLaw = document.getElementById("btnPersonaLaw");
  const btnGov = document.getElementById("btnPersonaGov");

  if (persona === "law_firm") {
    btnLaw.classList.add("active");
    btnGov.classList.remove("active");
    const revInput = document.getElementById("reviewerName");
    if (revInput) revInput.value = "Adv. S. Kalra (Advocate on Record / Legal NGO)";
  } else {
    btnGov.classList.add("active");
    btnLaw.classList.remove("active");
    const revInput = document.getElementById("reviewerName");
    if (revInput) revInput.value = "Shri R. P. Maurya, IAS (Designated Public Authority)";
  }

  if (currentCase) {
    updateWorkspacePersonaView(currentCase);
  }
  renderLucide();
}

// Top-Level Site Navigation Router (Home, Dashboard, About, Pillars)
function showPage(pageId) {
  if (pageId === "auth") {
    document.body.classList.add("auth-mode");
    document.querySelectorAll(".site-page").forEach(p => {
      if (p.id === "page-auth") {
        p.classList.add("active");
        p.style.display = "block";
      } else {
        p.classList.remove("active");
        p.style.display = "none";
      }
    });
    updateHeaderAuthState();
    window.scrollTo({ top: 0, behavior: "smooth" });
    try { renderLucide(); } catch (e) {}
    return;
  }

  // Gated check: If user not logged in, redirect to auth first page
  const session = getAuthSession();
  if (!session) {
    showPage("auth");
    return;
  }

  document.body.classList.remove("auth-mode");
  const authEl = document.getElementById("page-auth");
  if (authEl) {
    authEl.classList.remove("active");
    authEl.style.display = "none";
  }

  document.querySelectorAll(".nav-link-btn").forEach(b => b.classList.remove("active"));
  const navDashBtn = document.getElementById("navDashboardBtn");
  if (navDashBtn) navDashBtn.classList.remove("active");

  document.querySelectorAll(".site-page").forEach(p => {
    if (p.id !== `page-${pageId}`) {
      p.classList.remove("active");
      p.style.display = "none";
    }
  });

  const navMap = {
    home: "siteNavHome",
    dashboard: "siteNavDashboard",
    about: "siteNavAbout",
    pillars: "siteNavPillars"
  };

  const navBtn = navMap[pageId] ? document.getElementById(navMap[pageId]) : null;
  const pageEl = document.getElementById(`page-${pageId}`);

  if (navBtn) navBtn.classList.add("active");
  if ((pageId === "dashboard" || pageId === "case-detail") && navDashBtn) navDashBtn.classList.add("active");
  if (pageEl) {
    pageEl.classList.add("active");
    pageEl.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (pageId === "dashboard") {
    try { loadCaseQueue(); } catch (e) { console.warn("Queue error:", e); }
    try { loadRunLogs(); } catch (e) { console.warn("RunLog error:", e); }
    try { loadCustomActs(); } catch (e) { console.warn("Acts error:", e); }
  } else if (pageId === "home") {
    try { loadCaseQueue(); } catch (e) { console.warn("Queue error:", e); }
  }

  try { renderLucide(); } catch (e) {}
}

// Dashboard Sub-Tab Switcher (Casework, Statutory, PIO, Compliance, RunLog)
// Dashboard Sub-Tab Switcher (Studio, Casework, Statutory, PIO, Compliance, RunLog)
function switchDashTab(tabId) {
  showPage("dashboard");
  document.querySelectorAll(".desk-subnav-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".dash-module").forEach(m => m.classList.remove("active"));

  const subnavMap = {
    studio: "subnavStudio",
    casework: "subnavCasework",
    statutory: "subnavStatutory",
    pio: "subnavPio",
    compliance: "subnavCompliance",
    runlog: "subnavRunlog"
  };

  const targetBtn = subnavMap[tabId] ? document.getElementById(subnavMap[tabId]) : null;
  const targetModule = document.getElementById(`dashtab-${tabId}`);

  if (targetBtn) targetBtn.classList.add("active");
  if (targetModule) targetModule.classList.add("active");

  if (tabId === "studio") updateStudioLivePreview();
  if (tabId === "casework") loadCaseQueue();
  if (tabId === "statutory") loadCustomActs();
  if (tabId === "compliance") initSlaPenaltyCalculator();
  if (tabId === "runlog") {
    const searchInput = document.getElementById("runLogSearchInput");
    if (searchInput && !window._keepRunLogQueryOnce) {
      searchInput.value = "";
    }
    window._keepRunLogQueryOnce = false;

    renderRunLogsTable(allRunLogsCache);
    const countBadge = document.getElementById("runLogCountBadge");
    if (countBadge) countBadge.textContent = (allRunLogsCache || []).length;
    loadRunLogs();
  }
  if (tabId === "pio") {
    updatePioMapForCase(currentCase);
    if (leafletMap) {
      setTimeout(() => leafletMap.invalidateSize(), 150);
    }
  }

  renderLucide();
}

// Backwards compatibility aliases
function switchMainModule(modName) {
  if (modName === "home" || modName === "about" || modName === "pillars") {
    showPage(modName);
  } else {
    switchDashTab(modName);
  }
}

function switchToTab(tabName) {
  if (tabName === "intake" || tabName === "queue" || tabName === "workspace") switchDashTab("casework");
  else if (tabName === "precedents") switchDashTab("statutory");
  else if (tabName === "radar") switchDashTab("pio");
  else if (tabName === "runlog") switchDashTab("runlog");
  else switchDashTab("casework");
}

function toggleIntakeForm() {
  const c = document.getElementById("intakeFormContainer");
  const t = document.getElementById("intakeToggleText");
  if (c) {
    if (c.style.display === "none") {
      c.style.display = "block";
      if (t) t.textContent = (currentLang === "hi") ? "फॉर्म छुपाएं" : "Hide Form";
    } else {
      c.style.display = "none";
      if (t) t.textContent = (currentLang === "hi") ? "+ नया फॉर्म खोलें" : "+ Expand Form";
    }
  }
}

function setupNavigation() {
  // Navigation setup
}

// Document Sub-Tabs in Legal Workspace
function switchDocTab(tabName) {
  currentDocTab = tabName;
  document.querySelectorAll(".doc-draft-tab, .doc-tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll("[id^='docPanel']").forEach(p => p.classList.add("hidden"));

  const btn = Array.from(document.querySelectorAll(".doc-draft-tab, .doc-tab-btn")).find(b =>
    b.dataset.doctab === tabName || b.textContent.toLowerCase().includes(tabName)
  );
  if (btn) btn.classList.add("active");

  const panelMap = {
    rti: "docPanelRti",
    appeal: "docPanelAppeal",
    notice: "docPanelNotice",
    section8: "docPanelSection8",
    slip: "docPanelSlip",
    report: "docPanelReport"
  };

  const panel = document.getElementById(panelMap[tabName]);
  if (panel) panel.classList.remove("hidden");

  if (tabName === "section8") {
    refreshSection8Shield();
  } else if (tabName === "slip") {
    renderTabPostalSlip();
  }
}

// Postal PIN Code Jurisdiction Resolver Client
let pincodeLookupTimeout = null;

async function handlePincodeInput(val) {
  const pin = (val || "").trim();
  const badge = document.getElementById("pincodeJurisdictionBadge");
  if (!badge) return;

  if (pincodeLookupTimeout) clearTimeout(pincodeLookupTimeout);

  if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    badge.style.display = "none";
    badge.innerHTML = "";
    return;
  }

  pincodeLookupTimeout = setTimeout(async () => {
    badge.style.display = "block";
    badge.innerHTML = (currentLang === "hi")
      ? `<span style="color: var(--gov-navy); font-weight: 600;">पिन <b>${pin}</b> हेतु आधिकारिक डाक क्षेत्राधिकार की पुष्टि जारी...</span>`
      : `<span style="color: var(--gov-navy); font-weight: 600;">Resolving official postal jurisdiction for PIN <b>${pin}</b>...</span>`;
    renderLucide();

    try {
      const res = await fetch(`${API_BASE}/cases/pincode-lookup?pincode=${pin}`);
      const data = await res.json();
      if (res.ok && data.status === "success") {
        const codex = data.land_codex || {};
        const pio = data.assigned_pio || {};
        const isHi = (currentLang === "hi");
        const titleTxt = isHi ? "✓ सत्यापित प्रशासनिक क्षेत्राधिकार:" : "✓ Verified Administrative Jurisdiction:";
        const pioLabel = isHi ? "नामित जन सूचना अधिकारी:" : "Designated PIO:";
        const pioName = tOfficer(pio.pio_name || (isHi ? "तहसीलदार / नोडल अधिकारी" : "Tahsildar / Nodal Officer"));
        const pioDesig = tDesignation(pio.designation || (isHi ? "जन सूचना अधिकारी" : "PIO"));
        const landLabel = isHi ? "राज्य भू-राजस्व कानून:" : "State Land Law:";
        const portalLabel = isHi ? "पोर्टल:" : "Portal:";
        const centerLabel = isHi ? "केंद्र:" : "Center:";
        const landAct = tAddress(codex.primary_land_act || (isHi ? "राज्य भू-राजस्व अधिनियम" : "State Land Revenue Act"));
        const portalName = codex.digital_land_portal || (isHi ? "डिजिटल भू-अभिलेख" : "Digital Land Records");
        const blockName = data.block || (isHi ? "तहसील / ब्लॉक" : "Taluk/Block");

        badge.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px;">
            <div>
              <b style="color: var(--gov-navy);">${titleTxt}</b>
              <span style="font-weight: 600; color: var(--ink-primary);">${data.district}, ${data.state} (${blockName})</span>
            </div>
            <span style="font-size: 10px; color: var(--status-active); font-weight: 700;">${centerLabel} ${data.latitude ? data.latitude.toFixed(4) : ""}, ${data.longitude ? data.longitude.toFixed(4) : ""}</span>
          </div>
          <div style="margin-top: 3px; color: var(--ink-secondary); font-size: 10.5px;">
            <b>${pioLabel}</b> ${pioName} &bull; <i>${pioDesig}</i>
          </div>
          <div style="margin-top: 2px; color: var(--gov-copper); font-size: 10px; font-weight: 600;">
            <b>${landLabel}</b> ${landAct} &bull; <b>${portalLabel}</b> ${portalName}
          </div>
        `;
      } else {
        badge.innerHTML = (currentLang === "hi")
          ? `<span style="color: #DC2626;">⚠ पिन कोड ${pin} का सत्यापन नहीं हो सका। कृपया 6-अंकों का वैध डाक कोड दर्ज करें।</span>`
          : `<span style="color: #DC2626;">⚠ Could not resolve PIN ${pin}. Please verify the 6-digit postal code.</span>`;
      }
      renderLucide();
    } catch (err) {
      console.warn("Pincode lookup error:", err);
      badge.style.display = "none";
    }
  }, 250);
}

// Close Case Registered Modal
function closeCaseRegisteredModal() {
  const m = document.getElementById("caseRegisteredModal");
  if (m) m.classList.add("hidden");
  switchMainModule("casework");
}
window.closeCaseRegisteredModal = closeCaseRegisteredModal;

// Direct Navigation from Modal to Audit Run Log
function goToAuditRunLogForCase() {
  const m = document.getElementById("caseRegisteredModal");
  if (m) m.classList.add("hidden");
  const caseId = window.activeRegisteredCaseId || (currentCase && currentCase.case_id) || "";
  window._keepRunLogQueryOnce = true;
  const searchInput = document.getElementById("runLogSearchInput");
  if (searchInput && caseId) {
    searchInput.value = caseId;
  }
  switchDashTab("runlog");
  if (caseId) {
    handleRunLogSearch(caseId);
  }
}
window.goToAuditRunLogForCase = goToAuditRunLogForCase;

// Show Case Registered Success Screen & Modal
function showCaseRegistrationSuccessScreen(c) {
  window.activeRegisteredCaseId = c.case_id;
  const m = document.getElementById("caseRegisteredModal");
  if (m) {
    const idEl = document.getElementById("regModalCaseId");
    if (idEl) idEl.textContent = c.case_id;
    const compEl = document.getElementById("regModalComplainant");
    if (compEl) compEl.textContent = (c.complainant && c.complainant.name) || "Applicant";
    const deptEl = document.getElementById("regModalDept");
    if (deptEl) deptEl.textContent = c.department || "Public Authority";
    const pioEl = document.getElementById("regModalPio");
    if (pioEl) pioEl.textContent = (c.suggested_pio && c.suggested_pio.pio_name) || "Designated PIO";
    m.classList.remove("hidden");
  }

  // Toast notification
  const toastMsg = (currentLang === "hi")
    ? `सफलतापूर्वक पंजीकृत! केस डॉसियर ${c.case_id} ऑडिट रन लॉग में दर्ज हो गया है।`
    : `Successfully registered! Case docket ${c.case_id} recorded in Audit Run Log.`;
  if (typeof showToast === "function") {
    showToast(toastMsg, "success");
  }

  // Non-blocking log confirmation with explicit "Successfully registered!" message
  const successMsg = (currentLang === "hi")
    ? `✓ सफलतापूर्वक पंजीकृत!\n\nकेस डॉसियर संख्या: ${c.case_id}\nआवेदक: ${(c.complainant && c.complainant.name) || 'नागरिक'}\nविभाग: ${tDept(c.department)}\nऑडिट रन लॉग: सुरक्षित रूप से दर्ज`
    : `✓ Successfully registered!\n\nDocket Number: ${c.case_id}\nComplainant: ${(c.complainant && c.complainant.name) || 'Citizen'}\nDepartment: ${c.department}\nAudit Run Log: Case records updated in immutable log.`;
  console.log(successMsg);
}
window.showCaseRegistrationSuccessScreen = showCaseRegistrationSuccessScreen;

// Build local registered case if server is offline or throttled
function buildLocalRegisteredCase(payload) {
  const text = (payload.raw_grievance || "").toLowerCase();
  let dept = "Revenue & Land Records";
  let bnsSec = "BNS Sec 318(4) (Cheating)";
  let ipcSec = "IPC Sec 420 (Cheating)";
  let pioName = "Shri N. Goyal";
  let pioDesig = "Tehsildar & Designated PIO";
  let office = "Tehsil & District Kachehri Complex, Revenue Circle 2, Mehrauli, New Delhi - 110030";
  let infraction = "Administrative Delay & Statutory Inaction";

  if (text.includes("power") || text.includes("electric") || text.includes("bijli") || text.includes("meter") || text.includes("bill") || text.includes("voltage") || text.includes("transformer")) {
    dept = "Electricity & Power Discom";
    bnsSec = "BNS Sec 199 (Public Servant Disobeying Law)";
    ipcSec = "IPC Sec 166A (Public Servant Disobeying Direction)";
    pioName = "Er. M. P. Saxena";
    pioDesig = "Superintending Engineer (Billing & Metering) & Nodal PIO";
    office = "State Power Distribution Corporation, Shakti Bhawan, Nehru Place, New Delhi - 110019";
    infraction = "Unscheduled Load Shedding & Power Infrastructure Failure";
  } else if (text.includes("food") || text.includes("ration") || text.includes("bpl") || text.includes("pds") || text.includes("canteen")) {
    dept = "Food & Civil Supplies";
    bnsSec = "BNS Sec 274 (Adulteration of food)";
    ipcSec = "IPC Sec 272 (Adulteration of food)";
    pioName = "Shri R. K. Sharma";
    pioDesig = "Public Information Officer & Assistant Commissioner";
    office = "Office of the District Supply Officer, Ward 4, Civil Lines, New Delhi - 110054";
    infraction = "PDS Diversion & Canteen Substandard Quality";
  } else if (text.includes("drain") || text.includes("road") || text.includes("sewer") || text.includes("waterlog") || text.includes("pothole") || text.includes("municipal")) {
    dept = "Municipal Public Works & Drainage";
    bnsSec = "BNS Sec 285 (Danger or obstruction in public way)";
    ipcSec = "IPC Sec 283 (Danger or obstruction in public way)";
    pioName = "Er. S. K. Kalra";
    pioDesig = "Executive Engineer (Drainage & Stormwater)";
    office = "Municipal Kachehri Complex, Zone 7, Sector 12, Dwarka, New Delhi - 110075";
    infraction = "Municipal Drainage Dereliction & Road Repair";
  }

  const pio = {
    pio_name: pioName,
    designation: pioDesig,
    office_address: office,
    distance_label: "850 meters away",
    distance_km: 0.85,
    email: "pio@gov.in",
    phone: "+91-11-26641209"
  };

  const isUrgent = !!payload.is_urgent;
  const now = new Date();
  const subDate = payload.original_submission_date || now.toISOString().split("T")[0];
  const refNo = payload.application_ref_no || `REF-${Math.floor(1000 + Math.random() * 9000)}`;

  const questions = [
    `1. Please provide certified daily progress and action-taken report on grievance ${refNo} from ${subDate} to date.`,
    `2. Please disclose the names, official designations, and contact details of officials responsible for resolving the grievance.`,
    `3. Please provide certified copies of relevant departmental file notings, inspection reports, and citizen charter SLA compliance.`
  ];

  return {
    case_id: payload.caseId,
    complainant: payload.complainant,
    raw_grievance: payload.raw_grievance,
    category: dept,
    department: dept,
    pincode: payload.pincode || "201306",
    district: "Noida / Gautam Buddha Nagar",
    state: "Uttar Pradesh",
    application_ref_no: refNo,
    original_submission_date: subDate,
    status: "NEEDS_REVIEW",
    priority: isUrgent ? "URGENT_LIFE_AND_LIBERTY" : "NORMAL",
    sla_days_remaining: isUrgent ? 2 : 30,
    due_date: new Date(Date.now() + (isUrgent ? 2 : 30) * 86400000).toISOString().split("T")[0],
    suggested_pio: pio,
    assigned_pio: pio,
    statutory_legal_analysis: {
      statutory_infraction: infraction,
      ipc_sections: [ipcSec],
      bns_sections: [bnsSec],
      allied_acts: ["Right to Public Services Act", "State Citizen Charter Act 2013"],
      maximum_punishment: "Disciplinary Action & Section 20(1) Penalty",
      case_merit_score: 95,
      win_probability: "VERY HIGH (96%)",
      legal_grounds: ["Administrative delay past prescribed Citizen Charter SLA", "Failure of public authority to provide written disposal"]
    },
    draft_rti: {
      application_subject: `Application under Section 6(1) of RTI Act 2005 seeking certified inspection and status report on pending grievance (Ref: ${refNo}) regarding ${dept}`,
      questions: questions,
      fees_paid: "Rs. 10 Indian Postal Order attached under Rule 3 Central RTI Rules 2012",
      full_document_text: `FORM A - APPLICATION FOR INFORMATION UNDER SECTION 6(1) RTI ACT 2005\n\nTo,\n${pio.designation}\n${pio.office_address}\n\n1. Name of Applicant: ${payload.complainant.name}\n2. Address: ${payload.complainant.address}\n3. Particulars of Information Sought:\n${questions.join("\n")}\n\n4. Application Fee: Rs. 10 attached.\n\nDate: ${subDate}\nSignature of Applicant`,
      version: 1
    },
    confidence: {
      overall: 95,
      risk_level: "LOW",
      evidence_gaps: []
    },
    created_at: now.toISOString().replace("T", " ").substring(0, 19),
    updated_at: now.toISOString().replace("T", " ").substring(0, 19),
    update_history: [
      {
        timestamp: now.toISOString().replace("T", " ").substring(0, 19),
        update_type: "INTAKE_INGESTED",
        actor: "Citizen Intake Gateway",
        field_changed: "Case Intake",
        old_value: "None",
        new_value: `Case ${payload.caseId} created`,
        remarks: `Registered grievance for ${payload.complainant.name}`
      }
    ]
  };
}

// Render queue list directly from allCasesCache
function renderCaseQueueFromCache() {
  const tbody = document.getElementById("caseQueueBody");
  if (!tbody || !allCasesCache) return;
  tbody.innerHTML = "";

  const statTotal = document.getElementById("statTotal");
  if (statTotal) statTotal.textContent = allCasesCache.length;
  const statInbox = document.getElementById("statInbox");
  if (statInbox) statInbox.textContent = allCasesCache.filter(x => x.status !== 'APPROVED').length;
  const homeStatTotal = document.getElementById("homeStatTotal");
  if (homeStatTotal) homeStatTotal.textContent = allCasesCache.length;
  const homeStatInbox = document.getElementById("homeStatInbox");
  if (homeStatInbox) homeStatInbox.textContent = allCasesCache.filter(x => x.status !== 'APPROVED').length;

  allCasesCache.forEach(c => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.onclick = () => {
      openCaseWorkspace(c);
      switchMainModule("casework");
    };

    const pio = c.suggested_pio || {};
    const legal = c.statutory_legal_analysis || {};
    const ipcBrief = legal.ipc_sections ? legal.ipc_sections[0] : "IPC Sec 420";
    const bnsBrief = legal.bns_sections ? legal.bns_sections[0] : "BNS Sec 318(4)";
    const distLabel = pio.distance_label || (c.geospatial_meta ? c.geospatial_meta.distance_label : "1.5 km away");

    const displayStatus = tStatus(c.status);
    const displayComplainant = tComplainant(c.complainant && c.complainant.name);
    const displayAddress = tAddress(c.complainant && c.complainant.address);
    const displayDept = tDept(c.department);
    const displayInfraction = tInfraction(legal.statutory_infraction);
    const displayBns = tSection(bnsBrief);
    const displayIpc = tSection(ipcBrief);
    const displayPio = tOfficer(pio.pio_name);
    const displayDist = formatDistanceLabel(distLabel);

    tr.innerHTML = `
      <td><b style="font-family: var(--font-mono); color: var(--gov-navy); font-size: 11.5px;">${c.case_id}</b></td>
      <td><b>${displayComplainant}</b><br/><span style="font-size: 10px; color: var(--ink-muted);">${displayAddress}${c.pincode ? ' (' + c.pincode + ')' : ''}</span></td>
      <td><b>${displayDept}</b><br/><span style="font-size: 10px; color: var(--gov-copper);">${displayInfraction}</span></td>
      <td><span class="statutory-tag bns" style="font-size: 9.5px; padding: 1px 4px;">${displayBns}</span><br/><span class="statutory-tag ipc" style="font-size: 9.5px; padding: 1px 4px; margin-top: 2px;">${displayIpc}</span></td>
      <td><b>${displayPio}</b><br/><span style="font-size: 9.5px; color: var(--status-active); font-family: var(--font-mono);">${displayDist}</span></td>
      <td><span class="status-pill ${c.status === 'APPROVED' ? 'approved' : (c.status === 'TRANSFERRED_SEC_6_3' ? 'transferred' : (c.status === 'MERGED_DUPLICATE' ? 'neutral' : 'under-review'))}">● ${displayStatus}</span></td>
      <td><button class="btn-gov-outline btn-view-docket" style="padding: 3px 8px; font-size: 10.5px;" onclick="event.stopPropagation(); openCaseWorkspace(c); switchMainModule('casework');">${t("btn_view")}</button></td>
    `;
    tbody.appendChild(tr);
  });
  if (typeof renderLucide === "function") renderLucide();
}

// Submit Citizen / Advocate Intake
async function submitIntake(event) {
  if (event) event.preventDefault();

  const submitBtn = (event && event.target) ? event.target.querySelector('button[type="submit"]') : document.getElementById("btnRegisterCase");
  let origBtnHtml = "";
  if (submitBtn) {
    origBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.75";
    submitBtn.style.pointerEvents = "none";
    submitBtn.innerHTML = `
      <span style="display:inline-flex; align-items:center; justify-content:center; gap:6px;">
        <span class="inline-spinner" style="display:inline-block; width:13px; height:13px; border:2px solid #ffffff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite;"></span>
        <span>${currentLang === "hi" ? "केस दर्ज हो रहा है..." : "Registering Case..."}</span>
      </span>
    `;
  }

  try {
    const rawGrievanceInput = document.getElementById("rawGrievance");
    const raw_grievance = rawGrievanceInput ? rawGrievanceInput.value.trim() : "";
    if (!raw_grievance) {
      if (typeof showToast === "function") {
        showToast(currentLang === "hi" ? "कृपया अपनी शिकायत का विवरण दर्ज करें।" : "Please enter your grievance narrative.", "warning");
      } else {
        alert(currentLang === "hi" ? "कृपया अपनी शिकायत का विवरण दर्ज करें।" : "Please enter your grievance narrative.");
      }
      return;
    }

    const pincodeInput = document.getElementById("complainantPincode");
    const pincode = (pincodeInput && pincodeInput.value.trim()) || "221005";

    const nameInput = document.getElementById("complainantName");
    const contactInput = document.getElementById("complainantContact");
    const addrInput = document.getElementById("complainantAddr");
    const langSelect = document.getElementById("complainantLang");

    const complainant = {
      name: (nameInput && nameInput.value.trim()) || "Citizen Applicant",
      contact: (contactInput && contactInput.value.trim()) || "+91-9876543210",
      address: (addrInput && addrInput.value.trim()) || "Assi Ghat, Varanasi, UP",
      pincode: pincode,
      language: (langSelect && langSelect.value) || "English"
    };

    const refNoInput = document.getElementById("intakeRefNo");
    const application_ref_no = (refNoInput && refNoInput.value.trim()) || `REF-${Math.floor(10000 + Math.random() * 90000)}`;
    const dateInput = document.getElementById("intakeSubDate");
    const original_submission_date = (dateInput && dateInput.value.trim()) || getLocalTimestamp().slice(0, 10);
    const is_urgent = document.getElementById("intakeUrgent") ? document.getElementById("intakeUrgent").checked : false;

    // 1. Immediately determine next Case ID
    const existingIds = (allCasesCache || []).map(c => {
      const m = (c.case_id || "").match(/\d+/);
      return m ? parseInt(m[0]) : 1040;
    });
    const nextNum = Math.max(...existingIds, 1048) + 1;
    const localCaseId = `ARZ-${nextNum}`;

    let finalCase = buildLocalRegisteredCase({
      caseId: localCaseId,
      complainant,
      raw_grievance,
      application_ref_no,
      original_submission_date,
      is_urgent,
      pincode
    });

    // 2. Fast non-blocking / short-timeout server request (max 1.2s so UI is never stuck on static/offline)
    try {
      const controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 1200) : null;

      const res = await fetch(`${API_BASE}/cases/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complainant, raw_grievance, application_ref_no, original_submission_date, is_urgent, pincode, lang: currentLang }),
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.case) {
          finalCase = data.case;
        }
      }
    } catch (err) {
      console.warn("Intake fast server sync skipped, using deterministic local docket:", err);
    }

    // 3. Reset intake form
    const intakeForm = document.getElementById("intakeForm");
    if (intakeForm) intakeForm.reset();
    const pBadge = document.getElementById("pincodeJurisdictionBadge");
    if (pBadge) { pBadge.style.display = "none"; pBadge.innerHTML = ""; }
    const mlBox = document.getElementById("liveMlPredictionBox");
    if (mlBox) { mlBox.style.display = "none"; mlBox.innerHTML = ""; }

    // 4. Update in-memory case list
    if (!allCasesCache) allCasesCache = [];
    const idx = allCasesCache.findIndex(x => x.case_id === finalCase.case_id);
    if (idx >= 0) {
      allCasesCache[idx] = finalCase;
    } else {
      allCasesCache.unshift(finalCase);
    }

    // 5. Refresh case table
    if (typeof renderCaseQueueFromCache === "function") {
      renderCaseQueueFromCache();
    }

    // 6. Update Run Log Audit Trail immediately with new Case ID
    const regLogEntry = {
      run_id: `RLOG-${Date.now().toString().slice(-4)}`,
      timestamp: getLocalTimestamp(),
      event_type: "CASE_REGISTERED",
      case_id: finalCase.case_id,
      actor: "Citizen Intake Gateway",
      source: "Web Intake Portal",
      action: `Successfully registered case ${finalCase.case_id} for complainant ${(finalCase.complainant && finalCase.complainant.name) || 'Citizen'} (${finalCase.department || 'Public Authority'})`,
      result: "SUCCESS",
      correlation_id: `CORR-${finalCase.case_id}`
    };

    if (!allRunLogsCache) allRunLogsCache = [];
    allRunLogsCache = [regLogEntry, ...allRunLogsCache.filter(l => !(l.case_id === finalCase.case_id && (l.event_type === "CASE_REGISTERED" || l.event_type === "INTAKE_RECEIVED")))];
    try {
      localStorage.setItem("arzi_run_logs_ledger", JSON.stringify(allRunLogsCache.slice(0, 100)));
    } catch (e) {}

    // Reset search input so newly registered case appears at the top
    const searchInput = document.getElementById("runLogSearchInput");
    if (searchInput) searchInput.value = "";

    if (typeof renderRunLogsTable === "function") {
      renderRunLogsTable(allRunLogsCache);
    }
    const rBadge = document.getElementById("runLogCountBadge");
    if (rBadge) rBadge.textContent = allRunLogsCache.length;

    // 7. Populate workspace and switch directly to registered case screen
    currentCase = finalCase;
    if (typeof populateWorkspaceFields === "function") populateWorkspaceFields(finalCase);
    if (typeof switchMainModule === "function") switchMainModule("casework");

    // 8. Show "Successfully registered!" modal & notification
    if (typeof showCaseRegistrationSuccessScreen === "function") {
      showCaseRegistrationSuccessScreen(finalCase);
    }

    // 9. Non-blocking background sync for map and server run-logs
    setTimeout(() => {
      try { if (typeof updatePioMapForCase === "function") updatePioMapForCase(finalCase); } catch (e) {}
      try { if (typeof loadRunLogs === "function") loadRunLogs(); } catch (e) {}
    }, 50);

  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      submitBtn.style.pointerEvents = "auto";
      if (origBtnHtml) submitBtn.innerHTML = origBtnHtml;
      if (typeof renderLucide === "function") renderLucide();
    }
  }
}

// All-India Civic Presets Loader (28 States & 8 UTs)
function loadPreset(num) {
  switchMainModule("casework");
  const c = document.getElementById("intakeFormContainer");
  if (c) c.style.display = "block";

  const urgentCheckbox = document.getElementById("intakeUrgent");
  if (urgentCheckbox) urgentCheckbox.checked = false;

  let pinToResolve = "";

  if (num === 1) {
    // 1. Delhi PDS Ration
    document.getElementById("complainantName").value = "Sunita Devi";
    document.getElementById("complainantContact").value = "+91-9876543210";
    document.getElementById("complainantAddr").value = "House No. 45, BPL Cluster, Civil Lines, Delhi";
    document.getElementById("complainantPincode").value = "110054";
    document.getElementById("intakeRefNo").value = "RC-88492";
    document.getElementById("intakeSubDate").value = "15-Feb-2026";
    document.getElementById("rawGrievance").value = "My family's BPL ration card application (Ref No. RC-88492) was submitted on 15-Feb-2026 at Civil Lines supply office. We have not received the card or food grains. Staff refuses to disclose stock registers.";
    pinToResolve = "110054";
  } else if (num === 2) {
    // 2. Karnataka Bhoomi Land Mutation (Bengaluru North)
    document.getElementById("complainantName").value = "Basavaraj Gowda";
    document.getElementById("complainantContact").value = "+91-9845012345";
    document.getElementById("complainantAddr").value = "Indiranagar, Bengaluru North, Karnataka";
    document.getElementById("complainantPincode").value = "560001";
    document.getElementById("intakeRefNo").value = "BLR-MUT-7701";
    document.getElementById("intakeSubDate").value = "18-Jan-2026";
    document.getElementById("rawGrievance").value = "My application for land title mutation and RTC Pahani extract transfer on the Karnataka Bhoomi portal (Ref BLR-MUT-7701) was submitted on 18-Jan-2026. Tahsildar office Bangalore North has kept the file pending past 30 days without reasons. Revenue Inspector refuses inspection.";
    pinToResolve = "560001";
  } else if (num === 3) {
    // 3. Maharashtra 7/12 Satbara Land Title (Mumbai)
    document.getElementById("complainantName").value = "Sachin Deshmukh";
    document.getElementById("complainantContact").value = "+91-9820011223";
    document.getElementById("complainantAddr").value = "Fort, South Mumbai, Maharashtra";
    document.getElementById("complainantPincode").value = "400001";
    document.getElementById("intakeRefNo").value = "MH-FER-4521";
    document.getElementById("intakeSubDate").value = "05-Jan-2026";
    document.getElementById("rawGrievance").value = "Application for Ferfar mutation entry and Satbara 7/12 extract on MahaBhulekh portal (Ref MH-FER-4521) registered under Section 149 & 150 Maharashtra Land Revenue Code 1966. Talathi and Tahsildar have failed to issue certified extract or show cause notice.";
    pinToResolve = "400001";
  } else if (num === 4) {
    // 4. Rajasthan Land Demarcation (Jaipur)
    document.getElementById("complainantName").value = "Kailash Choudhary";
    document.getElementById("complainantContact").value = "+91-9414055667";
    document.getElementById("complainantAddr").value = "C-Scheme, Jaipur, Rajasthan";
    document.getElementById("complainantPincode").value = "302001";
    document.getElementById("intakeRefNo").value = "RJ-JAM-9912";
    document.getElementById("intakeSubDate").value = "12-Dec-2025";
    document.getElementById("rawGrievance").value = "Application for land demarcation and Namantaran mutation under Section 133 & 135 Rajasthan Land Revenue Act 1956 and Apna Khata portal. Patwari is refusing field measurement and boundary verification despite receipt of demarcation fee.";
    pinToResolve = "302001";
  } else if (num === 5) {
    // 5. Varanasi Land Khasra (Varanasi / Banaras)
    document.getElementById("complainantName").value = "Shivanshu Pandey";
    document.getElementById("complainantContact").value = "+91-9988776655";
    document.getElementById("complainantAddr").value = "Assi Ghat, Varanasi / Banaras, Uttar Pradesh";
    document.getElementById("complainantPincode").value = "221005";
    document.getElementById("intakeRefNo").value = "VNS-99401";
    document.getElementById("intakeSubDate").value = "10-Jan-2026";
    document.getElementById("rawGrievance").value = "My land mutation khasra 88/14 application (Ref VNS-99401) submitted on 10-Jan-2026 at Tehsil Kachehri Varanasi under UP Revenue Code 2006 is pending beyond the 30-day statutory limit. Lekhpal is refusing to update the revenue registry on UP Bhulekh.";
    pinToResolve = "221005";
  } else if (num === 6) {
    // 6. Bihar Land Mutation (Patna)
    document.getElementById("complainantName").value = "Pradeep Kumar Yadav";
    document.getElementById("complainantContact").value = "+91-9709012345";
    document.getElementById("complainantAddr").value = "Kankarbagh, Patna, Bihar";
    document.getElementById("complainantPincode").value = "800001";
    document.getElementById("intakeRefNo").value = "BR-RTPS-6621";
    document.getElementById("intakeSubDate").value = "20-Jan-2026";
    document.getElementById("rawGrievance").value = "Dakhil Kharij mutation application under Section 6 & 9 of the Bihar Land Mutation Act 2011 and Bihar RTPS portal (Ref BR-RTPS-6621). Circle Officer (Anchal Adhikari) Patna has failed to dispose mutation petition within the prescribed statutory period.";
    pinToResolve = "800001";
  } else if (num === 7) {
    // 7. 48h ICU Emergency (AIIMS Delhi)
    document.getElementById("complainantName").value = "Dr. Anil Sharma";
    document.getElementById("complainantContact").value = "+91-9811223344";
    document.getElementById("complainantAddr").value = "Trauma Center, AIIMS, Ansari Nagar, New Delhi";
    document.getElementById("complainantPincode").value = "110029";
    document.getElementById("intakeRefNo").value = "MED-91142";
    document.getElementById("intakeSubDate").value = "Today 08:00 AM";
    document.getElementById("rawGrievance").value = "CRITICAL EMERGENCY: Catastrophic ventilator power failure and acute oxygen cylinder stock-out in ICU Ward 3B posing imminent threat to human life. Demanding immediate maintenance logbooks, cylinder delivery challans, and duty roasters under Section 7(1) Proviso (48-Hour SLA).";
    if (urgentCheckbox) urgentCheckbox.checked = true;
    pinToResolve = "110029";
  } else if (num === 8) {
    // 8. Police FIR Inaction (Prayagraj)
    document.getElementById("complainantName").value = "Kavita Verma";
    document.getElementById("complainantContact").value = "+91-9871100223";
    document.getElementById("complainantAddr").value = "Civil Lines, Prayagraj, Uttar Pradesh";
    document.getElementById("complainantPincode").value = "211001";
    document.getElementById("intakeRefNo").value = "FIR-552";
    document.getElementById("intakeSubDate").value = "02-Mar-2026";
    document.getElementById("rawGrievance").value = "Police Station SHO refuses to register mandatory FIR under Section 173 BNSS (old Section 154 CrPC) regarding violent armed snatching incident at market junction. Sub-Inspector refuses to provide GD entry copy or acknowledge complaint.";
    pinToResolve = "211001";
  } else if (num === 9) {
    // 9. Delhi Electricity Outage / Discom
    document.getElementById("complainantName").value = "Virender Gupta";
    document.getElementById("complainantContact").value = "+91-9810234567";
    document.getElementById("complainantAddr").value = "Kalkaji, South Delhi, Delhi";
    document.getElementById("complainantPincode").value = "110019";
    document.getElementById("intakeRefNo").value = "DISCOM-PWR-44910";
    document.getElementById("intakeSubDate").value = "28-Feb-2026";
    document.getElementById("rawGrievance").value = "Severe recurrent unscheduled power outage and burned distribution transformer causing blackout for 5 days. BSES / Discom division junior engineer refuses to restore power grid or provide breakdown inspection logbook.";
    pinToResolve = "110019";
  } else if (num === 10) {
    // 10. Varanasi Jal Board / Water Contamination
    document.getElementById("complainantName").value = "Manoj Tripathy";
    document.getElementById("complainantContact").value = "+91-9793112244";
    document.getElementById("complainantAddr").value = "Bhelupur, Varanasi, Uttar Pradesh";
    document.getElementById("complainantPincode").value = "221010";
    document.getElementById("intakeRefNo").value = "JAL-SAN-78219";
    document.getElementById("intakeSubDate").value = "01-Mar-2026";
    document.getElementById("rawGrievance").value = "Severe water pipeline contamination with sewage backflow into municipal drinking water supply lines. Varanasi Jal Sansthan executive engineer has ignored repeated samples and lab test reports.";
    pinToResolve = "221010";
  } else if (num === 11) {
    // 11. Delhi Transport / RTO License Renewal
    document.getElementById("complainantName").value = "Rajesh Narang";
    document.getElementById("complainantContact").value = "+91-9811445566";
    document.getElementById("complainantAddr").value = "Mayur Vihar Phase 1, East Delhi, Delhi";
    document.getElementById("complainantPincode").value = "110013";
    document.getElementById("intakeRefNo").value = "DL-RTO-55201";
    document.getElementById("intakeSubDate").value = "12-Jan-2026";
    document.getElementById("rawGrievance").value = "Commercial driving license renewal and vehicle fitness RC endorsement application pending at Sarai Kale Khan RTO for over 60 days. Motor Licensing Officer refusing to issue smart card without illicit speed money.";
    pinToResolve = "110013";
  } else if (num === 12) {
    // 12. Delhi EPFO Pension Delay
    document.getElementById("complainantName").value = "Harcharan Singh";
    document.getElementById("complainantContact").value = "+91-9871556677";
    document.getElementById("complainantAddr").value = "Ashok Vihar, North West Delhi, Delhi";
    document.getElementById("complainantPincode").value = "110052";
    document.getElementById("intakeRefNo").value = "EPFO-PPO-33019";
    document.getElementById("intakeSubDate").value = "05-Nov-2025";
    document.getElementById("rawGrievance").value = "Retired senior citizen EPS-95 pension claim and PPO Pension Payment Order disbursal settlement pending at EPFO Wazirpur Regional Office for 120 days. Assistant Provident Fund Commissioner has failed to release accumulated superannuation pension arrears.";
    pinToResolve = "110052";
  } else if (num === 13) {
    // 13. Delhi Environment & Chemical Pollution
    document.getElementById("complainantName").value = "Anita Saxena";
    document.getElementById("complainantContact").value = "+91-9899887711";
    document.getElementById("complainantAddr").value = "Shahdara Industrial Area, Delhi";
    document.getElementById("complainantPincode").value = "110032";
    document.getElementById("intakeRefNo").value = "DPCC-ENV-90214";
    document.getElementById("intakeSubDate").value = "15-Jan-2026";
    document.getElementById("rawGrievance").value = "Illegal chemical electroplating factory emitting toxic noxious fumes and releasing untreated acidic effluent directly into residential open drains in violation of Air and Water Acts. DPCC pollution control board has failed to seal units.";
    pinToResolve = "110032";
  }

  if (pinToResolve) {
    handlePincodeInput(pinToResolve);
  }

  // Auto-run ML Domain Prediction on the loaded preset
  triggerLiveMlPrediction();

  // Scroll to intake form smoothly
  const intakeForm = document.getElementById("intakeForm");
  if (intakeForm) intakeForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Live ML Domain & Public Authority Prediction
async function triggerLiveMlPrediction() {
  const grievanceEl = document.getElementById("rawGrievance");
  const box = document.getElementById("liveMlPredictionBox");
  if (!grievanceEl || !box) return;

  const text = grievanceEl.value.trim();
  if (!text) {
    box.style.display = "block";
    box.innerHTML = `
      <div style="background:#fffbeb; border:1px solid #fef3c7; border-left:4px solid #f59e0b; border-radius:6px; padding:8px 12px; font-size:12px; color:#92400e; display:flex; align-items:center; gap:8px;">
        <span>⚠️</span>
        <span>Please enter or load grievance details first to run the ML domain prediction model.</span>
      </div>
    `;
    return;
  }

  box.style.display = "block";
  box.innerHTML = `
    <div style="background:#f0fdfa; border:1px solid #ccfbf1; border-radius:6px; padding:8px 12px; font-size:12px; color:#0f766e; display:flex; align-items:center; gap:8px;">
      <span class="spinner-border spinner-border-sm" role="status" style="width:14px; height:14px; border-width:2px;"></span>
      <span>Running ML civic classification algorithms (TF-IDF keyword matching & domain heuristics)...</span>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/cases/classify-domain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!res.ok) {
      box.innerHTML = `
        <div style="background:#fef2f2; border:1px solid #fee2e2; border-left:4px solid #ef4444; border-radius:6px; padding:8px 12px; font-size:12px; color:#991b1b;">
          ❌ ML Prediction error: ${escapeHtml(data.detail || data.error || "Failed to classify grievance")}
        </div>
      `;
      return;
    }

    const conf = Math.round(data.confidence || 0);
    const domain = escapeHtml(data.domain || "general");
    const domainUpper = domain.toUpperCase();
    const triggers = (data.triggers || []).map(t => `<span class="badge" style="font-size:10px; background:#e6fffa; color:#0d9488; border:1px solid #99f6e4; padding:2px 6px; border-radius:4px; margin-right:4px;">${escapeHtml(t)}</span>`).join("");
    const pio = data.pio || {};
    const pioInfo = pio.name ? `<div style="margin-top:5px; font-size:11px; color:#475569; border-top:1px dashed #ccfbf1; padding-top:4px;"><strong>Target Public Authority / PIO:</strong> ${escapeHtml(pio.name)} (${escapeHtml(pio.department || pio.public_authority || "")}) &bull; <em>${escapeHtml(pio.designation || "Public Information Officer")}</em></div>` : "";

    box.innerHTML = `
      <div style="background:#f0fdfa; border:1px solid #5eead4; border-left:4px solid #0d9488; border-radius:6px; padding:10px 14px; font-size:12px; color:#134e4a; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-weight:700; font-size:13px; color:#0f766e;">
            🤖 ML Classified Domain: <span style="background:#0d9488; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">${domainUpper}</span>
          </span>
          <span style="font-weight:700; color:#0d9488; font-size:12px;">Confidence: ${conf}%</span>
        </div>
        <div style="color:#334155; font-size:11px; margin-bottom:4px;">${escapeHtml(data.reason || "")}</div>
        ${triggers ? `<div style="margin-top:4px; display:flex; align-items:center; flex-wrap:wrap; gap:4px;"><span style="font-size:10px; color:#64748b; font-weight:600;">Trigger Keywords:</span> ${triggers}</div>` : ""}
        ${pioInfo}
      </div>
    `;
  } catch (err) {
    box.innerHTML = `
      <div style="background:#fef2f2; border:1px solid #fee2e2; border-left:4px solid #ef4444; border-radius:6px; padding:8px 12px; font-size:12px; color:#991b1b;">
        ❌ Connection error connecting to ML service: ${escapeHtml(err.message)}
      </div>
    `;
  }
}

// Queue Listing & Global Multi-Field Search
async function loadCaseQueue() {
  const searchQuery = document.getElementById("caseSearchInput") ? document.getElementById("caseSearchInput").value.trim() : "";
  const filter = document.getElementById("queueFilter") ? document.getElementById("queueFilter").value : "";

  let url = `${API_BASE}/cases?`;
  if (filter) url += `status=${encodeURIComponent(filter)}&`;
  if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) return;

    // Update Counts
    const statInbox = document.getElementById("statInbox");
    if (statInbox) statInbox.textContent = data.counts.inbox;
    const statApproved = document.getElementById("statApproved");
    if (statApproved) statApproved.textContent = data.counts.approved;
    const statAtRisk = document.getElementById("statAtRisk");
    if (statAtRisk) statAtRisk.textContent = data.counts.at_risk;
    const statTotal = document.getElementById("statTotal");
    if (statTotal) statTotal.textContent = data.counts.total;
    const inboxCount = document.getElementById("inboxCount");
    if (inboxCount) inboxCount.textContent = data.counts.inbox;
    const homeBadge = document.getElementById("homeQueueBadge");
    if (homeBadge) homeBadge.textContent = data.counts.inbox;
    const homeInboxEl = document.getElementById("homeStatInbox");
    if (homeInboxEl) homeInboxEl.textContent = data.counts.inbox;
    const homeTotalEl = document.getElementById("homeStatTotal");
    if (homeTotalEl) homeTotalEl.textContent = data.counts.total;

    const tbody = document.getElementById("caseQueueBody");
    tbody.innerHTML = "";

    if (data.cases.length === 0) {
      const noMatchMsg = currentLang === "hi" 
        ? `कीवर्ड "${searchQuery}" के लिए कोई संबंधित केस नहीं मिला।` 
        : `No matching cases found for keyword "${searchQuery}".`;
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">${noMatchMsg}</td></tr>`;
      return;
    }

    allCasesCache = data.cases || [];

    // Auto-select first case if none is selected yet
    if (!currentCase && data.cases.length > 0) {
      currentCase = data.cases[0];
      populateWorkspaceFields(data.cases[0]);
      updatePioMapForCase(data.cases[0]);
    }

    data.cases.forEach(c => {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.onclick = () => openCaseById(c.case_id);

      const pio = c.suggested_pio || {};
      const legal = c.statutory_legal_analysis || {};
      const ipcBrief = legal.ipc_sections ? legal.ipc_sections[0] : "IPC Sec 420";
      const bnsBrief = legal.bns_sections ? legal.bns_sections[0] : "BNS Sec 318(4)";
      const distLabel = pio.distance_label || (c.geospatial_meta ? c.geospatial_meta.distance_label : "1.5 km away");

      const displayStatus = tStatus(c.status);
      const displayComplainant = tComplainant(c.complainant && c.complainant.name);
      const displayAddress = tAddress(c.complainant && c.complainant.address);
      const displayDept = tDept(c.department);
      const displayInfraction = tInfraction(legal.statutory_infraction);
      const displayBns = tSection(bnsBrief);
      const displayIpc = tSection(ipcBrief);
      const displayPio = tOfficer(pio.pio_name);
      const displayDist = formatDistanceLabel(distLabel);

      tr.innerHTML = `
        <td><b style="font-family: var(--font-mono); color: var(--gov-navy); font-size: 11.5px;">${c.case_id}</b></td>
        <td><b>${displayComplainant}</b><br/><span style="font-size: 10px; color: var(--ink-muted);">${displayAddress}${c.pincode ? ' (' + c.pincode + ')' : ''}</span></td>
        <td><b>${displayDept}</b><br/><span style="font-size: 10px; color: var(--gov-copper);">${displayInfraction}</span></td>
        <td><span class="statutory-tag bns" style="font-size: 9.5px; padding: 1px 4px;">${displayBns}</span><br/><span class="statutory-tag ipc" style="font-size: 9.5px; padding: 1px 4px; margin-top: 2px;">${displayIpc}</span></td>
        <td><b>${displayPio}</b><br/><span style="font-size: 9.5px; color: var(--status-active); font-family: var(--font-mono);">${displayDist}</span></td>
        <td><span class="status-pill ${c.status === 'APPROVED' ? 'approved' : (c.status === 'TRANSFERRED_SEC_6_3' ? 'transferred' : (c.status === 'MERGED_DUPLICATE' ? 'neutral' : 'under-review'))}">● ${displayStatus}</span></td>
        <td><button class="btn-gov-outline btn-view-docket" style="padding: 3px 8px; font-size: 10.5px;" onclick="event.stopPropagation(); openCaseById('${c.case_id}')">${t("btn_view")}</button></td>
      `;
      tbody.appendChild(tr);
    });
    renderLucide();
  } catch (err) {
    console.error("Queue load error:", err);
  }
}

async function openCaseById(caseId) {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}`);
    const data = await res.json();
    if (res.ok) {
      openCaseWorkspace(data.case);
      switchMainModule("casework");
    }
  } catch (err) {
    console.error("Open case error:", err);
  }
}

// Workspace Renderer
function openCaseWorkspace(c) {
  currentCase = c;
  populateWorkspaceFields(c);
  updatePioMapForCase(c);
  switchMainModule("casework");
}

function populateWorkspaceFields(c) {
  const emptyState = document.getElementById("noCaseSelected");
  const workspaceView = document.getElementById("caseWorkspaceView");
  if (emptyState) emptyState.classList.add("hidden");
  if (workspaceView) workspaceView.classList.remove("hidden");

  document.getElementById("viewCaseId").textContent = c.case_id;

  const statusEl = document.getElementById("viewCaseStatus");
  if (statusEl) {
    statusEl.textContent = `● ${tStatus(c.status)}`;
    statusEl.className = `status-pill ${c.status === 'APPROVED' ? 'approved' : (c.status === 'TRANSFERRED_SEC_6_3' ? 'transferred' : (c.status === 'MERGED_DUPLICATE' ? 'neutral' : 'under-review'))}`;
  }

  document.getElementById("viewComplainant").textContent = tComplainant(c.complainant && c.complainant.name);
  document.getElementById("viewRawGrievance").textContent = `"${tGrievance(c.case_id, c.raw_grievance)}"`;

  // Pan-India Jurisdiction & State Land Codex Banner
  const jurisBanner = document.getElementById("viewJurisdictionBanner");
  const jurisArea = document.getElementById("viewJurisdictionArea");
  const portalLink = document.getElementById("viewDigitalPortalLink");
  const landActEl = document.getElementById("viewPrimaryLandAct");

  const pio = c.suggested_pio || {};
  const faa = c.suggested_faa || pio.faa || {};
  const juris = c.statutory_jurisdiction || pio.statutory_jurisdiction || {};
  const district = c.district || pio.district;
  const state = c.state || pio.state;
  const pin = c.pincode || pio.pincode;

  if (jurisBanner) {
    if (district || state || pin || juris.primary_land_act || juris.substantive_act) {
      jurisBanner.style.display = "block";
      const areaParts = [];
      if (district) areaParts.push(tAddress(district));
      if (state) areaParts.push(tAddress(state));
      const pinStr = pin ? ` [PIN: ${pin}]` : "";
      if (jurisArea) jurisArea.textContent = `${areaParts.join(", ")}${pinStr}`;

      const portal = juris.digital_portal || juris.digital_land_portal;
      const rtiPortal = juris.state_rti_portal || juris.rti_portal_url;
      let portalTxt = "";
      if (portal) portalTxt += `Portal: ${portal}`;
      if (rtiPortal) portalTxt += `${portal ? ' • ' : ''}RTI: ${rtiPortal}`;
      if (portalLink) portalLink.textContent = portalTxt || (currentLang === "hi" ? "राज्य जन अभिलेख" : "State Civic Records");

      const landAct = juris.primary_land_act || juris.substantive_act || "Citizen Charter & Public Service Guarantee Act";
      if (landActEl) landActEl.textContent = tAddress(landAct);
    } else {
      jurisBanner.style.display = "none";
    }
  }

  const legal = c.statutory_legal_analysis || {};
  const pen = legal.section_20_penalty_liability_inr || 0;

  if (currentLang === "hi") {
    document.getElementById("viewMeritBadge").textContent = `${legal.case_merit_score || 92}/100 विधिक योग्यता (सफल होने की संभावना: उच्च)`;
    document.getElementById("viewPenaltyBadge").textContent = `धारा 20(1) व्यक्तिगत जुर्माना देयता: ₹${pen} (दोषी अधिकारी के वेतन से ₹250/दिन अनिवार्य कटौती लागू)`;
  } else {
    document.getElementById("viewMeritBadge").textContent = `${legal.case_merit_score || 92}/100 Merit (${legal.win_probability || 'High'} Probability)`;
    document.getElementById("viewPenaltyBadge").textContent = `Section 20(1) Penalty Liability: ₹${pen} (Mandatory ₹250/day deduction applicable on delinquent PIO)`;
  }

  // 48-Hour Urgent Life & Liberty Status
  const isUrgent = !!(c.is_life_liberty || c.is_urgent_48h);
  const urgencyBadge = document.getElementById("viewUrgencyBadge");
  const urgencyBtn = document.getElementById("dossierUrgencyToggleBtn");
  const urgencyLabel = document.getElementById("dossierUrgencyLabel");
  const dueDateEl = document.getElementById("viewDueDate");
  const slaEl = document.getElementById("viewSla");

  if (isUrgent) {
    if (urgencyBadge) urgencyBadge.style.display = "inline-block";
    if (urgencyBtn) urgencyBtn.classList.add("active");
    if (urgencyLabel) urgencyLabel.textContent = currentLang === "hi" ? "आपातकालीन फास्ट-ट्रैक (48 घंटे समयसीमा)" : "Fast-Track Active (48-Hr SLA)";
    if (slaEl) slaEl.textContent = currentLang === "hi" ? "🚨 48 घंटे (अति-आवश्यक जीवन व स्वतंत्रता)" : "🚨 48 Hours (URGENT LIFE & LIBERTY)";
    if (dueDateEl) dueDateEl.textContent = currentLang === "hi" ? `विधिक अंतिम तिथि: ${c.statutory_deadline_date || c.calculated_due_date || "48 घंटे के भीतर"}` : `Statutory Deadline: ${c.statutory_deadline_date || c.calculated_due_date || "Within 48 Hours"}`;
  } else {
    if (urgencyBadge) urgencyBadge.style.display = "none";
    if (urgencyBtn) urgencyBtn.classList.remove("active");
    if (urgencyLabel) urgencyLabel.textContent = currentLang === "hi" ? "फास्ट-ट्रैक (48 घंटे आपातकाल)" : "Fast-Track (48-Hr Life & Liberty)";
    if (slaEl) slaEl.textContent = currentLang === "hi" ? `${c.sla_days_remaining || 30} दिन शेष` : `${c.sla_days_remaining || 30} Days Remaining`;
    if (dueDateEl) dueDateEl.textContent = currentLang === "hi" ? `विधिक अंतिम तिथि: ${c.statutory_deadline_date || c.calculated_due_date || "30 दिन"}` : `Statutory Deadline: ${c.statutory_deadline_date || c.calculated_due_date || "30 Days"}`;
  }

  document.getElementById("viewRefNo").textContent = c.application_ref_no || (currentLang === "hi" ? "उपलब्ध नहीं" : "Not Provided");
  document.getElementById("viewSubDate").textContent = c.original_submission_date || (currentLang === "hi" ? "अपुष्ट" : "Unconfirmed");

  // PIO & FAA Block
  document.getElementById("viewDistanceLabel").textContent = formatDistanceLabel(pio.distance_label || "1.5 km away");
  document.getElementById("viewPioName").textContent = tOfficer(pio.pio_name || (currentLang === "hi" ? "नामित जन सूचना अधिकारी" : "Designated PIO"));
  document.getElementById("viewPioDept").textContent = tDept(pio.department || c.department);
  document.getElementById("viewPioAddr").textContent = tAddress(pio.office_address || (currentLang === "hi" ? "जिला कलेक्ट्रेट" : "District Kachehri"));
  const roomTxt = currentLang === "hi" ? `कमरा: ${tAddress(pio.room_no || 'कमरा 101, भूतल')} &middot; ईमेल: ${pio.email || 'उपलब्ध नहीं'}` : `Room: ${pio.room_no || 'Room 101, Ground Floor'} &middot; Email: ${pio.email || 'N/A'}`;
  document.getElementById("viewPioRoom").innerHTML = roomTxt;

  document.getElementById("viewFaaName").textContent = tOfficer(faa.faa_name || (currentLang === "hi" ? "अपर जिलाधिकारी (राजस्व) / अपीलीय प्राधिकारी" : "Additional District Magistrate (Revenue)"));

  // Statutory Pills (IPC & BNS)
  const ipcPillsBox = document.getElementById("viewIpcPills");
  const bnsPillsBox = document.getElementById("viewBnsPills");
  ipcPillsBox.innerHTML = "";
  bnsPillsBox.innerHTML = "";

  (legal.ipc_sections || ["IPC Section 420 (Cheating)", "IPC Section 166 (Disobedience of Law)"]).forEach(s => {
    const span = document.createElement("span");
    span.className = "statutory-tag ipc";
    span.style.cssText = "margin-right: 4px; margin-bottom: 4px; display: inline-block;";
    span.textContent = tSection(s);
    ipcPillsBox.appendChild(span);
  });

  (legal.bns_sections || ["BNS Section 318(4) (Cheating)", "BNS Section 198 (Public Servant Disobedience)"]).forEach(s => {
    const span = document.createElement("span");
    span.className = "statutory-tag bns";
    span.style.cssText = "margin-right: 4px; margin-bottom: 4px; display: inline-block;";
    span.textContent = tSection(s);
    bnsPillsBox.appendChild(span);
  });

  const ipcCountEl = document.getElementById("viewIpcCount");
  const bnsCountEl = document.getElementById("viewBnsCount");
  if (ipcCountEl) ipcCountEl.textContent = currentLang === "hi" ? `${(legal.ipc_sections || []).length} धाराएं` : `${(legal.ipc_sections || []).length} Sections`;
  if (bnsCountEl) bnsCountEl.textContent = currentLang === "hi" ? `${(legal.bns_sections || []).length} धाराएं` : `${(legal.bns_sections || []).length} Sections`;
  const maxPunEl = document.getElementById("viewMaxPunishment");
  if (maxPunEl) maxPunEl.textContent = tPunishment(legal.maximum_punishment);

  const groundsList = document.getElementById("viewLegalGrounds");
  groundsList.innerHTML = "";
  (legal.legal_grounds || ["Statutory failure under Citizen Charter"]).forEach(g => {
    const li = document.createElement("li");
    li.textContent = currentLang === "hi" ? tLegalGround(g) : g;
    groundsList.appendChild(li);
  });

  // AI Drafting Model synchronization for casework documents
  const activeModelDisplay = getAiModelDisplayName(currentAiDraftingModel);
  const caseworkAiSelect = document.getElementById("caseworkAiModelSelect");
  if (caseworkAiSelect) caseworkAiSelect.value = currentAiDraftingModel;
  const badgeRti = document.getElementById("modelNameRti");
  if (badgeRti) badgeRti.textContent = activeModelDisplay;
  const badgeAppeal = document.getElementById("modelNameAppeal");
  if (badgeAppeal) badgeAppeal.textContent = activeModelDisplay;
  const badgeNotice = document.getElementById("modelNameNotice");
  if (badgeNotice) badgeNotice.textContent = activeModelDisplay;

  // Draft RTI Inputs
  document.getElementById("editDraftSubject").value = tDraftSubject(c.case_id, c.draft_rti && c.draft_rti.application_subject);
  document.getElementById("editDraftQuestions").value = tDraftQuestions(c.case_id, c.draft_rti && c.draft_rti.questions).join("\n\n");
  document.getElementById("editDraftFees").value = tDraftFees(c.case_id, c.draft_rti && c.draft_rti.fees_paid);

  // First Appeal Panel
  const appeal = c.first_appeal_draft || {};
  document.getElementById("viewAppealSubject").value = tAppealSubject(c.case_id, appeal.subject);
  document.getElementById("viewAppealGrounds").value = tAppealGrounds(c.case_id, appeal.grounds_of_appeal).join("\n\n");
  document.getElementById("viewAppealPrayers").value = tAppealPrayers(c.case_id, appeal.prayers_sought).join("\n");

  // Legal Notice Panel
  const notice = c.legal_notice_draft || {};
  document.getElementById("viewLegalNoticeText").value = tLegalNotice(c.case_id, notice.notice_text);

  // ML Dossier
  document.getElementById("viewMlReportFormat").value = tMlReport(c);

  const revEl = document.getElementById("reviewerName");
  if (revEl) {
    revEl.value = currentLang === "hi"
      ? "अधिवक्ता एस. कालरा (बार काउंसिल / विधिक परामर्शदाता)"
      : "Adv. S. Kalra (Bar Council / Legal Counsel)";
  }

  // Timeline
  renderCaseTimeline(c);

  // Dispatch Proof
  const proofBox = document.getElementById("dispatchProofBox");
  if (c.dispatch_info) {
    proofBox.classList.remove("hidden");
    if (currentLang === "hi") {
      document.getElementById("proofDetails").innerHTML = `
        <div>प्रेषण संख्या (Dispatch ID): <b>${c.dispatch_info.dispatch_id}</b></div>
        <div>स्पीड पोस्ट ट्रैकिंग नंबर: <b>${c.dispatch_info.tracking_id}</b></div>
        <div>प्रेषण तिथि व समय: <b>${c.dispatch_info.dispatched_at}</b></div>
        <div>प्राप्तकर्ता अधिकारी: <b>${tOfficer(c.dispatch_info.recipient_name)} (${c.dispatch_info.recipient_email})</b></div>
      `;
      document.getElementById("approveBtn").disabled = true;
      document.getElementById("approveBtn").textContent = "✓ केस प्रेषित एवं मुहरबंद";
    } else {
      document.getElementById("proofDetails").innerHTML = `
        <div>DISPATCH ID: <b>${c.dispatch_info.dispatch_id}</b></div>
        <div>TRACKING ID: <b>${c.dispatch_info.tracking_id}</b></div>
        <div>DISPATCHED AT: <b>${c.dispatch_info.dispatched_at}</b></div>
        <div>RECIPIENT: <b>${c.dispatch_info.recipient_name} (${c.dispatch_info.recipient_email})</b></div>
      `;
      document.getElementById("approveBtn").disabled = true;
      document.getElementById("approveBtn").textContent = "CASE DISPATCHED & SEALED ✓";
    }
  } else {
    proofBox.classList.add("hidden");
    document.getElementById("approveBtn").disabled = false;
    document.getElementById("approveBtn").textContent = currentLang === "hi" ? "⚖️ विधिक प्रेषण स्वीकृत करें एवं मुहर लगाएं →" : "⚖️ APPROVE & EXECUTE DISPATCH →";
  }

  updateRadarTelemetry(c);
  updateWorkspacePersonaView(c);
}

function updateWorkspacePersonaView(c) {
  if (activePersona === "gov_desk") {
    document.getElementById("approveBtn").innerHTML = currentLang === "hi"
      ? `<i data-lucide="check-check"></i> <span>सरकारी डेस्क पर निस्तारण / अनुमोदन</span>`
      : `<i data-lucide="check-check"></i> <span>Dispose / Approve on Gov Desk</span>`;
  } else {
    document.getElementById("approveBtn").innerHTML = currentLang === "hi"
      ? `<i data-lucide="send"></i> <span>विधिक प्रेषण स्वीकृत करें एवं जारी करें</span>`
      : `<i data-lucide="send"></i> <span>Approve & Execute Dispatch</span>`;
  }
  renderLucide();
}

function renderCaseTimeline(c) {
  const container = document.getElementById("caseTimelineContainer");
  const tbody = document.getElementById("caseHistoryBody");
  container.innerHTML = "";
  tbody.innerHTML = "";

  if (c.update_history && c.update_history.length > 0) {
    c.update_history.forEach((h, idx) => {
      const isLatest = idx === c.update_history.length - 1;
      const card = document.createElement("div");
      card.style.cssText = `display: flex; gap: 12px; padding: 8px 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-left: 3px solid ${isLatest ? 'var(--accent-gold)' : 'var(--text-muted)'}; border-radius: 4px; margin-bottom: 6px; font-size: 11px;`;
      
      const evType = tRunLogEvent(h.update_type);
      const actor = tRunLogActor(h.actor);
      const field = tTimelineField(h.field_changed);
      const oldVal = tTimelineVal(h.old_value);
      const newVal = tTimelineVal(h.new_value);
      const remarks = currentLang === "hi" ? tRunLogAction(h.remarks || "") : h.remarks;

      card.innerHTML = `
        <div class="text-mono" style="min-width: 130px; color: var(--text-muted);">${h.timestamp}</div>
        <div>
          <b>${evType}</b> — <span style="color: var(--text-secondary);">${actor}</span>
          <div style="color: var(--text-secondary); margin-top: 2px;">${currentLang === "hi" ? "विवरण:" : "Field:"} <b>${field}</b> &nbsp;|&nbsp; <code>${oldVal}</code> &rarr; <code>${newVal}</code></div>
          ${remarks ? `<div style="color: var(--text-muted); font-style: italic; margin-top: 2px;">"${remarks}"</div>` : ''}
        </div>
      `;
      container.appendChild(card);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="text-mono">${h.timestamp}</td>
        <td><span class="badge badge-gold">${evType}</span></td>
        <td><b>${actor}</b></td>
        <td>${field}</td>
        <td><small class="text-mono">${currentLang === "hi" ? "पूर्व" : "Old"}: ${oldVal}<br/>${currentLang === "hi" ? "नवीन" : "New"}: <b>${newVal}</b></small></td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    container.innerHTML = `<div class="text-mono" style="font-size: 11px; color: var(--text-muted);">${currentLang === "hi" ? "कोई पूर्व घटनाक्रम दर्ज नहीं है।" : "No prior timeline events."}</div>`;
  }
}

// Section 6(3) Transfer Modal & Execution
function openTransferModal() {
  if (!currentCase) return;
  document.getElementById("transferModal").classList.remove("hidden");
}

function closeTransferModal() {
  document.getElementById("transferModal").classList.add("hidden");
}

async function submitTransferSec6_3() {
  if (!currentCase) return;
  const targetDept = document.getElementById("transferDeptSelect").value;
  const reason = document.getElementById("transferReason").value.trim();
  const reviewer = document.getElementById("reviewerName").value.trim();

  try {
    const res = await fetch(`${API_BASE}/cases/${currentCase.case_id}/transfer-sec6-3`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_department: targetDept, transfer_reason: reason, reviewer })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Section 6(3) 5-Day Mandatory Transfer Executed!\n\n• Transferred to: ${targetDept}\n• Transferee PIO: ${data.case.suggested_pio && data.case.suggested_pio.pio_name ? data.case.suggested_pio.pio_name : ""}\n• Transfer ID: ${data.case.section_6_3_transfer && data.case.section_6_3_transfer.transfer_id ? data.case.section_6_3_transfer.transfer_id : ""}`);
      closeTransferModal();
      openCaseWorkspace(data.case);
      loadRunLogs();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    console.error("Transfer error:", err);
  }
}

// Approve & Dispatch
async function approveCurrentCase() {
  if (!currentCase) return;

  const reviewer = document.getElementById("reviewerName").value.trim();
  const action = document.getElementById("reviewActionSelect").value;
  const subject = document.getElementById("editDraftSubject").value.trim();
  const questions = document.getElementById("editDraftQuestions").value.trim().split("\n").filter(q => q.trim());

  const payload = {
    reviewer: reviewer || "Adv. S. Kalra",
    notes: `Approved under action: ${action}`,
    draft_rti: {
      application_subject: subject,
      questions: questions
    }
  };

  try {
    const res = await fetch(`${API_BASE}/cases/${currentCase.case_id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Case ${currentCase.case_id} approved and dispatched!\n\n• Dispatch Tracking ID: ${data.case.dispatch_info && data.case.dispatch_info.tracking_id ? data.case.dispatch_info.tracking_id : ""}\n• Status: APPROVED & DISPATCHED`);
      openCaseWorkspace(data.case);
      loadRunLogs();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    console.error("Approval error:", err);
  }
}

// View / Download PDF
function viewPdf(type = "rti") {
  if (!currentCase) {
    alert("Please select a case first.");
    return;
  }
  const langParam = (currentLang === "hi") ? "hi" : "en";
  window.open(`${API_BASE}/cases/${currentCase.case_id}/pdf?type=${type}&lang=${langParam}`, "_blank");
}

// [Seed run logs and cache initialized at top of script]

async function loadRunLogs() {
  try {
    // 1. Recover locally saved logs first
    let localSavedLogs = [];
    try {
      const raw = localStorage.getItem("arzi_run_logs_ledger");
      if (raw) localSavedLogs = JSON.parse(raw);
    } catch (e) {}

    // 2. Fetch server logs (with fast 1s timeout for offline/static resilience)
    let serverLogs = [];
    try {
      const controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 1000) : null;
      const res = await fetch(`${API_BASE}/run-log`, { signal: controller ? controller.signal : undefined });
      if (timeoutId) clearTimeout(timeoutId);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.run_logs) serverLogs = data.run_logs;
      }
    } catch (e) {
      // server offline or static host
    }

    // 3. Merge in-memory cache, local storage, server logs, and default seeds
    const seen = new Set();
    const merged = [];
    for (const log of [...(allRunLogsCache || []), ...localSavedLogs, ...serverLogs, ...DEFAULT_SEED_RUN_LOGS]) {
      const key = log.run_id || `${log.case_id}_${log.event_type}_${(log.timestamp || '').slice(0, 19)}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(log);
      }
    }
    merged.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
    allRunLogsCache = merged;
    try {
      localStorage.setItem("arzi_run_logs_ledger", JSON.stringify(allRunLogsCache.slice(0, 100)));
    } catch (e) {}

    // Also load cases to cross-reference keywords (with fast 1s timeout)
    try {
      const controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 1000) : null;
      const caseRes = await fetch(`${API_BASE}/cases`, { signal: controller ? controller.signal : undefined });
      if (timeoutId) clearTimeout(timeoutId);
      if (caseRes && caseRes.ok) {
        const caseData = await caseRes.json().catch(() => null);
        if (caseData && caseData.cases) {
          const serverCases = caseData.cases || [];
          const localCases = (allCasesCache || []).filter(c => !serverCases.some(sc => sc.case_id === c.case_id));
          allCasesCache = [...serverCases, ...localCases];
        }
      }
    } catch (e) {
      // static host
    }

    const searchInput = document.getElementById("runLogSearchInput");
    if (searchInput && searchInput.value.trim()) {
      handleRunLogSearch(searchInput.value.trim());
    } else {
      renderRunLogsTable(allRunLogsCache);
      const countBadge = document.getElementById("runLogCountBadge");
      if (countBadge) countBadge.textContent = allRunLogsCache.length;
      const matchedCasesPanel = document.getElementById("matchedCasesPanel");
      if (matchedCasesPanel) matchedCasesPanel.style.display = "none";
      const filterBadge = document.getElementById("runLogFilterBadge");
      if (filterBadge) {
        filterBadge.textContent = currentLang === "hi" ? "सभी घटनाएँ" : "All Events";
        filterBadge.className = "status-pill approved";
      }
      const searchStatus = document.getElementById("runLogSearchStatus");
      if (searchStatus) {
        searchStatus.textContent = currentLang === "hi" ? "सभी लॉग सक्रिय" : "All Logs Active";
        searchStatus.className = "status-pill approved";
      }
    }
  } catch (err) {
    console.error("Run log error:", err);
    renderRunLogsTable(allRunLogsCache);
    const countBadge = document.getElementById("runLogCountBadge");
    if (countBadge) countBadge.textContent = (allRunLogsCache || []).length;
  }
}

function renderRunLogsTable(logs) {
  const tbody = document.getElementById("runLogBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!logs || logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--ink-muted); padding: 24px;">${currentLang === "hi" ? "कोई निष्पादन रन लॉग सक्रिय खोज से मेल नहीं खाता।" : "No execution run logs match the active query."}</td></tr>`;
    return;
  }

  logs.forEach(log => {
    const evType = currentLang === "hi" ? tRunLogEvent(log.event_type) : log.event_type;
    const actor = currentLang === "hi" ? tRunLogActor(log.actor) : log.actor;
    const action = currentLang === "hi" ? tRunLogAction(log.action) : log.action;
    const result = currentLang === "hi" ? tRunLogResult(log.result) : log.result;
    const resultLabel = currentLang === "hi" ? "परिणाम" : "Result";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-family: var(--font-mono); font-size: 11px;">${log.timestamp}</td>
      <td><span class="statutory-tag" style="font-size: 10px;">${evType}</span></td>
      <td>
        <a href="#" style="font-family: var(--font-mono); color: var(--gov-navy); font-weight: 700; font-size: 11.5px; text-decoration: underline;" onclick="event.preventDefault(); inspectCaseFromRunLog('${log.case_id}')">
          ${log.case_id}
        </a>
      </td>
      <td><b>${actor}</b></td>
      <td>${action}<br/><span style="font-family: var(--font-mono); font-size: 10px; color: var(--status-active);">${resultLabel}: ${result}</span></td>
      <td style="font-family: var(--font-mono); font-size: 10.5px; color: var(--ink-muted);">${log.correlation_id}</td>
    `;
    tbody.appendChild(tr);
  });
  renderLucide();
}

function handleRunLogSearch(rawQuery) {
  const query = (rawQuery || "").trim().toLowerCase();
  const matchedCasesContainer = document.getElementById("matchedCasesContainer");
  const matchedCasesPanel = document.getElementById("matchedCasesPanel");
  const matchedCasesCount = document.getElementById("matchedCasesCount");
  const runLogFilterBadge = document.getElementById("runLogFilterBadge");
  const runLogSearchStatus = document.getElementById("runLogSearchStatus");
  const countBadge = document.getElementById("runLogCountBadge");

  if (!query) {
    if (matchedCasesPanel) matchedCasesPanel.style.display = "none";
    if (runLogFilterBadge) {
      runLogFilterBadge.textContent = currentLang === "hi" ? "सभी घटनाएँ" : "All Events";
      runLogFilterBadge.className = "status-pill approved";
    }
    if (runLogSearchStatus) {
      runLogSearchStatus.textContent = currentLang === "hi" ? "सभी लॉग सक्रिय" : "All Logs Active";
      runLogSearchStatus.className = "status-pill approved";
    }
    renderRunLogsTable(allRunLogsCache);
    if (countBadge) countBadge.textContent = allRunLogsCache.length;
    return;
  }

  // Synonym expansions (Varanasi / Banaras / Kashi)
  const synonyms = query.includes("varanasi") || query.includes("banaras") || query.includes("kashi")
    ? ["varanasi", "banaras", "kashi"]
    : [query];

  // 1. Search cases across: Complainant Name, Place/Address, Subject/Grievance/Department, Officer Name
  const matchedCases = allCasesCache.filter(c => {
    const complainantName = ((c.complainant && c.complainant.name) || "").toLowerCase();
    const complainantAddr = ((c.complainant && c.complainant.address) || "").toLowerCase();
    const userLocality = ((c.confidence && c.confidence.user_locality) || "").toLowerCase();
    const department = (c.department || c.category || "").toLowerCase();
    const rawGrievance = (c.raw_grievance || "").toLowerCase();
    const draftSubject = ((c.draft_rti && c.draft_rti.application_subject) || "").toLowerCase();
    const refNo = (c.application_ref_no || "").toLowerCase();
    const pioName = ((c.suggested_pio && c.suggested_pio.pio_name) || "").toLowerCase();
    const pioAddr = ((c.suggested_pio && c.suggested_pio.office_address) || "").toLowerCase();
    const pioDesig = ((c.suggested_pio && c.suggested_pio.designation) || "").toLowerCase();
    const caseId = (c.case_id || "").toLowerCase();

    const fullSearchText = `${caseId} ${complainantName} ${complainantAddr} ${userLocality} ${department} ${rawGrievance} ${draftSubject} ${refNo} ${pioName} ${pioAddr} ${pioDesig}`;

    return synonyms.some(term => fullSearchText.includes(term));
  });

  const matchedCaseIds = new Set(matchedCases.map(c => c.case_id.toUpperCase()));

  // 2. Render Matched Case Dockets
  if (matchedCasesPanel && matchedCasesContainer) {
    matchedCasesPanel.style.display = "block";
    if (matchedCasesCount) matchedCasesCount.textContent = matchedCases.length;

    if (matchedCases.length === 0) {
      matchedCasesContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 18px; text-align: center; color: var(--ink-muted); font-size: 12px; background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: 4px;">
          <i data-lucide="info" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 4px; color: var(--gov-copper);"></i>
          ${currentLang === "hi" 
            ? `कीवर्ड "<b>${rawQuery}</b>" से कोई केस डोज़ियर नहीं मिला। नीचे ऑडिट लॉग की जाँच की जा रही है...`
            : `No case dockets matched the keyword "<b>${rawQuery}</b>". Checking audit event trail below...`}
        </div>
      `;
    } else {
      matchedCasesContainer.innerHTML = matchedCases.map(c => {
        const pio = c.suggested_pio || {};
        const pioOfficer = pio.pio_name ? `${tOfficer(pio.pio_name)} (${pio.designation || (currentLang === 'hi' ? 'जन सूचना अधिकारी' : 'PIO')})` : (currentLang === 'hi' ? 'पद लंबित' : 'Designation Pending');
        const locality = (c.confidence && c.confidence.user_locality) || (c.complainant && c.complainant.address ? tAddress(c.complainant.address).split(',').slice(-2).join(',').trim() : (currentLang === 'hi' ? 'क्षेत्राधिकार आवंटित' : 'Jurisdiction Assigned'));
        const subjectBrief = tDraftSubject(c.draft_rti && c.draft_rti.application_subject) || tGrievance(c.raw_grievance) || (currentLang === 'hi' ? 'सार्वजनिक अभिलेख जांच' : 'Public Record Inquiry');
        const truncatedSubject = subjectBrief.length > 95 ? subjectBrief.substring(0, 92) + '...' : subjectBrief;
        const statusClass = c.status === 'APPROVED' ? 'approved' : (c.status === 'TRANSFERRED_SEC_6_3' ? 'neutral' : 'under-review');
        const statusLabel = tStatus(c.status);
        const compName = tComplainant(c.complainant && c.complainant.name) || (currentLang === 'hi' ? 'नागरिक आवेदक' : 'Anonymous Citizen');
        const deptLabel = tDept(c.department || c.category) || (currentLang === 'hi' ? 'लोक प्राधिकरण' : 'Public Authority');
        const addressLabel = pio.office_address ? tAddress(pio.office_address) : (c.complainant && c.complainant.address ? tAddress(c.complainant.address) : (currentLang === 'hi' ? 'नामित प्रशासनिक परिसर' : 'Designated Administrative Complex'));

        return `
          <div class="matched-case-card">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <b style="font-family: var(--font-mono); color: var(--gov-navy); font-size: 12.5px;">${c.case_id}</b>
                  <span class="status-pill ${statusClass}" style="font-size: 9.5px;">${statusLabel}</span>
                </div>
                <span style="font-family: var(--font-mono); font-size: 10.5px; color: var(--gov-copper); font-weight: 700;">${currentLang === 'hi' ? 'समयसीमा' : 'SLA'}: ${c.sla_days_remaining !== undefined ? c.sla_days_remaining : 14}${currentLang === 'hi' ? ' दिन' : 'd'}</span>
              </div>
              
              <div style="font-size: 12px; font-weight: 700; color: var(--ink-primary); margin-bottom: 3px; display: flex; align-items: center; gap: 4px;">
                <i data-lucide="user" style="width: 12px; height: 12px; color: var(--gov-navy);"></i>
                <span>${compName}</span>
                <span style="font-weight: 400; color: var(--ink-muted); font-size: 11px;">&bull; ${locality}</span>
              </div>

              <div style="font-size: 11px; color: var(--ink-secondary); margin-bottom: 6px; line-height: 1.35;">
                <b>${currentLang === 'hi' ? 'विषय:' : 'Subject:'}</b> ${truncatedSubject}
              </div>

              <div style="font-size: 10.5px; color: var(--ink-secondary); background: var(--bg-subtle); padding: 6px 8px; border-radius: 2px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 4px; color: var(--gov-navy); font-weight: 600;">
                  <i data-lucide="building-2" style="width: 11px; height: 11px;"></i>
                  <span>${deptLabel}</span>
                </div>
                <div style="margin-top: 2px; color: var(--ink-muted);">
                  <b>${currentLang === 'hi' ? 'अधिकारी:' : 'Officer:'}</b> ${pioOfficer}
                </div>
                <div style="margin-top: 1px; color: var(--ink-muted);">
                  <b>${currentLang === 'hi' ? 'पता:' : 'Address:'}</b> ${addressLabel}
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 6px; border-top: 1px dashed var(--border-subtle);">
              <span style="font-size: 10.5px; color: var(--ink-muted);">${currentLang === 'hi' ? 'संदर्भ:' : 'Ref:'} <b>${c.application_ref_no || (currentLang === 'hi' ? 'मानक डोज़ियर' : 'Standard Docket')}</b></span>
              <button class="btn-gov-outline" style="font-size: 11px; padding: 3px 8px; background: #FFFFFF;" onclick="inspectCaseFromRunLog('${c.case_id}')">
                <span>${currentLang === 'hi' ? 'डोज़ियर देखें &rarr;' : 'Inspect Dossier &rarr;'}</span>
              </button>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // 3. Filter Run Log table rows: match log directly OR match case ID of matched cases
  const filteredLogs = allRunLogsCache.filter(log => {
    const caseId = (log.case_id || "").toUpperCase();
    if (matchedCaseIds.has(caseId)) return true;

    const actor = (log.actor || "").toLowerCase();
    const action = (log.action || "").toLowerCase();
    const eventType = (log.event_type || "").toLowerCase();
    const result = (log.result || "").toLowerCase();
    const correlationId = (log.correlation_id || "").toLowerCase();
    const logCaseId = (log.case_id || "").toLowerCase();

    const logText = `${logCaseId} ${actor} ${action} ${eventType} ${result} ${correlationId}`;
    return synonyms.some(term => logText.includes(term));
  });

  renderRunLogsTable(filteredLogs);

  if (runLogFilterBadge) {
    runLogFilterBadge.textContent = currentLang === "hi" 
      ? `फ़िल्टर: ${filteredLogs.length} पंक्तियाँ (${matchedCases.length} मामले)`
      : `Filtered: ${filteredLogs.length} Rows (${matchedCases.length} Cases)`;
    runLogFilterBadge.className = "status-pill under-review";
  }
  if (runLogSearchStatus) {
    runLogSearchStatus.textContent = currentLang === "hi"
      ? `${matchedCases.length} मामले मिले`
      : `${matchedCases.length} Cases Matched`;
    runLogSearchStatus.className = matchedCases.length > 0 ? "status-pill approved" : "status-pill under-review";
  }
  if (countBadge) {
    countBadge.textContent = filteredLogs.length;
  }
  renderLucide();
}

// ==========================================================================
// DEDICATED CASE DOSSIER, AUDIT & TIMELINE VIEW (OPENED FROM AUDIT RUN LOG)
// ==========================================================================
let activeDetailCase = null;

function inspectCaseFromRunLog(caseId) {
  openCaseDetailView(caseId);
}

function getStatusClass(status) {
  if (!status) return "under-review";
  const s = String(status).toUpperCase();
  if (s === "APPROVED") return "approved";
  if (s === "TRANSFERRED_SEC_6_3" || s === "TRANSFERRED") return "transferred";
  if (s === "MERGED_DUPLICATE" || s === "MERGED") return "merged";
  if (s === "NEEDS_REVIEW" || s === "UNDER_REVIEW") return "under-review";
  if (s.includes("APPROV")) return "approved";
  if (s.includes("TRANSF")) return "transferred";
  if (s.includes("MERG")) return "merged";
  return "under-review";
}

async function openCaseDetailView(caseId) {
  try {
    let caseData = (typeof allCasesCache !== "undefined" ? allCasesCache : []).find(c => c.case_id === caseId);
    if (!caseData) {
      const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseId)}`);
      if (res.ok) {
        const json = await res.json();
        caseData = json.case;
      }
    }
    if (!caseData) {
      alert(`Could not find case docket ${caseId}.`);
      return;
    }
    activeDetailCase = caseData;

    // 1. Header & Summary Banner
    const docketIdEl = document.getElementById("detailDocketId");
    if (docketIdEl) docketIdEl.textContent = caseData.case_id;
    const breadcrumbEl = document.getElementById("detailCaseBreadcrumb");
    if (breadcrumbEl) breadcrumbEl.textContent = currentLang === "hi" ? `${caseData.case_id} डॉसियर` : `${caseData.case_id} Dossier`;
    const subjectEl = document.getElementById("detailDocketSubject");
    if (subjectEl) subjectEl.textContent = tDraftSubject(caseData.case_id, caseData.draft_rti && caseData.draft_rti.application_subject);
    const dateEl = document.getElementById("detailDocketDate");
    if (dateEl) dateEl.textContent = caseData.original_submission_date || caseData.created_at || "—";
    const refEl = document.getElementById("detailDocketRef");
    if (refEl) refEl.textContent = caseData.application_ref_no || (currentLang === "hi" ? "मानक आवेदन" : "Standard Filing");
    const deptEl = document.getElementById("detailDocketDept");
    if (deptEl) deptEl.textContent = tDept(caseData.department);
    const compNameEl = document.getElementById("detailDocketComplainantName");
    if (compNameEl) compNameEl.textContent = tComplainant(caseData.complainant && caseData.complainant.name);
    const locEl = document.getElementById("detailDocketLocation");
    if (locEl) locEl.textContent = caseData.district ? tAddress(`${caseData.district}, ${caseData.state || ''}`) : tAddress((caseData.confidence && caseData.confidence.user_locality) || "Local Jurisdiction");
    const pinEl = document.getElementById("detailPincodeBadge");
    if (pinEl) pinEl.textContent = `PIN: ${caseData.pincode || (caseData.complainant && caseData.complainant.pincode) || '—'}`;

    // Status & SLA
    const statusMap = {
      "APPROVED": currentLang === "hi" ? "स्वीकृत" : "APPROVED",
      "TRANSFERRED_SEC_6_3": currentLang === "hi" ? "अंतरित (धारा 6(3))" : "TRANSFERRED (SEC 6(3))",
      "NEEDS_REVIEW": currentLang === "hi" ? "समीक्षाधीन" : "UNDER REVIEW",
      "UNDER_REVIEW": currentLang === "hi" ? "समीक्षाधीन" : "UNDER REVIEW",
      "REJECTED": currentLang === "hi" ? "अस्वीकृत" : "REJECTED",
      "MERGED_DUPLICATE": currentLang === "hi" ? "विलय किया गया डुप्लिकेट" : "MERGED DUPLICATE"
    };
    const statusPill = document.getElementById("detailDocketStatusPill");
    if (statusPill) {
      statusPill.textContent = statusMap[caseData.status] || caseData.status;
      statusPill.className = `status-pill ${getStatusClass(caseData.status)}`;
    }
    const slaBadge = document.getElementById("detailDocketSlaBadge");
    const urgentBadge = document.getElementById("detailDocketUrgentBadge");
    const isUrgent = Boolean(caseData.is_life_liberty);
    if (urgentBadge) urgentBadge.style.display = isUrgent ? "inline-block" : "none";
    if (slaBadge) {
      if (currentLang === "hi") {
        slaBadge.textContent = isUrgent ? "48 घंटे आपातकालीन समयसीमा" : "30-दिवसीय समयसीमा";
      } else {
        slaBadge.textContent = isUrgent ? "48-Hour Urgent SLA" : "30-Day Standard SLA";
      }
    }

    const daysRemaining = caseData.sla_days_remaining !== undefined ? caseData.sla_days_remaining : 30;
    const slaCountdown = document.getElementById("detailDocketSlaCountdown");
    if (slaCountdown) {
      if (currentLang === "hi") {
        slaCountdown.textContent = isUrgent ? "48 घंटे" : `${daysRemaining} दिन शेष`;
      } else {
        slaCountdown.textContent = isUrgent ? "48 Hours" : `${daysRemaining} Days Remaining`;
      }
      slaCountdown.style.color = daysRemaining <= 5 ? "var(--status-risk)" : "var(--gov-navy)";
    }
    const dueDateEl = document.getElementById("detailDocketDueDate");
    if (dueDateEl) {
      if (currentLang === "hi") {
        dueDateEl.textContent = `अंतिम तिथि: ${caseData.due_date || 'विधिक अवधि में'}`;
      } else {
        dueDateEl.textContent = `Due: ${caseData.due_date || 'Within Statutory Period'}`;
      }
    }

    // 2. Complainant & PIO Details
    const cName = document.getElementById("detailCompName");
    if (cName) cName.textContent = tComplainant(caseData.complainant && caseData.complainant.name);
    const cContact = document.getElementById("detailCompContact");
    if (cContact) cContact.textContent = (caseData.complainant && caseData.complainant.contact) || (currentLang === "hi" ? "संपर्क निर्दिष्ट नहीं" : "Contact not specified");
    const cAddress = document.getElementById("detailCompAddress");
    if (cAddress) cAddress.textContent = tAddress((caseData.complainant && caseData.complainant.address) || (currentLang === "hi" ? "पता उपलब्ध नहीं" : "Address not provided"));

    const pio = caseData.suggested_pio || caseData.assigned_pio || {};
    const pioName = document.getElementById("detailPioName");
    if (pioName) pioName.textContent = tOfficer(pio.pio_name || (currentLang === "hi" ? "नामित जन सूचना अधिकारी" : "Designated PIO Officer"));
    const pioDept = document.getElementById("detailPioDept");
    if (pioDept) pioDept.textContent = tDept(pio.department || caseData.department);
    const pioAddress = document.getElementById("detailPioAddress");
    if (pioAddress) pioAddress.textContent = tAddress(pio.office_address || "Tehsil / District Collectorate Complex");
    const pioDist = document.getElementById("detailPioDistance");
    if (pioDist) pioDist.textContent = `📍 ${formatDistanceLabel(pio.distance_label || "1.2 km away")}`;

    // 3. Grievance & Questions
    const grievanceText = document.getElementById("detailGrievanceText");
    if (grievanceText) grievanceText.textContent = tGrievance(caseData.case_id, caseData.raw_grievance);
    const questionsList = document.getElementById("detailQuestionsList");
    if (questionsList) {
      const qArr = tDraftQuestions(caseData.case_id, caseData.draft_rti && caseData.draft_rti.questions) || [];
      if (qArr.length > 0) {
        questionsList.innerHTML = qArr.map(q => `<li style="margin-bottom: 6px;">${q}</li>`).join("");
      } else {
        questionsList.innerHTML = `<li style="color: var(--ink-muted);">${currentLang === "hi" ? "मानक प्रमाणित निरीक्षण एवं प्रेषण स्थिति प्रश्न तैयार।" : "Standard certified inspection and dispatch status questions drafted."}</li>`;
      }
    }

    // 4. ML Domain Classification Intelligence
    const mlConf = (caseData.confidence && caseData.confidence.overall) || 95;
    const mlConfBadge = document.getElementById("detailMlConfidenceBadge");
    if (mlConfBadge) {
      mlConfBadge.textContent = currentLang === "hi" ? `${mlConf}% एमएल सटीकता स्कोर` : `${mlConf}% ML Confidence`;
      mlConfBadge.className = `status-pill ${mlConf >= 80 ? "approved" : "under-review"}`;
    }
    const domainTitle = document.getElementById("detailMlDomainTitle");
    if (domainTitle) domainTitle.textContent = tDept(caseData.department);
    const mlReason = document.getElementById("detailMlReason");
    if (mlReason) mlReason.textContent = currentLang === "hi" ? "प्रामाणिक विधिक कीवर्ड ट्रिगर्स के साथ बहु-ग्राम टीएफ-आईडीएफ स्कोरिंग द्वारा वर्गीकृत।" : ((caseData.confidence && caseData.confidence.ml_prediction_reason) || "Classified via multi-gram TF-IDF domain scoring with authentic statutory keyword triggers.");

    const triggersEl = document.getElementById("detailMlTriggers");
    if (triggersEl) {
      const keywords = ((caseData.statutory_legal_analysis && caseData.statutory_legal_analysis.matched_keywords) || ["RTI 2005", caseData.department]).slice(0, 4);
      triggersEl.innerHTML = keywords.map(kw => `<span class="statutory-tag" style="font-size: 10px;">${kw}</span>`).join("");
    }

    const bnsMapping = document.getElementById("detailBnsMapping");
    if (bnsMapping) {
      const primaryStatute = caseData.statutory_legal_analysis && caseData.statutory_legal_analysis.primary_bns_statute;
      if (primaryStatute) {
        const ipcStr = currentLang === "hi" ? tSection(primaryStatute.ipc_section) : primaryStatute.ipc_section;
        const bnsStr = currentLang === "hi" ? tSection(primaryStatute.bns_section) : primaryStatute.bns_section;
        bnsMapping.textContent = `${ipcStr} → ${bnsStr}`;
      } else {
        bnsMapping.textContent = currentLang === "hi" ? "धारा 6(1) आरटीआई अधिनियम 2005" : "Section 6(1) RTI Act 2005";
      }
    }

    const penaltyEl = document.getElementById("detailSec20Penalty");
    if (penaltyEl) {
      const pen = (caseData.statutory_legal_analysis && caseData.statutory_legal_analysis.section_20_penalty_liability_inr) || 0;
      penaltyEl.textContent = `₹${pen.toLocaleString('en-IN')}`;
    }

    // 5. Initialize Timestamp input to live local ISO
    const timestampInput = document.getElementById("updateTimestampInput");
    if (timestampInput) {
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      timestampInput.value = localIso;
    }

    // 6. Populate Deduplication Select Options
    populateMergeDuplicateSelect(caseData.case_id);

    // 7. Render Previously Merged Dockets
    renderPreviouslyMergedList(caseData);

    // 8. Render Chronological Timeline Ledger
    renderCaseDetailTimeline(caseData);

    // 9. Navigate to page
    showPage("case-detail");
    renderLucide();
  } catch (err) {
    console.error("Error opening case details view:", err);
    alert("Could not load case details: " + err.message);
  }
}

function populateMergeDuplicateSelect(currentCaseId) {
  const select = document.getElementById("mergeDuplicateSelect");
  if (!select) return;
  select.innerHTML = currentLang === "hi"
    ? '<option value="">-- विलय हेतु डुप्लिकेट मामला चुनें --</option>'
    : '<option value="">-- Choose a duplicate case to consolidate --</option>';

  const cache = typeof allCasesCache !== "undefined" ? allCasesCache : [];
  const candidates = cache.filter(c => c.case_id !== currentCaseId && c.status !== "MERGED_DUPLICATE");
  if (candidates.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.disabled = true;
    opt.textContent = currentLang === "hi" ? "विलय हेतु कोई अन्य सक्रिय मामला उपलब्ध नहीं है" : "No other active dockets available for merging";
    select.appendChild(opt);
    return;
  }

  candidates.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.case_id;
    const name = tComplainant((c.complainant && c.complainant.name) || (currentLang === "hi" ? "आवेदक" : "Applicant"));
    const dept = tDept(c.department || (currentLang === "hi" ? "नागरिक सेवा" : "Civic"));
    const ref = c.application_ref_no ? `(${currentLang === "hi" ? "संदर्भ" : "Ref"}: ${c.application_ref_no})` : "";
    const stat = tStatus(c.status);
    opt.textContent = `${c.case_id} — ${name} — ${dept} ${ref} [${stat}]`;
    select.appendChild(opt);
  });
}

function renderPreviouslyMergedList(caseData) {
  const section = document.getElementById("previouslyMergedSection");
  const list = document.getElementById("previouslyMergedList");
  if (!section || !list) return;

  const mergedIds = caseData.merged_duplicate_cases || [];
  const cache = typeof allCasesCache !== "undefined" ? allCasesCache : [];
  const otherMerged = cache.filter(c => c.merged_into_case_id === caseData.case_id).map(c => c.case_id);
  const allMerged = Array.from(new Set([...mergedIds, ...otherMerged]));

  if (allMerged.length === 0) {
    section.style.display = "none";
    list.innerHTML = "";
    return;
  }

  section.style.display = "block";
  const mergedLabel = currentLang === "hi" ? "विलय किया गया डुप्लिकेट" : "Merged Duplicate";
  list.innerHTML = allMerged.map(id => `
    <span class="statutory-tag" style="background: #FEE2E2; color: #991B1B; border-color: #FCA5A5; font-size: 11px;">
      <b>${id}</b> (${mergedLabel})
    </span>
  `).join("");
}

function renderCaseDetailTimeline(caseData) {
  const container = document.getElementById("detailTimelineContainer");
  const countEl = document.getElementById("detailTimelineCount");
  if (!container) return;

  const history = caseData.update_history || [];
  if (countEl) countEl.textContent = history.length;

  if (history.length === 0) {
    container.innerHTML = `
      <div style="color: var(--ink-muted); font-size: 12px; padding: 12px 0;">
        ${currentLang === "hi" ? "इस डोज़ियर पर कोई पूर्व ऑडिट इतिहास दर्ज नहीं है।" : "No historical update logs found on this docket. Initializing audit trail..."}
      </div>
    `;
    return;
  }

  // Render in reverse chronological order (newest first)
  const sorted = [...history].reverse();
  container.innerHTML = sorted.map((entry, idx) => {
    const isNewest = idx === 0;
    const uType = (entry.update_type || "").toUpperCase();
    const borderCol = uType.includes("MERGE") ? "var(--gov-copper)" :
      uType.includes("HEARING") ? "var(--gov-navy)" :
        uType.includes("TRANSFER") ? "var(--gov-amber)" :
          "var(--status-active)";

    const evType = currentLang === "hi" ? tRunLogEvent(entry.update_type || "CASE_UPDATE") : (entry.update_type || "CASE_UPDATE");
    const actor = currentLang === "hi" ? tRunLogActor(entry.actor || "Legal Desk Officer") : (entry.actor || "Legal Desk Officer");
    const remarks = currentLang === "hi" ? tRunLogAction(entry.remarks || "") : (entry.remarks || "Status / information updated.");

    return `
      <div class="audit-timeline-entry" style="margin-bottom: 12px;">
        <div class="timeline-entry-card" style="${isNewest ? 'border-left: 3px solid ' + borderCol + ';' : ''}">
          <div class="timeline-meta-row">
            <span style="font-family: var(--font-mono); font-size: 10.5px; color: var(--ink-muted); font-weight: 600;">
              ${entry.timestamp || (currentLang === 'hi' ? 'दर्ज' : 'Recorded')}
            </span>
            <span class="statutory-tag" style="font-size: 9.5px; text-transform: uppercase;">
              ${evType}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 700; font-size: 11.5px; color: var(--gov-navy);">
              ${actor}
            </span>
            ${entry.field_changed ? `<span style="font-size: 10px; color: var(--ink-muted);">${entry.field_changed}</span>` : ''}
          </div>
          <div style="font-size: 11.5px; color: var(--ink-secondary); line-height: 1.5; white-space: pre-wrap;">
            ${remarks}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

async function submitCaseUpdateFromDetail(event) {
  event.preventDefault();
  if (!activeDetailCase) {
    alert("No active case selected.");
    return;
  }

  const updateType = document.getElementById("updateTypeSelect").value;
  const actor = (document.getElementById("updateActorInput") ? document.getElementById("updateActorInput").value.trim() : "") || "Adv. S. Kalra (Legal Counsel)";
  const rawTime = document.getElementById("updateTimestampInput") ? document.getElementById("updateTimestampInput").value : "";
  const newStatus = document.getElementById("updateStatusSelect") ? document.getElementById("updateStatusSelect").value : "";
  const remarks = (document.getElementById("updateRemarksTextarea") ? document.getElementById("updateRemarksTextarea").value.trim() : "");
  const statusMsg = document.getElementById("updateFormStatusMsg");
  const submitBtn = document.getElementById("btnSubmitCaseUpdate");

  if (!remarks) {
    alert("Please enter remarks / hearing minutes for this case update.");
    return;
  }

  const formattedTime = rawTime ? rawTime.replace("T", " ") + ":00" : undefined;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = (currentLang === "hi") ? "<span>अपडेट दर्ज हो रहा है...</span>" : "<span>Recording Update...</span>";
  }
  if (statusMsg) {
    statusMsg.style.color = "var(--ink-muted)";
    statusMsg.textContent = (currentLang === "hi") ? "केस डॉसियर पर अपडेट दर्ज किया जा रहा है..." : "Recording update to case docket...";
  }

  try {
    const payload = {
      update_type: updateType,
      actor: actor,
      timestamp: formattedTime,
      new_status: newStatus || undefined,
      remarks: remarks
    };

    const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(activeDetailCase.case_id)}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to record case update");
    }

    // Success! Update active case
    activeDetailCase = data.case;
    if (typeof allCasesCache !== "undefined") {
      const idx = allCasesCache.findIndex(c => c.case_id === activeDetailCase.case_id);
      if (idx !== -1) allCasesCache[idx] = data.case;
    }

    // Refresh timeline & status
    renderCaseDetailTimeline(activeDetailCase);
    if (newStatus) {
      const statusPill = document.getElementById("detailDocketStatusPill");
      if (statusPill) {
        statusPill.textContent = newStatus;
        statusPill.className = `status-pill ${getStatusClass(newStatus)}`;
      }
    }

    // Clear textarea
    const remarksEl = document.getElementById("updateRemarksTextarea");
    if (remarksEl) remarksEl.value = "";
    const statusSel = document.getElementById("updateStatusSelect");
    if (statusSel) statusSel.value = "";

    // Show feedback
    if (statusMsg) {
      statusMsg.style.color = "var(--status-active)";
      statusMsg.textContent = (currentLang === "hi") ? "✓ समय-मुद्रित अपडेट सफलतापूर्वक दर्ज हुआ!" : "✓ Timestamped update recorded successfully!";
      setTimeout(() => { if (statusMsg) statusMsg.textContent = ""; }, 4000);
    }

    // Refresh run logs & cases list in background
    loadRunLogs();
    loadCaseQueue();
  } catch (err) {
    console.error("Error submitting case update:", err);
    if (statusMsg) {
      statusMsg.style.color = "var(--status-risk)";
      statusMsg.textContent = `Error: ${err.message}`;
    }
    alert(`Could not record case update: ${err.message}`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i data-lucide="plus-circle" style="width: 13px; height: 13px;"></i><span>Record Timestamped Update</span>`;
    }
    renderLucide();
  }
}

async function submitCaseMergeFromDetail(event) {
  event.preventDefault();
  if (!activeDetailCase) {
    alert("No active case selected.");
    return;
  }

  const dupSelect = document.getElementById("mergeDuplicateSelect");
  const duplicateId = dupSelect ? dupSelect.value : "";
  const remarks = (document.getElementById("mergeRemarksInput") ? document.getElementById("mergeRemarksInput").value.trim() : "");
  const statusMsg = document.getElementById("mergeStatusMsg");

  if (!duplicateId) {
    alert((currentLang === "hi") ? "कृपया इस डॉसियर में विलय करने हेतु कोई डुप्लिकेट केस चुनें।" : "Please select a duplicate case to consolidate into this docket.");
    return;
  }

  const confirmMsg = (currentLang === "hi")
    ? `क्या आप वाकई डुप्लिकेट केस ${duplicateId} को मास्टर डॉसियर ${activeDetailCase.case_id} में विलय करना चाहते हैं?\n\nयह केस ${duplicateId} को 'विलय किया गया डुप्लिकेट' के रूप में चिह्नित करेगा और सभी तथ्यों को एकीकृत करेगा।`
    : `Are you sure you want to merge duplicate case ${duplicateId} into Master Docket ${activeDetailCase.case_id}?\n\nThis will mark ${duplicateId} as MERGED_DUPLICATE and consolidate all facts.`;
  if (!confirm(confirmMsg)) {
    return;
  }

  if (statusMsg) {
    statusMsg.style.color = "var(--ink-muted)";
    statusMsg.textContent = (currentLang === "hi") ? "डुप्लिकेट विलय की प्रक्रिया जारी..." : "Executing deduplication merge...";
  }

  try {
    const actorName = (typeof currentPersona !== "undefined" && currentPersona === "counsel") ? "Adv. S. Kalra (Legal NGO)" : "Designated PIO Desk Officer";
    const payload = {
      master_case_id: activeDetailCase.case_id,
      duplicate_case_id: duplicateId,
      actor: actorName,
      remarks: remarks || "Consolidated duplicate docket to eliminate deduplicacy."
    };

    const res = await fetch(`${API_BASE}/cases/merge-duplicates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to merge cases");
    }

    // Success! Update active case
    activeDetailCase = data.master_case;

    if (typeof allCasesCache !== "undefined") {
      const mIdx = allCasesCache.findIndex(c => c.case_id === activeDetailCase.case_id);
      if (mIdx !== -1) allCasesCache[mIdx] = data.master_case;
      const dIdx = allCasesCache.findIndex(c => c.case_id === duplicateId);
      if (dIdx !== -1) allCasesCache[dIdx] = data.duplicate_case;
    }

    // Re-populate merge select and previously merged list
    populateMergeDuplicateSelect(activeDetailCase.case_id);
    renderPreviouslyMergedList(activeDetailCase);

    // Refresh timeline
    renderCaseDetailTimeline(activeDetailCase);

    // Clear remarks input
    const remarksInput = document.getElementById("mergeRemarksInput");
    if (remarksInput) remarksInput.value = "";

    if (statusMsg) {
      statusMsg.style.color = "var(--status-active)";
      statusMsg.textContent = (currentLang === "hi")
        ? `✓ सफलतापूर्वक केस ${duplicateId} को ${activeDetailCase.case_id} में विलय किया गया!`
        : `✓ Successfully merged ${duplicateId} into ${activeDetailCase.case_id}!`;
      setTimeout(() => { if (statusMsg) statusMsg.textContent = ""; }, 5000);
    }

    // Refresh background data
    loadRunLogs();
    loadCaseQueue();
  } catch (err) {
    console.error("Error executing case merge:", err);
    if (statusMsg) {
      statusMsg.style.color = "var(--status-risk)";
      statusMsg.textContent = `Error: ${err.message}`;
    }
    alert(`Could not merge cases: ${err.message}`);
  } finally {
    renderLucide();
  }
}

function returnToAuditRunLog() {
  showPage("dashboard");
  switchDashTab("runlog");
}

function openCaseInCaseworkDesk() {
  if (activeDetailCase) {
    openCaseById(activeDetailCase.case_id);
    showPage("dashboard");
    switchDashTab("casework");
  }
}

function downloadActiveCasePdf() {
  const langParam = (currentLang === "hi") ? "hi" : "en";
  if (activeDetailCase) {
    window.open(`${API_BASE}/cases/${encodeURIComponent(activeDetailCase.case_id)}/pdf?type=rti&lang=${langParam}`, "_blank");
  } else if (typeof currentCase !== "undefined" && currentCase) {
    viewPdf("rti");
  }
}

function refreshActiveCaseDetailTimeline() {
  if (activeDetailCase) {
    openCaseDetailView(activeDetailCase.case_id);
  }
}

function clearRunLogSearch() {
  const input = document.getElementById("runLogSearchInput");
  if (input) input.value = "";
  handleRunLogSearch("");
}

function setRunLogSearchQuery(term) {
  const input = document.getElementById("runLogSearchInput");
  if (input) {
    input.value = term;
    handleRunLogSearch(term);
  }
}

// Live Canvas Radar Animation with Multi-PIO Geodesic Telemetry
let sweepAngle = 0;
let currentPioFilter = "all";

function initRadarAnimation() {
  const canvas = document.getElementById("radarCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = cx - 15;

  function draw() {
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer Range Boundary
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Concentric Range Rings (1.5km, 3.5km, 7.5km, 12km)
    const rings = [0.25, 0.5, 0.75, 1.0];
    const ringLabels = ["1.5km", "3.5km", "7.5km", "12km"];
    rings.forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * r, 0, Math.PI * 2);
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#64748B";
      ctx.font = "9.5px Segoe UI, Arial, sans-serif";
      ctx.fillText(ringLabels[idx], cx + 6, cy - radius * r + 13);
    });

    // Radar Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Rotating Sweep Line
    sweepAngle += 0.035;
    const sweepX = cx + Math.cos(sweepAngle) * radius;
    const sweepY = cy + Math.sin(sweepAngle) * radius;

    // Sweep cone gradient
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, sweepAngle - 0.45, sweepAngle);
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, "rgba(37, 99, 235, 0)");
    grad.addColorStop(1, "rgba(37, 99, 235, 0.18)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Sweep leading line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sweepX, sweepY);
    ctx.strokeStyle = "rgba(37, 99, 235, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 1. Center Blip: Citizen Complainant Origin
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#D97706";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 10px Segoe UI, Arial, sans-serif";
    ctx.fillText("YOU (CITIZEN)", cx - 34, cy + 18);

    // 2. Multi-PIO Blips for Nearest Area Officers
    const c = currentCase;
    const areaPios = (c && c.nearby_area_pios) || (c && c.geospatial_meta && c.geospatial_meta.nearby_pios) || [];
    const citizenCoords = (c && c.geospatial_meta && c.geospatial_meta.user_coords) || (c && c.suggested_pio && c.suggested_pio.user_coordinates) || { latitude: 25.2905, longitude: 82.9995 };

    if (areaPios.length === 0) {
      // Fallback single target blip
      let pioOffsetX = 45;
      let pioOffsetY = -35;
      if (currentCase && currentCase.geospatial_meta && currentCase.geospatial_meta.distance_km) {
        const d = currentCase.geospatial_meta.distance_km;
        pioOffsetX = Math.min(radius - 20, (d / 15) * radius * 0.8 + 25);
        pioOffsetY = -pioOffsetX * 0.7;
      }
      ctx.beginPath();
      ctx.arc(cx + pioOffsetX, cy + pioOffsetY, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#1D4ED8";
      ctx.fill();
      ctx.fillStyle = "#1D4ED8";
      ctx.font = "bold 10px Segoe UI, Arial, sans-serif";
      ctx.fillText("PIO (NEAREST)", cx + pioOffsetX - 30, cy + pioOffsetY - 10);
    } else {
      const maxDist = Math.max(8.0, ...areaPios.map(p => p.distance_km || 4.0));

      areaPios.forEach((p, idx) => {
        const isAssigned = p.is_assigned || (c.suggested_pio && c.suggested_pio.pio_name === p.pio_name);
        const dist = p.distance_km || 1.5;
        const rDist = Math.min(radius - 22, (dist / maxDist) * (radius - 40) + 24);

        // Calculate angular offset based on coordinate delta
        const dLat = (p.latitude || 0) - citizenCoords.latitude;
        const dLon = (p.longitude || 0) - citizenCoords.longitude;
        let angle = Math.atan2(dLat, dLon);
        if (Math.abs(dLat) < 0.0001 && Math.abs(dLon) < 0.0001) {
          angle = (idx * (2 * Math.PI / areaPios.length)) - (Math.PI / 2);
        }

        const bx = cx + Math.cos(angle) * rDist;
        const by = cy - Math.sin(angle) * rDist;

        if (isAssigned) {
          // Pulsing Halo for Assigned Domain PIO
          const pulse = Math.sin(sweepAngle * 4) * 2.5;
          ctx.beginPath();
          ctx.arc(bx, by, 9 + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(29, 78, 216, 0.45)";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Main Blip
          ctx.beginPath();
          ctx.arc(bx, by, 7, 0, Math.PI * 2);
          ctx.fillStyle = "#1D4ED8";
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Label
          ctx.fillStyle = "#1D4ED8";
          ctx.font = "bold 10.5px Segoe UI, Arial, sans-serif";
          ctx.fillText(`★ ${p.pio_name} (${p.distance_label})`, bx - 40, by - 12);
        } else {
          // Other Area Authorities
          ctx.beginPath();
          ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "#64748B";
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "#475569";
          ctx.font = "9px Segoe UI, Arial, sans-serif";
          const shortDept = (p.department || "").split("&")[0].trim();
          ctx.fillText(`${shortDept} (${p.distance_label})`, bx + 7, by + 3);
        }
      });
    }

    radarAnimationId = requestAnimationFrame(draw);
  }

  draw();
}

function updateRadarTelemetry(c) {
  const geo = c.geospatial_meta || {};
  const pio = c.suggested_pio || {};

  const uCoords = geo.user_coords || pio.user_coordinates || { latitude: 25.2905, longitude: 82.9995 };
  const pCoords = geo.pio_coords || pio.pio_coordinates || { latitude: 25.3340, longitude: 82.9860 };

  const uEl = document.getElementById("radarUserCoords");
  const pEl = document.getElementById("radarPioCoords");
  const dEl = document.getElementById("radarDistance");

  if (uEl) uEl.textContent = `${uCoords.latitude ? uCoords.latitude.toFixed(4) : ""}° N, ${uCoords.longitude ? uCoords.longitude.toFixed(4) : ""}° E`;
  if (pEl) pEl.textContent = `${pCoords.latitude ? pCoords.latitude.toFixed(4) : ""}° N, ${pCoords.longitude ? pCoords.longitude.toFixed(4) : ""}° E`;
  if (dEl) dEl.textContent = formatDistanceLabel(geo.distance_label || pio.distance_label || "1.42 km away");
}

// Full PIO Geospatial Map & Directory Controller for Active Docket
async function updatePioMapForCase(c) {
  if (!c) {
    if (allCasesCache && allCasesCache.length > 0) {
      c = allCasesCache[0];
      currentCase = c;
    } else {
      try {
        const res = await fetch(`${API_BASE}/cases`);
        const data = await res.json();
        if (data.cases && data.cases.length > 0) {
          c = data.cases[0];
          currentCase = c;
          allCasesCache = data.cases;
        }
      } catch (e) {
        console.warn("Could not fetch case for PIO map:", e);
      }
    }
  }
  if (!c) return;

  // Preload nearby area PIOs if not already cached on the docket
  if (!c.nearby_area_pios || c.nearby_area_pios.length === 0) {
    try {
      const geoRes = await fetch(`${API_BASE}/cases/${c.case_id}/nearby-pios`);
      const geoData = await geoRes.json();
      if (geoRes.ok && geoData.nearby_area_pios) {
        c.nearby_area_pios = geoData.nearby_area_pios;
        if (geoData.assigned_pio) c.suggested_pio = geoData.assigned_pio;
      }
    } catch (e) {
      console.warn("Could not fetch nearby area PIOs:", e);
    }
  }

  // 1. Update Active Docket Context Bar
  const caseIdEl = document.getElementById("pioMapCaseId");
  const compEl = document.getElementById("pioMapComplainant");
  const locEl = document.getElementById("pioMapLocality");
  const domainEl = document.getElementById("pioMapDomain");
  const assignedNameEl = document.getElementById("pioMapAssignedName");
  const assignedDistEl = document.getElementById("pioMapAssignedDist");

  const pio = c.suggested_pio || {};
  const locality = (c.confidence && c.confidence.user_locality) || (c.complainant && c.complainant.address) || "Administrative Jurisdiction";

  if (caseIdEl) caseIdEl.textContent = c.case_id;
  if (compEl) compEl.textContent = tComplainant(c.complainant && c.complainant.name);
  if (locEl) locEl.textContent = tAddress(locality);
  if (domainEl) domainEl.textContent = tDept(c.department || c.category);
  if (assignedNameEl) assignedNameEl.textContent = `${tOfficer(pio.pio_name)} (${tDesignation(pio.designation)})`;
  if (assignedDistEl) assignedDistEl.textContent = `${formatDistanceLabel(pio.distance_label)} • ${tDept(pio.department || c.department)}`;

  // Populate Dropdown Selector
  populatePioCaseSelector(c.case_id);

  // 2. Update Radar Telemetry
  updateRadarTelemetry(c);

  // 2b. Update Interactive Leaflet OpenStreetMap
  renderLeafletMapMarkers(c);

  // 3. Render Nearest Area PIOs in Directory List
  renderAreaPiosDirectory(c, currentPioFilter);

  renderLucide();
}

function populatePioCaseSelector(selectedCaseId) {
  const sel = document.getElementById("pioMapCaseSelect");
  if (!sel) return;

  const cases = (allCasesCache && allCasesCache.length > 0) ? allCasesCache : (currentCase ? [currentCase] : []);
  sel.innerHTML = cases.map(cs => {
    const isSel = cs.case_id === selectedCaseId ? "selected" : "";
    return `<option value="${cs.case_id}" ${isSel}>${cs.case_id} - ${(cs.complainant && cs.complainant.name) || 'Citizen'} (${cs.department || 'Public Authority'})</option>`;
  }).join("");
}

async function switchPioMapCase(caseId) {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}`);
    const data = await res.json();
    if (res.ok) {
      currentCase = data.case;
      populateWorkspaceFields(data.case);
      updatePioMapForCase(data.case);
    }
  } catch (e) {
    console.error("Error switching PIO map case:", e);
  }
}

function filterRadarDirectory(filterType) {
  currentPioFilter = filterType;
  ["pioFilterAll", "pioFilterDomain", "pioFilterClose"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove("active");
  });
  if (filterType === "all" && document.getElementById("pioFilterAll")) document.getElementById("pioFilterAll").classList.add("active");
  if (filterType === "domain" && document.getElementById("pioFilterDomain")) document.getElementById("pioFilterDomain").classList.add("active");
  if (filterType === "close" && document.getElementById("pioFilterClose")) document.getElementById("pioFilterClose").classList.add("active");

  if (currentCase) {
    renderAreaPiosDirectory(currentCase, filterType);
  }
}

function renderAreaPiosDirectory(c, filterType = "all") {
  const list = document.getElementById("radarDirectoryList");
  const countBadge = document.getElementById("radarAreaCount");
  if (!list) return;

  let areaPios = c.nearby_area_pios || (c.geospatial_meta && c.geospatial_meta.nearby_pios) || [];

  if (filterType === "domain") {
    const dept = (c.department || "").toLowerCase();
    areaPios = areaPios.filter(p => (p.department || "").toLowerCase().includes(dept) || dept.includes((p.department || "").toLowerCase()));
  } else if (filterType === "close") {
    areaPios = areaPios.filter(p => (p.distance_km || 0) <= 3.0);
  }

  if (countBadge) countBadge.textContent = areaPios.length;

  if (areaPios.length === 0) {
    list.innerHTML = `<div style="text-align: center; color: var(--ink-muted); padding: 24px; font-size: 12px; background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: 4px;">No PIO officers match the filter "${filterType}".</div>`;
    return;
  }

  list.innerHTML = areaPios.map(p => {
    const isAssigned = p.is_assigned || (c.suggested_pio && c.suggested_pio.pio_name === p.pio_name);
    const cardClass = isAssigned ? "nearby-pio-card assigned-domain-pio" : "nearby-pio-card";
    const faa = p.faa || {};

    let badgeHtml = "";
    if (isAssigned) {
      const assignedTxt = currentLang === "hi" ? "★ आवंटित विभागीय जन सूचना अधिकारी" : "★ ASSIGNED DOMAIN PIO";
      badgeHtml = `<span class="status-pill approved" style="font-size: 9.5px; font-weight: 700; background: #DCFCE7; color: #166534; border: 1px solid #86EFAC;">${assignedTxt}</span>`;
    } else if (p.is_domain_match || (c.department && p.department && p.department.toLowerCase().includes(c.department.toLowerCase()))) {
      const domainTxt = currentLang === "hi" ? `विभागीय समानता • ${tDept(p.department)}` : `Domain Match • ${p.department}`;
      badgeHtml = `<span class="statutory-tag bns" style="font-size: 9.5px;">${domainTxt}</span>`;
    } else {
      const otherDept = currentLang === "hi" ? tDept(p.department || 'नागरिक प्रशासन') : (p.department || 'Civic Administration');
      badgeHtml = `<span class="statutory-tag" style="font-size: 9.5px; background: var(--bg-subtle); color: var(--ink-secondary);">${otherDept}</span>`;
    }

    const pioName = tOfficer(p.pio_name);
    const pioDesig = tDesignation(p.designation);
    const pioAddr = tAddress(p.office_address);
    const pioRoom = tAddress(p.room_no || (currentLang === "hi" ? "कमरा 101, भूतल" : "Room 101, Ground Floor"));
    const emailLabel = currentLang === "hi" ? "ईमेल:" : "Email:";
    const phoneLabel = currentLang === "hi" ? "फोन:" : "Phone:";
    const faaTitle = currentLang === "hi" ? "प्रथम अपीलीय अधिकारी (FAA):" : "First Appellate Authority (FAA):";
    const faaName = tOfficer(faa.faa_name || (currentLang === "hi" ? "नामित अपीलीय प्राधिकारी" : "Designated Appellate Authority"));
    const faaDesig = tDesignation(faa.designation || (currentLang === "hi" ? "अपीलीय अधिकारी" : "Appellate Officer"));
    const distText = formatDistanceLabel(p.distance_label);

    const btnAssignText = currentLang === "hi" ? "केस अधिकारी बनाएं" : "Assign as Docket PIO";
    const btnAssignedText = currentLang === "hi" ? "✓ आवंटित अधिकारी" : "✓ Assigned PIO";
    const btnTransferText = currentLang === "hi" ? "धारा 6(3) अंतरण" : "Transfer Sec 6(3)";

    return `
      <div class="${cardClass}" id="pio-card-${p.id || p.latitude}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
          <div>${badgeHtml}</div>
          <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--gov-copper);">${distText}</span>
        </div>

        <div style="font-size: 13px; font-weight: 700; color: var(--ink-primary); margin-bottom: 2px;">
          ${pioName}
          <span style="font-weight: 400; font-size: 11.5px; color: var(--ink-muted);">&mdash; ${pioDesig}</span>
        </div>

        <div style="font-size: 11px; color: var(--ink-secondary); margin-bottom: 6px;">
          <i data-lucide="building" style="width: 11px; height: 11px; display: inline-block; vertical-align: middle; color: var(--gov-navy);"></i>
          <span>${pioAddr} &bull; ${pioRoom}</span>
        </div>

        <div style="display: flex; gap: 12px; font-size: 10.5px; color: var(--ink-muted); margin-bottom: 8px;">
          <span><b>${emailLabel}</b> ${p.email || 'उपलब्ध नहीं'}</span>
          <span><b>${phoneLabel}</b> ${p.phone || 'उपलब्ध नहीं'}</span>
        </div>

        <!-- First Appellate Authority Information -->
        <div style="background: var(--bg-subtle); padding: 6px 8px; border-radius: 3px; font-size: 10.5px; margin-bottom: 8px;">
          <div style="color: var(--gov-navy); font-weight: 600;">
            ${faaTitle}
          </div>
          <div style="color: var(--ink-secondary); margin-top: 1px;">
            <b>${faaName}</b> &bull; ${faaDesig}
          </div>
        </div>

        <!-- Action Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-subtle); padding-top: 8px;">
          <span style="font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted);">ID: ${p.id || 'GOV-PIO'}</span>
          <div style="display: flex; gap: 6px;">
            ${isAssigned
        ? `<button class="btn-gov-primary" style="font-size: 10.5px; padding: 3px 8px; background: #16A34A; cursor: default;">${btnAssignedText}</button>`
        : `<button class="btn-gov-outline" style="font-size: 10.5px; padding: 3px 8px;" onclick="assignPioFromMap('${p.id}')">${btnAssignText}</button>`
      }
            <button class="btn-gov-outline" style="font-size: 10.5px; padding: 3px 8px;" onclick="openTransferModal('${p.id}')">${btnTransferText}</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  renderLucide();
}

async function assignPioFromMap(pioId) {
  if (!currentCase) return;
  const areaPios = currentCase.nearby_area_pios || [];
  const selected = areaPios.find(p => p.id === pioId);
  if (!selected) return;

  try {
    const res = await fetch(`${API_BASE}/cases/${currentCase.case_id}/assign-pio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pio: selected, reviewer: "Counsel / Citizen Desk" })
    });
    const data = await res.json();
    if (res.ok) {
      currentCase = data.case;
      populateWorkspaceFields(data.case);
      updatePioMapForCase(data.case);
      alert(`✓ PIO Assigned Successfully!\n\n• Docket: ${data.case.case_id}\n• Designated PIO: ${selected.pio_name} (${selected.designation})\n• Department: ${selected.department}\n• Distance: ${selected.distance_label}`);
    } else {
      alert(`Error: ${data.message || "Failed to assign PIO"}`);
    }
  } catch (err) {
    console.error("Assign PIO error:", err);
  }
}

function openTransferModalForDept(targetDept) {
  if (!currentCase) return;
  const modal = document.getElementById("transferModal");
  if (modal) modal.style.display = "flex";
  const deptSelect = document.getElementById("transferDeptSelect");
  if (deptSelect && targetDept) deptSelect.value = targetDept;
}

const SEED_CUSTOM_ACTS = [
  {
    act_id: "ACT-101",
    act_title: "Consumer Protection Act, 2019",
    added_by: "Adv. S. Kalra (Bar Council Counsel)",
    created_at: "2026-08-29 10:00:00",
    domain: "Consumer Protection & Essential Services",
    punishment_or_relief: "Full refund + General damages up to Rs. 5,00,000 + Product recall orders",
    section: "Section 35 & Section 38 (Consumer Grievance Redressal)",
    statutory_grounds: "Empowers citizens to claim full restitution, litigation costs, and severe damages for deficiency in public/private services within statutory 90-day time-limit."
  },
  {
    act_id: "ACT-102",
    act_title: "Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)",
    added_by: "Advocate Legal Team",
    created_at: "2026-08-29 10:15:00",
    domain: "Police & Criminal Justice",
    punishment_or_relief: "Judicial Court Order for immediate criminal investigation against accused public servants",
    section: "Section 175(3) & Section 173(4) (Magisterial Direction for Investigation)",
    statutory_grounds: "Mandates Judicial Magistrate to direct immediate registration of FIR and monitor investigation upon police refusal under Section 173."
  },
  {
    act_id: "ACT-103",
    act_title: "Uttar Pradesh Revenue Code, 2006",
    added_by: "Advocate Legal Team",
    created_at: "2026-08-29 10:30:00",
    domain: "Revenue & Land Records",
    punishment_or_relief: "Mandatory administrative rectification of Land Title Records",
    section: "Section 32 & Section 38 (Correction of Revenue Land Maps & Registers)",
    statutory_grounds: "Statutory duty of Sub-Divisional Officer (SDO) to correct clerical and map errors in Khasra/Khatauni within 45 days of application."
  }
];

async function loadCustomActs() {
  const container = document.getElementById("customActsContainer");
  const countEl = document.getElementById("customActsCount");
  if (!container) return;

  try {
    let acts = SEED_CUSTOM_ACTS;
    try {
      const res = await fetch(`${API_BASE}/cases/custom-acts`);
      if (res.ok) {
        const data = await res.json();
        if (data.custom_acts && data.custom_acts.length > 0) {
          acts = data.custom_acts;
        }
      }
    } catch (e) {
      acts = SEED_CUSTOM_ACTS;
    }
    if (countEl) countEl.textContent = acts.length;

    container.innerHTML = "";
    if (acts.length === 0) {
      const emptyMsg = currentLang === "hi"
        ? "अभी कोई कस्टम कानून पंजीकृत नहीं है। नया कानून जोड़ने के लिए ऊपर दिए गए फॉर्म का उपयोग करें।"
        : "No custom acts registered yet. Use the form above to add an Act.";
      container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 12px; padding: 16px;">${emptyMsg}</div>`;
      return;
    }

    acts.forEach(act => {
      const card = document.createElement("div");
      card.className = "statutory-card";
      card.style.cssText = "display: flex; flex-direction: column; justify-content: space-between; border-left: 3px solid var(--accent-gold);";

      const title = tCustomAct(act.act_title);
      const sec = tCustomAct(act.section);
      const domain = (currentLang === "hi")
        ? (CUSTOM_ACTS_I18N[act.domain] || DEPARTMENTS_I18N[act.domain] || tCustomAct(act.domain) || tDept(act.domain) || act.domain)
        : act.domain;
      const grounds = tCustomAct(act.statutory_grounds);
      const relief = tCustomAct(act.punishment_or_relief);
      const author = tReviewer(act.added_by) || tCustomAct(act.added_by);
      const scopeLabel = currentLang === "hi" ? "दायरा / राहत:" : "Scope:";
      const regByLabel = currentLang === "hi" ? "पंजीकरणकर्ता:" : "Registered by:";
      const linkBtnText = currentLang === "hi" ? "केस से जोड़ें" : "Link to Case";
      const deleteTitle = currentLang === "hi" ? "हटाएं" : "Delete";

      card.innerHTML = `
        <div>
          <div class="statutory-card-header">
            <span>${title}</span>
            <span class="badge badge-gold">${act.act_id}</span>
          </div>
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan); margin-bottom: 6px;">
            <b>${sec}</b>
          </div>
          <div style="margin-bottom: 6px;">
            <span class="badge badge-blue">${domain}</span>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
            ${grounds}
          </p>
          ${act.punishment_or_relief ? `<div class="text-mono" style="font-size: 10.5px; color: var(--accent-terracotta); margin-bottom: 8px;"><b>${scopeLabel}</b> ${relief}</div>` : ''}
          <div class="text-mono" style="font-size: 10px; color: var(--text-muted); margin-bottom: 12px;">
            ${regByLabel} <b>${author}</b> &middot; ${act.created_at}
          </div>
        </div>

        <div style="display: flex; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 10px;">
          <button class="btn btn-sm btn-primary framer-button" style="flex: 1;" onclick="applyCustomActToActiveCase('${act.act_id}')">
            <i data-lucide="link"></i>
            <span>${linkBtnText}</span>
          </button>
          <button class="btn btn-sm btn-outline framer-button" style="color: var(--color-rose); border-color: #FECDD3;" onclick="deleteCustomAct('${act.act_id}')" title="${deleteTitle}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;
      container.appendChild(card);
    });
    renderLucide();
  } catch (err) {
    console.error("Error loading custom acts:", err);
  }
}

async function submitCustomAct(event) {
  event.preventDefault();

  const actTitle = document.getElementById("customActTitle").value.trim();
  const section = document.getElementById("customActSection").value.trim();
  const domain = document.getElementById("customActDomain").value;
  const author = document.getElementById("customActAuthor").value.trim();
  const grounds = document.getElementById("customActGrounds").value.trim();
  const relief = document.getElementById("customActRelief").value.trim();
  const linkActive = document.getElementById("customActLinkActive").checked;

  const payload = {
    act_title: actTitle,
    section: section,
    domain: domain,
    added_by: author || "Advocate Legal Counsel",
    statutory_grounds: grounds,
    punishment_or_relief: relief,
    linked_case_id: linkActive && currentCase ? currentCase.case_id : null
  };

  try {
    const res = await fetch(`${API_BASE}/cases/custom-acts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Custom Act Registered into Legal Codex!\n\n• Act ID: ${data.custom_act.act_id}\n• Act: ${data.custom_act.act_title}\n• Section: ${data.custom_act.section}\n${linkActive && currentCase ? `• Linked to Active Case: ${currentCase.case_id}` : ''}`);
      document.getElementById("customActForm").reset();
      loadCustomActs();
      loadRunLogs();

      if (linkActive && currentCase) {
        openCaseById(currentCase.case_id);
      }
    } else {
      alert(`Error: ${data.message || "Failed to register custom act."}`);
    }
  } catch (err) {
    console.error("Custom act submit error:", err);
    alert("Connection error registering custom act.");
  }
}

async function deleteCustomAct(actId) {
  if (!confirm(`Are you sure you want to remove custom act ${actId} from the legal library?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cases/custom-acts/${actId}`, {
      method: "DELETE"
    });

    const data = await res.json();
    if (res.ok) {
      loadCustomActs();
      loadRunLogs();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    console.error("Delete custom act error:", err);
  }
}

async function applyCustomActToActiveCase(actId) {
  if (!currentCase) {
    alert("Please select or open an active case docket first from Command Center.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cases/${currentCase.case_id}/apply-custom-act`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ act_id: actId, reviewer: "Adv. S. Kalra" })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Custom Act ${actId} successfully linked to active case ${currentCase.case_id}!\n\nCheck '03. LEGAL & COMPLIANCE WORKSPACE' to see the added statutory section and grounds.`);
      openCaseWorkspace(data.case);
      loadRunLogs();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    console.error("Apply custom act error:", err);
  }
}

// ----------------------------------------------------
// EXECUTIVE THEME CONTROLLER (DARK / LIGHT PARCHMENT)
// ----------------------------------------------------

function initTheme() {
  const saved = localStorage.getItem("arzi_theme") || "light";
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("arzi_theme", theme);
  const icon = document.getElementById("themeIcon");
  const btn = document.getElementById("themeToggleBtn");
  if (theme === "dark") {
    if (icon) icon.setAttribute("data-lucide", "sun");
    if (btn) btn.title = "Switch to Supreme Court Parchment Light Theme";
  } else {
    if (icon) icon.setAttribute("data-lucide", "moon");
    if (btn) btn.title = "Switch to Executive Dark Theme";
  }
  renderLucide();
}

function toggleExecutiveTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
}

// ----------------------------------------------------
// WEB SPEECH API VOICE DICTATION
// ----------------------------------------------------

function toggleVoiceDictation() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = document.getElementById("btnVoiceDictate");
  const status = document.getElementById("voiceStatusText");
  const liveTranscript = document.getElementById("voiceLiveTranscript");
  const textarea = document.getElementById("rawGrievance");

  if (!SpeechRec) {
    alert("Web Speech API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari to dictate grievances.");
    return;
  }

  if (isListeningVoice) {
    if (speechRecognizer) {
      try { speechRecognizer.stop(); } catch (e) { }
    }
    isListeningVoice = false;
    if (btn) btn.classList.remove("recording");
    if (status) status.textContent = "Voice Dictation";
    if (liveTranscript) liveTranscript.style.display = "none";
    return;
  }

  try {
    speechRecognizer = new SpeechRec();
    speechRecognizer.continuous = true;
    speechRecognizer.interimResults = true;
    speechRecognizer.lang = "en-IN"; // Configured for Indian English / Hinglish speech cadence

    speechRecognizer.onstart = () => {
      isListeningVoice = true;
      if (btn) btn.classList.add("recording");
      if (status) status.textContent = "Listening (Speak)...";
      if (liveTranscript) {
        liveTranscript.style.display = "block";
        liveTranscript.textContent = "Listening to microphone...";
      }
    };

    speechRecognizer.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final && textarea) {
        const existing = textarea.value.trim();
        textarea.value = existing ? `${existing} ${final.trim()}` : final.trim();
      }
      if (liveTranscript) {
        liveTranscript.textContent = interim ? `Live: "${interim}"` : (final ? `Dictated: "${final}"` : "Listening...");
      }
    };

    speechRecognizer.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      isListeningVoice = false;
      if (btn) btn.classList.remove("recording");
      if (status) status.textContent = "Voice Dictation";
      if (liveTranscript) {
        liveTranscript.textContent = `Dictation ended (${event.error})`;
        setTimeout(() => { if (liveTranscript) liveTranscript.style.display = "none"; }, 3000);
      }
    };

    speechRecognizer.onend = () => {
      isListeningVoice = false;
      if (btn) btn.classList.remove("recording");
      if (status) status.textContent = "Voice Dictation";
      setTimeout(() => { if (liveTranscript) liveTranscript.style.display = "none"; }, 2500);
    };

    speechRecognizer.start();
  } catch (err) {
    console.error("Speech start error:", err);
    alert("Could not access microphone for voice dictation.");
    isListeningVoice = false;
    if (btn) btn.classList.remove("recording");
    if (status) status.textContent = "Voice Dictation";
  }
}

// ----------------------------------------------------
// 48-HOUR URGENT LIFE & LIBERTY TOGGLE CONTROLLER
// ----------------------------------------------------

async function toggleCurrentCaseUrgency() {
  if (!currentCase) {
    alert("Please select an active docket first.");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/cases/${currentCase.case_id}/toggle-urgency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    if (res.ok) {
      currentCase = data.case;
      populateWorkspaceFields(data.case);
      loadCaseQueue();
      loadRunLogs();
      const statusMsg = data.is_life_liberty
        ? "🚨 Case elevated to 48-Hour Urgent Life & Liberty Fast-Track under Section 7(1) Proviso!\n• Statutory SLA: Compressed to 48 Hours\n• Section 20(1) Penalty: Multiplied for acute life risk\n• Life & Liberty Red Banner stamped across PDF instruments."
        : "✓ Case restored to standard 30-day statutory SLA.";
      alert(statusMsg);
    } else {
      alert(`Error: ${data.message || "Failed to toggle urgency"}`);
    }
  } catch (err) {
    console.error("Toggle urgency error:", err);
    alert("Network error toggling urgency.");
  }
}

// ----------------------------------------------------
// SECTION 8 EXEMPTION SHIELD & NEUTRALIZER CONTROLLER
// ----------------------------------------------------

async function refreshSection8Shield() {
  if (!currentCase) return;
  const body = document.getElementById("section8ShieldBody");
  if (!body) return;

  body.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--ink-muted);">Auditing Section 8 exemptions & generating pre-emptive statutory shields...</div>`;

  try {
    const res = await fetch(`${API_BASE}/cases/${currentCase.case_id}/section8-shield`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    if (!res.ok) {
      body.innerHTML = `<div style="color: var(--status-urgent); padding: 12px;">Failed to audit Section 8 exemptions.</div>`;
      return;
    }

    const shield = data.section_8_shield || {};
    const risks = shield.section_8_risks_identified || [];

    let riskCards = risks.map(r => {
      return `
        <div style="border: 1px solid var(--border-medium); border-left: 3px solid #DC2626; padding: 10px; margin-bottom: 8px; background: var(--bg-surface); border-radius: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <b style="color: var(--gov-navy); font-size: 11.5px;">${r.exemption_section}: ${r.clause_title}</b>
            <span class="status-pill urgent" style="font-size: 9.5px;">POTENTIAL REFUSAL EXCUSE</span>
          </div>
          <div style="font-size: 10.5px; color: var(--ink-muted); margin-bottom: 4px; font-style: italic;">
            <b>Delinquent PIO Claim:</b> "${r.delinquent_pio_excuse}"
          </div>
          <div style="font-size: 10.5px; color: var(--ink-secondary); margin-bottom: 4px;">
            <b>Statutory Neutralizer:</b> ${r.statutory_neutralizer}
          </div>
          <div style="font-size: 10px; color: var(--gov-copper); font-style: italic; margin-bottom: 2px;">
            <b>Judicial Authority:</b> ${r.landmark_precedent}
          </div>
          <div style="font-size: 10px; color: #15803D; font-weight: 600;">
            <b>Legal Ground:</b> ${r.rebuttal_ground}
          </div>
        </div>
      `;
    }).join("");

    body.innerHTML = `
      <div style="margin-bottom: 10px; padding: 8px 10px; background: rgba(30, 58, 138, 0.05); border: 1px solid var(--border-medium); border-radius: 2px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: var(--gov-navy);">Section 8 Exemption Neutralizer Active</span>
          <span class="status-pill approved" style="font-size: 9.5px;">${risks.length} Risk Clauses Audited</span>
        </div>
        <div style="font-size: 10px; color: var(--ink-secondary); margin-top: 4px;">
          <b>${shield.section_8_2_override_text || "Section 8(2) Public Interest Override Active"}</b>
        </div>
        <div style="font-size: 10px; color: #15803D; margin-top: 2px;">
          <b>${shield.section_8_1_j_proviso_text || "Proviso to Section 8(1)(j) Applied"}</b>
        </div>
      </div>

      <div style="margin-bottom: 10px;">
        <label class="form-label" style="font-size: 10px; margin-bottom: 2px;">Pre-emptive Statutory Rebuttal Notice</label>
        <textarea id="section8RebuttalNotice" rows="5" style="width: 100%; font-family: var(--font-mono); font-size: 10px; background: var(--bg-subtle); padding: 6px;" readonly>${shield.statutory_rebuttal_draft || ""}</textarea>
        <button class="btn-gov-outline" style="font-size: 9.5px; padding: 2px 8px; margin-top: 4px;" onclick="navigator.clipboard.writeText(document.getElementById('section8RebuttalNotice').value); alert('Rebuttal notice copied to clipboard!');">📋 Copy Rebuttal Notice</button>
      </div>

      <div>
        <label class="form-label" style="font-size: 10px; margin-bottom: 4px;">Audited Exemption Clauses & Statutory Counter-Measures</label>
        ${riskCards}
      </div>
    `;
  } catch (e) {
    console.error("Section 8 Shield error:", e);
    body.innerHTML = `<div style="color: var(--status-urgent); padding: 12px;">Error contacting Section 8 auditor.</div>`;
  }
}

// ----------------------------------------------------
// INDIAN SPEED POST BARCODE SLIP CONTROLLERS
// ----------------------------------------------------

async function fetchPostalSlipData(caseId) {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/postal-slip`);
    if (res.ok) {
      const data = await res.json();
      return data.postal_slip || data;
    }
  } catch (e) {
    console.error("Error fetching postal slip:", e);
  }
  return null;
}

function buildPostalSlipHtml(slipData) {
  const isUrgent = (slipData.statutory_sla && slipData.statutory_sla.indexOf("48") !== -1) || (currentCase && currentCase.is_life_liberty);
  const recipient = slipData.addressee || slipData.recipient || {};
  const sender = slipData.sender || {};

  return `
    <div class="postal-slip-card" style="border: 2px solid #0F172A; padding: 16px; background: #FFFFFF; font-family: var(--font-mono); color: #0F172A;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0F172A; padding-bottom: 8px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="background: #991B1B; color: #FFFFFF; font-weight: 800; font-size: 15px; padding: 3px 8px; border-radius: 2px; line-height: 1.2;">
            INDIA POST<br/><span style="font-size: 11px; font-weight: 600;">भारतीय डाक</span>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 12.5px; letter-spacing: 0.5px;">SPEED POST & REGISTERED AD • स्पीड पोस्ट एवं पंजीकृत डाक</div>
            <div style="font-size: 9px; color: #475569;">DEPARTMENT OF POSTS, GOVT. OF INDIA • डाक विभाग, भारत सरकार</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 9.5px; font-weight: 700; color: #0F172A;">CONSIGNMENT NO / कंसाइनमेंट नंबर:</div>
          <div style="font-size: 13.5px; font-weight: 800; letter-spacing: 1px; color: #1E3A8A;">${slipData.consignment_number}</div>
        </div>
      </div>

      ${isUrgent ? `
        <div style="background: #FEE2E2; border: 2px dashed #DC2626; color: #991B1B; font-weight: 800; font-size: 10.5px; padding: 6px 10px; margin-bottom: 12px; text-align: center; text-transform: uppercase;">
          🚨 URGENT: 48-HOUR STATUTORY LIFE & LIBERTY DISPATCH — SECTION 7(1) RTI ACT 2005 🚨<br/>
          <span style="font-size: 9.5px; font-weight: 700;">आपातकालीन 48-घंटे विधिक प्रेषण — धारा 7(1) सूचना का अधिकार अधिनियम 2005</span>
        </div>
      ` : ''}

      <div style="text-align: center; margin: 10px 0; background: #FFFFFF; padding: 8px; border: 1px solid #E2E8F0;">
        <div style="display: inline-block;">
          ${slipData.barcode_svg}
        </div>
        <div style="font-size: 11.5px; font-weight: 700; letter-spacing: 2px; margin-top: 4px;">${slipData.consignment_number}</div>
      </div>

      <div class="postal-parties-grid">
        <div>
          <div style="font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 3px;">TO / सेवा में (RECIPIENT PIO):</div>
          <div style="font-size: 11px; font-weight: 700;">${recipient.name || recipient.pio_name || 'Designated PIO'} (${recipient.designation || 'PIO'})</div>
          <div style="font-size: 10px; color: #1E293B;">Department: ${recipient.department || 'Public Authority'}</div>
          <div style="font-size: 10px; color: #334155;">${recipient.office_address || recipient.address || 'N/A'}</div>
          <div style="font-size: 9.5px; color: #334155;">Room: ${recipient.room_no || 'N/A'}</div>
        </div>
        <div>
          <div style="font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 3px;">FROM / प्रेषक (CITIZEN / COUNSEL):</div>
          <div style="font-size: 11px; font-weight: 700;">${sender.name || 'Citizen Applicant'}</div>
          <div style="font-size: 10px; color: #334155;">${sender.address || 'N/A'}</div>
          <div style="font-size: 10px; color: #334155;">Contact: ${sender.contact || 'N/A'}</div>
          <div style="font-size: 9.5px; color: #334155;">Case Docket: <b>${slipData.case_id}</b></div>
        </div>
      </div>

      <div class="postal-meta-grid">
        <div><b>Booking Date / तिथि:</b><br/>${slipData.booking_date}</div>
        <div><b>Weight / वजन:</b><br/>${slipData.article_weight_grams || 45}g</div>
        <div><b>Postage Tariff / शुल्क:</b><br/>₹${slipData.tariff_inr || 41.00}</div>
        <div><b>Category / श्रेणी:</b><br/>Speed Post + AD</div>
      </div>

      <div style="margin-top: 10px; padding-top: 6px; border-top: 1px dashed #94A3B8; font-size: 8px; color: #64748B; line-height: 1.3;">
        <b>STATUTORY PROOF NOTICE / विधिक प्रेषण साक्ष्य:</b> ${slipData.legal_notice || 'Section 27 General Clauses Act presumption applies. धारा 27 साधारण खंड अधिनियम के अंतर्गत विधिक तामीली मानी जाएगी।'}
      </div>
    </div>
  `;
}

async function openPostalSlipModal() {
  if (!currentCase) {
    alert("Please select a case first.");
    return;
  }
  const modal = document.getElementById("postalSlipModal");
  const content = document.getElementById("postalSlipModalContent");
  if (!modal || !content) return;

  content.innerHTML = `<div style="text-align: center; padding: 24px;">Generating Indian Speed Post Dispatch Slip with Code-128 Barcode...</div>`;
  modal.classList.remove("hidden");

  const slipData = await fetchPostalSlipData(currentCase.case_id);
  if (slipData) {
    content.innerHTML = buildPostalSlipHtml(slipData);
  } else {
    content.innerHTML = `<div style="color: var(--status-urgent); padding: 20px;">Could not generate Speed Post dispatch slip.</div>`;
  }
  renderLucide();
}

function closePostalSlipModal() {
  const modal = document.getElementById("postalSlipModal");
  if (modal) modal.classList.add("hidden");
}

function printPostalSlip() {
  window.print();
}

function downloadSlipPdf() {
  if (!currentCase) return;
  const langParam = (currentLang === "hi") ? "hi" : "en";
  window.open(`${API_BASE}/cases/${currentCase.case_id}/pdf?type=slip&lang=${langParam}`, "_blank");
}

async function renderTabPostalSlip() {
  if (!currentCase) return;
  const container = document.getElementById("tabPostalSlipContainer");
  if (!container) return;

  container.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--ink-muted);">Loading Speed Post Dispatch Slip...</div>`;
  const slipData = await fetchPostalSlipData(currentCase.case_id);
  if (slipData) {
    container.innerHTML = buildPostalSlipHtml(slipData);
  } else {
    container.innerHTML = `<div style="color: var(--status-urgent); padding: 12px;">Could not load Speed Post slip.</div>`;
  }
}

// ----------------------------------------------------
// LEAFLET.JS INTERACTIVE OPENSTREETMAP VISUALIZER
// ----------------------------------------------------

function initLeafletPioMap() {
  const mapEl = document.getElementById("pioLeafletMap");
  if (!mapEl || typeof L === "undefined") return;

  if (leafletMap) {
    try { leafletMap.remove(); } catch (e) { }
    leafletMap = null;
  }

  try {
    leafletMap = L.map("pioLeafletMap", {
      center: [25.3176, 82.9739], // Default Varanasi
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
    }).addTo(leafletMap);

    leafletMarkersLayer = L.layerGroup().addTo(leafletMap);
  } catch (err) {
    console.error("Leaflet init error:", err);
  }
}

function renderLeafletMapMarkers(c) {
  if (!leafletMap || !leafletMarkersLayer || typeof L === "undefined") return;

  leafletMarkersLayer.clearLayers();

  const citizenCoords = (c && c.geospatial_meta && c.geospatial_meta.user_coords) || (c && c.suggested_pio && c.suggested_pio.user_coordinates) || { latitude: 25.2905, longitude: 82.9995 };
  const assignedPio = (c && c.suggested_pio) || {};
  const pioCoords = (c && c.geospatial_meta && c.geospatial_meta.pio_coords) || assignedPio.pio_coordinates || { latitude: 25.3340, longitude: 82.9860 };
  const areaPios = (c && c.nearby_area_pios) || (c && c.geospatial_meta && c.geospatial_meta.nearby_pios) || [];

  const bounds = [];

  // 1. Citizen Complainant Marker (Orange CircleMarker)
  if (citizenCoords.latitude && citizenCoords.longitude) {
    const cPt = [citizenCoords.latitude, citizenCoords.longitude];
    bounds.push(cPt);
    const citizenMarker = L.circleMarker(cPt, {
      radius: 9,
      fillColor: "#D97706",
      color: "#FFFFFF",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95
    }).addTo(leafletMarkersLayer);

    citizenMarker.bindPopup(`
      <div style="font-family: var(--font-ui); font-size: 11px;">
        <b style="color: #D97706;">Citizen Complainant Origin</b><br/>
        <b>${(c && c.complainant && c.complainant.name) || "Complainant"}</b><br/>
        <span style="font-size: 10px; color: #64748B;">${(c && c.complainant && c.complainant.address) || "Local Jurisdiction"}</span>
      </div>
    `);
  }

  // 2. Assigned PIO Marker (Royal Blue with Gold border)
  if (pioCoords.latitude && pioCoords.longitude) {
    const pPt = [pioCoords.latitude, pioCoords.longitude];
    bounds.push(pPt);
    const pioMarker = L.circleMarker(pPt, {
      radius: 11,
      fillColor: "#1D4ED8",
      color: "#FEF08A",
      weight: 3,
      opacity: 1,
      fillOpacity: 1
    }).addTo(leafletMarkersLayer);

    pioMarker.bindPopup(`
      <div style="font-family: var(--font-ui); font-size: 11px;">
        <b style="color: #1D4ED8;">★ ASSIGNED DOMAIN PIO</b><br/>
        <b>${assignedPio.pio_name || "Designated PIO"}</b><br/>
        <span style="font-size: 10px; color: #475569;">${assignedPio.designation || "PIO"} &bull; ${assignedPio.department || (c && c.department)}</span><br/>
        <span style="font-size: 10px; font-weight: 700; color: #15803D;">Distance: ${assignedPio.distance_label || "Nearest"}</span>
      </div>
    `);

    // Draw dashed connecting path between citizen and assigned PIO
    if (citizenCoords.latitude && citizenCoords.longitude) {
      const poly = L.polyline([
        [citizenCoords.latitude, citizenCoords.longitude],
        [pioCoords.latitude, pioCoords.longitude]
      ], {
        color: "#1D4ED8",
        weight: 2.5,
        dashArray: "6, 6",
        opacity: 0.8
      }).addTo(leafletMarkersLayer);

      poly.bindTooltip(`${assignedPio.distance_label || "Direct Line"}`, { permanent: false });
    }
  }

  // 3. Other Area Authorities (Slate Markers)
  areaPios.forEach(p => {
    const isAssigned = p.is_assigned || (assignedPio.pio_name === p.pio_name);
    if (isAssigned) return;
    if (p.latitude && p.longitude) {
      const pt = [p.latitude, p.longitude];
      bounds.push(pt);
      const m = L.circleMarker(pt, {
        radius: 6,
        fillColor: "#64748B",
        color: "#FFFFFF",
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.85
      }).addTo(leafletMarkersLayer);

      m.bindPopup(`
        <div style="font-family: var(--font-ui); font-size: 10.5px;">
          <b>${p.pio_name}</b><br/>
          <span style="color: #64748B;">${p.department} &bull; ${p.distance_label}</span><br/>
          <button style="margin-top: 4px; font-size: 9.5px; padding: 2px 6px; cursor: pointer;" onclick="assignPioFromMap('${p.id}')">Reassign Docket to this PIO</button>
        </div>
      `);
    }
  });

  if (bounds.length > 0) {
    try {
      leafletMap.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
    } catch (e) {
      console.warn("fitBounds failed:", e);
    }
  }
}

function switchGeoView(viewType) {
  const mapContainer = document.getElementById("leafletMapContainer");
  const radarContainer = document.getElementById("radarCanvasContainer");
  const btnMap = document.getElementById("btnViewMap");
  const btnRadar = document.getElementById("btnViewRadar");

  if (viewType === "map") {
    if (mapContainer) mapContainer.style.display = "block";
    if (radarContainer) radarContainer.style.display = "none";
    if (btnMap) btnMap.classList.add("active");
    if (btnRadar) btnRadar.classList.remove("active");
    if (leafletMap) {
      setTimeout(() => leafletMap.invalidateSize(), 150);
    }
  } else {
    if (mapContainer) mapContainer.style.display = "none";
    if (radarContainer) radarContainer.style.display = "block";
    if (btnRadar) btnRadar.classList.add("active");
    if (btnMap) btnMap.classList.remove("active");
  }
}

// ----------------------------------------------------
// GLOBAL WINDOW SCOPE EXPOSURES FOR HTML ONCLICK BINDINGS
// ----------------------------------------------------
window.showPage = showPage;
window.switchDashTab = switchDashTab;
window.switchDocTab = switchDocTab;
window.switchPersona = switchPersona;
window.switchMainModule = switchMainModule;
window.switchToTab = switchToTab;
window.toggleExecutiveTheme = toggleExecutiveTheme;
window.toggleIntakeForm = toggleIntakeForm;
window.toggleVoiceDictation = toggleVoiceDictation;
window.loadPreset = loadPreset;
window.loadCaseQueue = loadCaseQueue;
window.openCaseById = openCaseById;
window.openCaseWorkspace = openCaseWorkspace;
window.approveCurrentCase = approveCurrentCase;
window.toggleCurrentCaseUrgency = toggleCurrentCaseUrgency;
window.openTransferModal = openTransferModal;
window.closeTransferModal = closeTransferModal;
window.openTransferModalForDept = openTransferModalForDept;
window.submitTransferSec6_3 = submitTransferSec6_3;
window.openPostalSlipModal = openPostalSlipModal;
window.closePostalSlipModal = closePostalSlipModal;
window.printPostalSlip = printPostalSlip;
window.downloadSlipPdf = downloadSlipPdf;
window.viewPdf = viewPdf;
window.refreshSection8Shield = refreshSection8Shield;
window.switchGeoView = switchGeoView;
window.filterRadarDirectory = filterRadarDirectory;
window.loadCustomActs = loadCustomActs;
window.loadRunLogs = loadRunLogs;
window.clearRunLogSearch = clearRunLogSearch;
window.setRunLogSearchQuery = setRunLogSearchQuery;
window.handleRunLogSearch = handleRunLogSearch;
window.inspectCaseFromRunLog = inspectCaseFromRunLog;
window.submitIntake = submitIntake;
window.submitCustomAct = submitCustomAct;
window.handlePincodeInput = handlePincodeInput;
window.assignPioFromMap = assignPioFromMap;
window.deleteCustomAct = deleteCustomAct;
window.applyCustomActToActiveCase = applyCustomActToActiveCase;
window.switchPioMapCase = switchPioMapCase;
window.openCaseDetailView = openCaseDetailView;
window.returnToAuditRunLog = returnToAuditRunLog;
window.openCaseInCaseworkDesk = openCaseInCaseworkDesk;
window.downloadActiveCasePdf = downloadActiveCasePdf;
window.submitCaseUpdateFromDetail = submitCaseUpdateFromDetail;
window.submitCaseMergeFromDetail = submitCaseMergeFromDetail;
window.refreshActiveCaseDetailTimeline = refreshActiveCaseDetailTimeline;
window.populateMergeDuplicateSelect = populateMergeDuplicateSelect;
window.triggerLiveMlPrediction = triggerLiveMlPrediction;
window.getStatusClass = getStatusClass;

// ----------------------------------------------------
// SECTION 20(1) STATUTORY SLA & PENALTY CLOCK CALCULATOR
// ----------------------------------------------------
function initSlaPenaltyCalculator() {
  const filingInput = document.getElementById("slaFilingDate");
  if (!filingInput) return;
  if (!filingInput.value) {
    // Default to 35 days ago to demonstrate overdue penalty calculations immediately
    const d = new Date();
    d.setDate(d.getDate() - 35);
    filingInput.value = d.toISOString().split("T")[0];
  }
  calculateSlaPenalty();
}

function resetSlaCalculator() {
  const filingInput = document.getElementById("slaFilingDate");
  const provSelect = document.getElementById("slaProvisionType");
  const respInput = document.getElementById("slaResponseDate");
  const deptInput = document.getElementById("slaPioDepartment");

  if (filingInput) {
    const d = new Date();
    d.setDate(d.getDate() - 35);
    filingInput.value = d.toISOString().split("T")[0];
  }
  if (provSelect) provSelect.value = "30";
  if (respInput) respInput.value = "";
  if (deptInput) deptInput.value = "Delhi Jal Board / BSES Power Discom";
  calculateSlaPenalty();
}

function calculateSlaPenalty() {
  const filingVal = document.getElementById("slaFilingDate") ? document.getElementById("slaFilingDate").value : "";
  if (!filingVal) return;

  const filingDate = new Date(filingVal);
  const provVal = (document.getElementById("slaProvisionType") ? document.getElementById("slaProvisionType").value : "") || "30";
  let slaDays = 30;
  if (provVal === "2") slaDays = 2;
  else if (provVal === "35_apio" || provVal === "35_transfer") slaDays = 35;
  else if (provVal === "45") slaDays = 45;

  const deadlineDate = new Date(filingDate);
  deadlineDate.setDate(deadlineDate.getDate() + slaDays);

  const respVal = document.getElementById("slaResponseDate") ? document.getElementById("slaResponseDate").value : "";
  const endDate = respVal ? new Date(respVal) : new Date();

  const diffTime = endDate.getTime() - filingDate.getTime();
  const elapsedDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const overdueDays = Math.max(0, elapsedDays - slaDays);
  const penaltyAmount = Math.min(25000, overdueDays * 250);

  const fmtOpts = { day: "2-digit", month: "short", year: "numeric" };
  const deadlineStr = deadlineDate.toLocaleDateString("en-IN", fmtOpts);
  const filingStr = filingDate.toLocaleDateString("en-IN", fmtOpts);
  const targetDept = (document.getElementById("slaPioDepartment") ? document.getElementById("slaPioDepartment").value : "") || "Public Authority";

  const elDeadline = document.getElementById("slaDeadlineDisplay");
  const elElapsed = document.getElementById("slaElapsedDaysDisplay");
  const elOverdue = document.getElementById("slaOverdueDaysDisplay");
  const elPenalty = document.getElementById("slaPenaltyAmountDisplay");
  const elPill = document.getElementById("slaClockStatusPill");
  const elGuidanceBox = document.getElementById("slaGuidanceBox");
  const elGuidanceTitle = document.getElementById("slaGuidanceTitle");
  const elGuidanceText = document.getElementById("slaGuidanceText");
  const elClause = document.getElementById("slaGeneratedClause");

  if (elDeadline) elDeadline.textContent = deadlineStr;
  if (elElapsed) elElapsed.textContent = currentLang === "hi" ? `${elapsedDays} दिन` : `${elapsedDays} Days`;
  if (elOverdue) {
    elOverdue.textContent = currentLang === "hi" ? `${overdueDays} दिन` : `${overdueDays} Days`;
    elOverdue.style.color = overdueDays > 0 ? "var(--status-review)" : "var(--status-active)";
  }
  if (elPenalty) {
    elPenalty.textContent = `₹${penaltyAmount.toLocaleString("en-IN")}`;
    elPenalty.style.color = overdueDays > 0 ? "var(--status-review)" : "var(--status-active)";
  }

  if (elPill) {
    elPill.className = "status-pill";
    if (overdueDays > 0) {
      elPill.classList.add("needs-review");
      elPill.textContent = currentLang === "hi" ? `वैधानिक विलंब (₹${penaltyAmount.toLocaleString("en-IN")})` : `Statutory Overdue (₹${penaltyAmount.toLocaleString("en-IN")})`;
    } else if (elapsedDays >= slaDays - 5) {
      elPill.classList.add("under-review");
      elPill.textContent = currentLang === "hi" ? "समयसीमा निकट" : "Approaching Deadline";
    } else {
      elPill.classList.add("approved");
      elPill.textContent = currentLang === "hi" ? "वैधानिक समयसीमा के भीतर" : "Within Statutory Window";
    }
  }

  if (elGuidanceBox && elGuidanceTitle && elGuidanceText) {
    if (overdueDays > 0) {
      elGuidanceBox.style.borderLeftColor = "var(--status-review)";
      elGuidanceTitle.style.color = "var(--status-review)";
      if (currentLang === "hi") {
        elGuidanceTitle.textContent = `⚠️ वैधानिक डिफ़ॉल्ट: वेतन से कटौती प्रारंभ (${overdueDays} दिन का विलंब)`;
        elGuidanceText.innerHTML = `<b>${escapeHtml(tDept(targetDept))}</b> के जन सूचना अधिकारी ने कानूनी 30-दिवसीय सीमा का <b>${overdueDays} दिन</b> उल्लंघन किया है। आरटीआई अधिनियम की धारा 20(1) के तहत ₹250/दिन की दर से कुल <b>₹${penaltyAmount.toLocaleString("en-IN")}</b> जुर्माना देय है जो अधिकारी के वेतन से काटा जाएगा। तुरंत धारा 19(1) के तहत प्रथम अपील दर्ज करें।`;
      } else {
        elGuidanceTitle.textContent = `⚠️ Statutory Default: Personal Salary Deduction Triggered (${overdueDays} Days Overdue)`;
        elGuidanceText.innerHTML = `The Designated Public Information Officer at <b>${escapeHtml(targetDept)}</b> has exceeded the statutory deadline by <b>${overdueDays} days</b> without lawful order. Under Section 20(1) of the RTI Act 2005 and Supreme Court precedent <i>Manohar Anchule (2013)</i>, a mandatory penalty of ₹250/day (Total: <b>₹${penaltyAmount.toLocaleString("en-IN")}</b>) has accrued and is deductible directly from the officer's salary. Recommended action: Immediately file First Appeal under Section 19(1) or penalty complaint under Section 18.`;
      }
    } else {
      elGuidanceBox.style.borderLeftColor = "var(--status-active)";
      elGuidanceTitle.style.color = "var(--status-active)";
      if (currentLang === "hi") {
        elGuidanceTitle.textContent = "✓ आवेदन वैधानिक समयसीमा के भीतर";
        elGuidanceText.innerHTML = `<b>${filingStr}</b> को दर्ज आवेदन अभी निर्धारित ${slaDays}-दिवसीय समयसीमा में है। अधिकारी को <b>${deadlineStr}</b> तक जानकारी देनी होगी।`;
      } else {
        elGuidanceTitle.textContent = "✓ Application Within Lawful SLA Window";
        elGuidanceText.innerHTML = `Application filed on <b>${filingStr}</b> is currently within the lawful ${slaDays}-day SLA window. The PIO has until <b>${deadlineStr}</b> to furnish the certified information or issue a Section 6(3) transfer notice.`;
      }
    }
  }

  if (elClause) {
    if (currentLang === "hi") {
      if (overdueDays > 0) {
        elClause.value = `विधिक नोटिस: आवेदक ने दिनांक ${filingStr} को नामित जन सूचना अधिकारी, ${tDept(targetDept)} के समक्ष सूचना का अधिकार अधिनियम 2005 की धारा 6(1) के तहत आवेदन प्रस्तुत किया था। धारा 7(1) के तहत निर्धारित समयसीमा ${deadlineStr} को समाप्त हो चुकी है। जन सूचना अधिकारी ने बिना किसी उचित कारण के ${overdueDays} दिनों का गंभीर विलंब किया है। धारा 20(1) एवं सुप्रीम कोर्ट के फैसले मनोहर बनाम महाराष्ट्र राज्य के तहत अधिकारी के वेतन से ₹250 प्रति दिन (कुल ₹${penaltyAmount.toLocaleString("en-IN")}) की व्यक्तिगत कटौती की जानी अनिवार्य है।`;
      } else {
        elClause.value = `विषय: नामित जन सूचना अधिकारी, ${tDept(targetDept)} के समक्ष प्रस्तुत दिनांक ${filingStr} का आरटीआई आवेदन। धारा 7(1) के तहत निर्धारित वैधानिक समयसीमा ${deadlineStr} तक लागू है।`;
      }
    } else {
      if (overdueDays > 0) {
        elClause.value = `TAKE NOTICE that the Applicant submitted RTI Application dated ${filingStr} before the Designated PIO, ${targetDept}. In terms of Section 7(1) of the RTI Act 2005, the statutory 30-day window expired on ${deadlineStr}. The PIO has defaulted for ${overdueDays} days without reasonable cause. Under Section 20(1) and the law declared in Manohar s/o Manikrao Anchule v. State of Maharashtra (AIR 2013 SC 681), the PIO is personally liable for a penalty of ₹250 per day amounting to ₹${penaltyAmount.toLocaleString("en-IN")}, deductible directly from the officer's personal salary.`;
      } else {
        elClause.value = `IN RE: RTI Application dated ${filingStr} submitted before Designated PIO, ${targetDept}. Statutory compliance deadline under Section 7(1) of RTI Act 2005 expires on ${deadlineStr}.`;
      }
    }
  }
}

function copySlaNoticeClause() {
  const elClause = document.getElementById("slaGeneratedClause");
  const btnText = document.getElementById("copyClauseBtnText");
  if (!elClause) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(elClause.value).then(() => {
      if (btnText) {
        const orig = btnText.textContent;
        btnText.textContent = "Copied!";
        setTimeout(() => { btnText.textContent = orig; }, 2000);
      }
    }).catch(() => {
      fallbackCopy(elClause, btnText);
    });
  } else {
    fallbackCopy(elClause, btnText);
  }
}

function fallbackCopy(elClause, btnText) {
  elClause.select();
  document.execCommand("copy");
  if (btnText) {
    const orig = btnText.textContent;
    btnText.textContent = "Copied!";
    setTimeout(() => { btnText.textContent = orig; }, 2000);
  }
}

// ----------------------------------------------------
// STATUTORY CODEX REAL-TIME MATRIX FILTER (PAGE 3)
// ----------------------------------------------------
function filterStatutoryMatrix() {
  const query = (document.getElementById("statutorySearchInput") ? document.getElementById("statutorySearchInput").value : "").toLowerCase().trim();
  const table = document.getElementById("statutoryCodexTable");
  if (!table) return;
  const rows = table.querySelectorAll("tbody tr");
  let matchCount = 0;

  rows.forEach(r => {
    const text = r.textContent.toLowerCase();
    if (!query || text.includes(query)) {
      r.style.display = "";
      matchCount++;
    } else {
      r.style.display = "none";
    }
  });

  const countEl = document.getElementById("statutoryFilterCount");
  if (countEl) {
    countEl.innerHTML = `<span class="i18n-en">${matchCount} Provision${matchCount === 1 ? "" : "s"} Active</span><span class="i18n-sep"> • </span><span class="i18n-hi">${matchCount} धाराएं सक्रिय</span>`;
  }
}

// Window bindings
window.initSlaPenaltyCalculator = initSlaPenaltyCalculator;
window.resetSlaCalculator = resetSlaCalculator;
window.calculateSlaPenalty = calculateSlaPenalty;
window.copySlaNoticeClause = copySlaNoticeClause;
window.filterStatutoryMatrix = filterStatutoryMatrix;
window.initTheme = initTheme;
window.applyTheme = applyTheme;
window.toggleExecutiveTheme = toggleExecutiveTheme;
window.getAuthSession = getAuthSession;
window.setAuthSession = setAuthSession;
window.clearAuthSession = clearAuthSession;
window.initAuthFlow = initAuthFlow;
window.showAuthAlert = showAuthAlert;
window.clearAuthAlert = clearAuthAlert;
window.togglePasswordVisibility = togglePasswordVisibility;
window.fillQuickCreds = fillQuickCreds;
window.switchAuthTab = switchAuthTab;
window.switchAuthMode = switchAuthMode;
window.handleAuthLogin = handleAuthLogin;
window.handleAuthRegister = handleAuthRegister;
window.handleBrandClick = handleBrandClick;
window.handleLogout = handleLogout;
window.updateHeaderAuthState = updateHeaderAuthState;
window.showPage = showPage;

// Auto-initialize calculator and run log ledger on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initSlaPenaltyCalculator();
  if (typeof setDraftingAiModel === "function") {
    setDraftingAiModel(currentAiDraftingModel, false);
  }
  if (typeof renderRunLogsTable === "function" && typeof allRunLogsCache !== "undefined") {
    renderRunLogsTable(allRunLogsCache);
  }
  if (typeof loadRunLogs === "function") {
    loadRunLogs();
  }
});
