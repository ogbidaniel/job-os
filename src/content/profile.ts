/**
 * THE USER'S PROFILE — hard-coded on purpose. Job OS is a single-user
 * tool; this file is the source of truth for Daniel's career facts.
 * Edit here (not in a database) when facts change.
 * Last synced with the master career document: July 2026.
 */

export const PROFILE_DETAILS = {
  fullName: "Daniel Ogbuigwe",
  headline:
    "M.S. Computer Science researcher — applied AI/ML, IoT systems, computer vision",
  location: "Cypress, TX (Houston area) / Prairie View, TX",
  email: "ogbuigwed@gmail.com",
  phone: "346-652-0105",
  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/daniel-ogbuigwe" },
    { label: "GitHub", url: "https://github.com/ogbidaniel" },
    { label: "Portfolio", url: "https://danielogbuigwe.com" },
    {
      label: "Chords (jazz piano app)",
      url: "https://danielogbuigwe.com/chords",
    },
  ],
} as const;

export const PROFILE_SUMMARY =
  "Interdisciplinary Computer Science graduate researcher (M.S., Prairie View A&M University) with an undergraduate foundation in Mechanical Engineering. Spans applied AI/ML research (IoT sensor systems, computer vision, low-resource speech recognition), full-stack engineering, and prior industry experience in telecommunications network operations and heavy-industrial project engineering. Known for translating research into working systems — sensor arrays, vision pipelines, forecasting models — and for concise, formula-forward technical communication. Also instructs an undergraduate database course and mentors on AI adoption in a volunteer/community capacity.";

export interface ExperienceEntry {
  kind: "Work" | "Education" | "Project" | "Volunteer" | "Other";
  title: string;
  organization?: string;
  location?: string;
  dates?: string;
  bullets: string[];
}

export const EXPERIENCE_ENTRIES: readonly ExperienceEntry[] = [
  {
    kind: "Work",
    title: "Graduate Research Assistant",
    organization: "Prairie View A&M University — Precision Agriculture and IoT Labs",
    location: "Prairie View, TX",
    dates: "Jan 2025 – Present",
    bullets: [
      "Designed and deployed an IoT-based system with distributed sensors continuously monitoring environmental parameters (CO₂, CH₄, NH₃, temperature, humidity) in poultry facilities.",
      "Wrote Python scripts to process and analyze time-series sensor data, identifying diurnal patterns and correlations between environmental conditions and livestock welfare indicators.",
      "Trained an LSTM neural network (scikit-learn, TensorFlow) to forecast next-day gas emission levels and temperature fluctuations from historical IoT data.",
      "Built computer vision pipelines (YOLOv8/YOLO12) to classify poultry behavior patterns (feeding, resting, distress) from dual-camera video streams; developed multi-view identity tracking and calibration tooling.",
      "Developed an experimental computer vision system for in-ovo egg sexing using hyperspectral imaging, aimed at preventing day-one culling of male chicks.",
      "Instructor of record for COMP 3395 (undergraduate database course).",
    ],
  },
  {
    kind: "Work",
    title: "Data Scientist",
    organization: "Debyl Ltd — NNPC and Shell Plc Contract, Cryogenic Plant Construction Project",
    location: "Port Harcourt, Nigeria",
    dates: "Sep 2024 – Dec 2024",
    bullets: [
      "Built automated data pipelines using Python (Pandas, NumPy) to track welding joints and completion metrics for a cryogenic High Purity Nitrogen Plant, raising project-completion visibility from 61% to 90%.",
      "Developed interactive dashboards with Matplotlib for real-time visualization of welding task bottlenecks, informing project-management resource-allocation decisions.",
      "Served as on-site Mechanical Engineer on the same project: planned and led hydrotests and spark tests, assisted project management with progress tracking and reporting, produced AutoCAD platform/ladder and isometric drawings.",
    ],
  },
  {
    kind: "Work",
    title: "Telecommunications Network Analyst",
    organization: "Huawei Technologies — Network Operations Center",
    location: "Lagos, Nigeria",
    dates: "May 2022 – Apr 2023",
    bullets: [
      "Monitored and analyzed real-time telemetry from MTN's national telecommunications infrastructure (South-Eastern region) using Huawei's cloud-native OWS platform.",
      "Developed Python automation scripts to parse system logs and correlate alarm patterns, reducing mean time to resolution for critical incidents by 40% and maintaining 98% network uptime.",
      "Managed resolution of 1,100+ high-priority incident alarms through root-cause analysis and cross-functional collaboration.",
    ],
  },
  {
    kind: "Work",
    title: "Network Operations Center Engineer",
    organization: "I-Engineering, Inc.",
    location: "Remote",
    dates: "Nov 2021 – May 2022",
    bullets: [
      "Monitored telecommunication infrastructure across multiple Nigerian regions (Niger, Kano, Bauchi, Gombe).",
      "Enhanced reporting accuracy by improving data collection, cleaning, and transformation processes.",
    ],
  },
  {
    kind: "Work",
    title: "Logistics & Operations Engineer Intern",
    organization: "Strides Energy & Maritime LLC",
    location: "Niger-Delta, Nigeria",
    dates: "Jul 2019 – Dec 2019",
    bullets: [
      "Managed logistics and material flow for two pipeline development projects in riverine regions.",
      "Streamlined inventory management, reducing lead times and optimizing resource allocation.",
    ],
  },
  {
    kind: "Work",
    title: "Mechanical Engineer Intern",
    organization: "Cakasa Nigeria Company LLC",
    location: "Lagos, Nigeria",
    dates: "Sep 2019 – Dec 2019",
    bullets: [
      "Assisted the Lead QA/QC Engineer on an LPG storage tank construction project: tank assembly, joint welding, non-destructive weld testing.",
    ],
  },
  {
    kind: "Education",
    title: "M.S. Computer Science — GPA 3.66/4.0",
    organization: "Prairie View A&M University",
    location: "Prairie View, TX",
    dates: "Jan 2025 – Dec 2026 (expected)",
    bullets: [
      "Graduate Research Assistant in Dr. Ahmed Abdelmoamen Ahmed's lab (NSF-funded AI-IoT systems for poultry welfare monitoring).",
      "Coursework: Data Mining, Database Systems, traffic sign recognition (ELEG 6318).",
    ],
  },
  {
    kind: "Education",
    title: "Post-Graduate Diploma, Computer Science — GPA 4.25/5.0",
    organization: "Babcock University",
    location: "Ilishan-Remo, Nigeria",
    dates: "Jan 2023 – Jul 2024",
    bullets: [
      "Assisted three graduate researchers with dataset cleaning and preparation; trained custom models using AWS.",
    ],
  },
  {
    kind: "Education",
    title: "B.Eng. Mechanical Engineering — WES GPA 3.36/4.0",
    organization: "Baze University",
    location: "Abuja, Nigeria",
    dates: "Sep 2016 – Oct 2021",
    bullets: [
      "Built a Tronxy FDM 3D printer for undergraduate research.",
      "SRC Senator, Faculty of Engineering (elected student leadership).",
    ],
  },
  {
    kind: "Project",
    title: "Jazz Piano Practice Web App",
    dates: "Ongoing",
    bullets: [
      "Web MIDI integration for real-time practice feedback (danielogbuigwe.com/chords).",
    ],
  },
  {
    kind: "Project",
    title: "Custom Graphics Renderer (C++)",
    dates: "2025",
    bullets: [
      "Graphics rendering engine implementing rasterization, transformation pipelines, and shading from scratch.",
    ],
  },
  {
    kind: "Project",
    title: "WasteWiz — Smart Waste Classification System",
    dates: "Feb 2025",
    bullets: [
      "2nd place, Prairie View Ignite Hackathon: real-time waste classification via fine-tuned YOLOv8 behind a Flask REST API.",
    ],
  },
  {
    kind: "Project",
    title: "12-Week Self-Directed Compiler & OS Build Project (C++)",
    bullets: [
      "Self-guided systems-programming curriculum with video/blog content; voice-dataset-collection component for a voice-cloning sub-project.",
    ],
  },
  {
    kind: "Project",
    title: "Home ML Infrastructure",
    bullets: [
      "Linux workstation (RTX 5070) + MacBook via Tailscale VPN and FastAPI for remote GPU access; native Windows C/C++/CUDA environment (MSVC, CUDA Toolkit, Nsight).",
    ],
  },
  {
    kind: "Volunteer",
    title: "River of Life AI Taskforce",
    bullets: [
      "Church-based AI adoption taskforce; helped organize an AI-powered video resource library.",
    ],
  },
  {
    kind: "Other",
    title: "Family Poultry Farm (Agbor, Delta State, Nigeria)",
    bullets: [
      "Long-standing family agricultural asset; building toward an agri-tech platform applying current CS/AI research to farm automation.",
    ],
  },
];

export interface EvidenceLink {
  kind: "Paper" | "Certificate" | "Presentation" | "Award" | "Link";
  title: string;
  source?: string;
  url?: string;
  note?: string;
}

export const EVIDENCE_LINKS: readonly EvidenceLink[] = [
  {
    kind: "Paper",
    title: "Automatic Speech Recognition for the Ika Language",
    source: "arXiv, 2024",
    url: "https://doi.org/10.48550/arXiv.2410.00940",
    note: "First ASR system for the under-resourced Ika language (wav2vec2, PyTorch, NVIDIA NeMo).",
  },
  {
    kind: "Paper",
    title: "Automatic Characterization of Dairy Cow Behavior using Computer Vision",
    source: "IEEE Access — under review",
    note: "YOLOv8 behavioral classification at 96% accuracy for livestock welfare.",
  },
  {
    kind: "Paper",
    title: "Poultry Gas Emissions & Environmental Monitoring",
    source: "In progress — target MDPI/AgriEngineering",
    note: "Three-pen Raspberry Pi sensor array; Chlorella supplementation study.",
  },
  {
    kind: "Paper",
    title: "Poultry-Vision: Multi-View Computer Vision for Poultry Behavior Inference",
    source: "In progress",
    note: "Dual-camera per-pen system; 0.980/0.981 box/mask mAP@0.5.",
  },
  {
    kind: "Certificate",
    title: "AWS Certified Solutions Architect – Associate",
    source: "AWS",
  },
  {
    kind: "Certificate",
    title: "AWS Certified Cloud Practitioner",
    source: "AWS",
  },
  {
    kind: "Presentation",
    title: "2026 AI in Agriculture Conference",
    source: "NC State University",
    note: "Represented PVAMU Computer Science Department and Poultry Center.",
  },
  {
    kind: "Award",
    title: "2nd place — Prairie View Ignite Hackathon (WasteWiz)",
    source: "Feb 2025",
  },
  {
    kind: "Link",
    title: "Jazz piano practice app",
    url: "https://danielogbuigwe.com/chords",
    source: "Personal site",
  },
];

const TECHNICAL_SKILLS =
  "Languages: Python, C++, SQL, CUDA, Bash, HTML/CSS/JavaScript. " +
  "ML/AI: PyTorch, TensorFlow, scikit-learn, YOLOv8/YOLO12, SAM 2, wav2vec2 (NVIDIA NeMo), OpenCV. " +
  "Data: Pandas, NumPy, Matplotlib, dataset curation, time-series analysis, LSTM forecasting. " +
  "Cloud/Infra: AWS (Solutions Architect level), Google Cloud, serverless, Git/Linux, Docker. " +
  "Hardware/IoT: Raspberry Pi sensor arrays, ADS1115 ADC/I2C, gas sensors, multi-camera calibration rigs. " +
  "Other: AutoCAD, LaTeX, technical writing.";

function buildProfileContext(): string {
  const lines: string[] = [
    `NAME: ${PROFILE_DETAILS.fullName}`,
    `HEADLINE: ${PROFILE_DETAILS.headline}`,
    `LOCATION: ${PROFILE_DETAILS.location}`,
    `SUMMARY: ${PROFILE_SUMMARY}`,
    `TECHNICAL SKILLS: ${TECHNICAL_SKILLS}`,
    "",
    "EXPERIENCE:",
  ];
  for (const entry of EXPERIENCE_ENTRIES) {
    const header = [
      `- [${entry.kind.toUpperCase()}] ${entry.title}`,
      entry.organization ? `at ${entry.organization}` : null,
      entry.dates ? `(${entry.dates})` : null,
    ]
      .filter(Boolean)
      .join(" ");
    lines.push(header);
    for (const bullet of entry.bullets) lines.push(`  * ${bullet}`);
  }
  lines.push("", "EVIDENCE (verifiable artifacts):");
  for (const item of EVIDENCE_LINKS) {
    lines.push(
      [
        `- [${item.kind.toUpperCase()}] ${item.title}`,
        item.source ? `(${item.source})` : null,
      ]
        .filter(Boolean)
        .join(" "),
    );
    if (item.note) lines.push(`  ${item.note}`);
    if (item.url) lines.push(`  url: ${item.url}`);
  }
  return lines.join("\n");
}

/** Precompiled candidate context for AI fit scoring (and future drafting). */
export const PROFILE_CONTEXT = buildProfileContext();
