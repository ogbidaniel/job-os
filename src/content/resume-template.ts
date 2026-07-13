/**
 * The user's base LaTeX resume template. Category resumes are seeded with
 * this and then tailored per job category in the Resume Studio.
 * String.raw keeps every backslash literal.
 */
export const DEFAULT_RESUME_TEMPLATE = String.raw`\documentclass[letterpaper,11pt]{article}

\usepackage{mathptmx} % Times New Roman style
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}

% Margins
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-0.6in}
\addtolength{\textheight}{1.2in}

\setlength{\tabcolsep}{0in}
\raggedbottom
\raggedright

\titleformat{\section}
{\vspace{-6pt}\scshape\large}
{}{0em}{}[\titlerule \vspace{-6pt}]

\newcommand{\resumeRole}[3]{
  \noindent\textbf{#1} \textit{--- #2} \hfill #3 \\[-2pt]
}

\begin{document}

% ---------- HEADER ----------
\begin{center}
{\Large \textbf{Daniel Ogbuigwe}} \\
\small 346--652--0105 $|$ \href{mailto:ogbuigwed@gmail.com}{ogbuigwed@gmail.com} $|$
\href{https://www.linkedin.com/in/daniel-ogbuigwe}{linkedin.com/in/daniel-ogbuigwe} $|$
\href{https://github.com/ogbidaniel}{github.com/ogbidaniel}
\end{center}

% ---------- SUMMARY ----------
\section{Summary}
\small{
\textit{[ROLE-SPECIFIC SUMMARY --- 2--3 lines. M.S. Computer Science researcher/engineer with hands-on experience across cloud/IoT systems, backend data pipelines, and applied machine learning (computer vision, forecasting). Swap this paragraph's framing per target role before sending.]}
}

% ---------- TECHNICAL SKILLS ----------
\section{Technical Skills}
\begin{itemize}[leftmargin=0.15in, itemsep=1pt, parsep=0pt]
\small{
\item \textbf{Languages:} Python, C++, SQL, CUDA, Bash, JavaScript
\item \textbf{ML \& AI:} PyTorch, TensorFlow, Scikit-learn, YOLOv8/YOLO12, OpenCV, LSTM forecasting
\item \textbf{Data:} Pandas, NumPy, Matplotlib, time-series analysis, ETL pipeline design
\item \textbf{Cloud \& Infra:} AWS (Solutions Architect -- Associate, Cloud Practitioner), Google Cloud, Git/Linux, Docker
\item \textbf{Systems \& IoT:} Raspberry Pi sensor networks, I2C/ADC interfacing, Tailscale VPN, remote GPU compute
}
\end{itemize}

% ---------- EXPERIENCE ----------
\section{Experience}

\resumeRole{Graduate Research Assistant}{Prairie View A\&M University}{Jan 2025 -- Present}
\begin{itemize}[leftmargin=0.2in, itemsep=1pt, parsep=0pt]
\small{
\item Designed and deployed a distributed IoT sensor network (Raspberry Pi, ADS1115 ADC) monitoring CO2, CH4, NH3, temperature, and humidity across live facilities; built Python pipelines converting raw sensor streams into structured, analyzable datasets.
\item Trained an LSTM model (Scikit-learn, TensorFlow) to forecast next-day environmental conditions from historical time-series sensor data.
\item Built and evaluated multi-camera YOLOv8/YOLO12 computer vision pipelines achieving 0.980/0.981 box/mask mAP@0.5, including multi-view identity tracking and camera calibration tooling.
\item Instructor of record for an undergraduate database systems course; presented research at a national AI-in-agriculture conference.
}
\end{itemize}

\resumeRole{Data Scientist}{Debyl Ltd (NNPC/Shell Contract)}{Sep 2024 -- Dec 2024}
\begin{itemize}[leftmargin=0.2in, itemsep=1pt, parsep=0pt]
\small{
\item Built automated Python data pipelines (Pandas, NumPy) and Matplotlib dashboards tracking industrial project metrics, raising completion-tracking visibility from 61\% to 90\% and directly informing management resource-allocation decisions.
}
\end{itemize}

\resumeRole{Telecommunications Network Analyst}{Huawei Technologies}{May 2022 -- Apr 2023}
\begin{itemize}[leftmargin=0.2in, itemsep=1pt, parsep=0pt]
\small{
\item Built Python automation to parse system logs and correlate alarms across a national telecom network, cutting mean time to resolution by 40\% while sustaining 98\% uptime; resolved 1,100+ high-priority incidents via cross-functional root-cause analysis.
}
\end{itemize}

\resumeRole{Network Operations Center Engineer}{I-Engineering, Inc.}{Nov 2021 -- May 2022}
\begin{itemize}[leftmargin=0.2in, itemsep=1pt, parsep=0pt]
\small{
\item Monitored telecom infrastructure across four Nigerian regions; improved reporting accuracy through better data collection and transformation processes.
}
\end{itemize}

% ---------- EDUCATION ----------
\section{Education}
\begin{itemize}[leftmargin=0.15in, itemsep=1pt, parsep=0pt]
\small{
\item \textbf{Prairie View A\&M University} \hfill Expected Dec 2026 \\
M.S., Computer Science --- GPA: 3.66/4.0

\item \textbf{Babcock University} \hfill 2024 \\
Postgraduate Diploma, Computer Science --- GPA: 4.25/5.0

\item \textbf{Baze University} \hfill Oct 2021 \\
B.Eng., Mechanical Engineering --- WES GPA: 3.36/4.0
}
\end{itemize}

% ---------- PUBLICATIONS & PROJECTS ----------
\section{Publications \& Projects}
\begin{itemize}[leftmargin=0.15in, itemsep=1pt, parsep=0pt]
\small{
\item \textbf{Automatic Speech Recognition for the Ika Language} --- arXiv, 2024. Fine-tuned wav2vec2 (PyTorch, NVIDIA NeMo) to build the first ASR system for an under-resourced language.
\item \textbf{Automatic Characterization of Dairy Cow Behavior using Computer Vision} --- IEEE Access, under review. YOLOv8 model at 96\% behavioral classification accuracy.
\item \textbf{WasteWiz} --- 2nd place, Prairie View Ignite Hackathon. Real-time waste classification app (YOLOv8 + Flask REST API).
}
\end{itemize}

\end{document}
`;
