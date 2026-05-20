<div align="center">
  <img src="assets/logo-placeholder.png" alt="PharmaGuard AI Logo" width="150" />
  <h1>🛡️ PharmaGuard AI</h1>
  <p><strong>Transforming Counterfeit Medicine Detection into Autonomous Systemic Defense</strong></p>

  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Gemini API](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](https://ai.google.dev/)
  [![Antigravity](https://img.shields.io/badge/Antigravity-FF6B6B?style=for-the-badge&logo=codeigniter&logoColor=white)]()
</div>

<br />

---

## 📖 1. Project Overview
**PharmaGuard AI** is an enterprise-grade, multi-agent orchestration engine designed to instantly detect counterfeit, expired, or toxic medications, and autonomously execute system-wide containment actions. 

Instead of passively warning a single consumer, PharmaGuard AI actively blocks supply chains, alerts pharmacies, and drafts regulatory compliance reports in seconds—proving that Large Language Models can drive mission-critical, real-world execution.

---

## 🚨 2. Problem Statement
Every year, over **1 million people** lose their lives due to substandard and counterfeit medications. The current global pharmaceutical supply chain relies on manual, fragmented, and reactive reporting. If a toxic batch hits the market, it takes weeks to trace, recall, and issue warnings, costing thousands of lives.

---

## 💡 3. Solution Overview
PharmaGuard AI replaces reactive reporting with **active, autonomous mitigation**. By combining advanced computer vision (Gemini 2.0 Flash Vision), cross-referenced global ledger simulation, and agentic orchestration (Antigravity), our mobile application allows patients to scan their medication and instantly triggers a swarm of AI agents to investigate, formulate, and execute supply chain lockdowns and safety alerts.

---

## ✨ 4. Key Features
- **Visual Anomaly Detection:** Detects millimetric logo displacement, font discrepancies, and falsified packaging dates using Gemini Vision.
- **Autonomous Action Engine:** Executes regional inventory locks, pharmacy push-notifications, and authority escalations autonomously based on risk thresholds.
- **Immutable Audit Trails:** Cryptographically logs every AI decision, reasoning trace, and database state mutation for regulatory review.
- **Real-Time Dashboards:** Instant state transitions using Supabase `pg_notify` sockets to show real-time risk deltas (Before vs. After containment).

---

## 🧠 5. Agent Architecture
PharmaGuard relies on a swarm of specialized, parallel AI Agents:
1. **OCR & Vision Agent:** Extracts raw typography, batch numbers, and detects packaging anomalies.
2. **Verification Agent:** Cross-references extracted data against simulated GS1 ledgers and WHO/FDA recall databases.
3. **Risk Analysis Agent:** Formulates a Bayesian threat model, calculating a deterministic risk score (0-100%).
4. **Decision Agent:** Synthesizes containment strategies and proposes a dispatch checklist.
5. **Execution Agent:** Interfaces with Supabase Edge Functions to mutate databases and trigger physical world actions.

---

## 🔄 6. System Workflow
1. **Ingestion:** User scans a medicine package via the React Native mobile app.
2. **Analysis:** The image is sent to the AI swarm. OCR extracts text; Verification checks registries; Risk Analysis computes the threat level.
3. **Formulation:** A systemic containment protocol is drafted (e.g., *Quarantine batch B-998822*).
4. **Authorization:** The inspector/user slides to authorize dispatch.
5. **Execution:** Edge functions update inventory tables, send push notifications, and hit mock FDA API endpoints.
6. **Result:** Dashboard updates in real-time to reflect the plummeted community exposure risk.

---

## 🌌 7. Antigravity Orchestration
Our system utilizes **Antigravity** as the core orchestration layer. Antigravity acts as a reliable state machine that:
- Ensures idempotent execution of the Action Queue.
- Handles exponential backoff and retries for failed API calls.
- Coordinates the hand-offs between the multi-agent swarm.
- Persists the immutable reasoning traces to our Supabase backend.

---

## 🛠️ 8. Tech Stack
* **Frontend:** React Native, Expo, Zustand, Lucide Icons, NativeWind/Tailwind.
* **Backend:** Supabase (PostgreSQL), Supabase Edge Functions (Deno).
* **AI & Intelligence:** Gemini 2.0 Flash Vision API.
* **Orchestration:** Antigravity AI framework.

---

## 🔌 9. API Integrations
- **Gemini API:** Image ingestion, multi-modal reasoning, and structured output generation.
- **Supabase Realtime API:** PostgreSQL triggers pushing state transitions instantly to the React Native client.
- **Simulated FDA/GS1 APIs:** Custom local Node.js endpoints mocking external regulatory body webhooks.

---

## 📸 10. Screenshots
<div align="center">
  <table>
    <tr>
      <td><img src="assets/screenshots/scan_placeholder.png" alt="Scan Screen" width="200"/></td>
      <td><img src="assets/screenshots/dashboard_placeholder.png" alt="Risk Dashboard" width="200"/></td>
      <td><img src="assets/screenshots/actions_placeholder.png" alt="Action Formulator" width="200"/></td>
      <td><img src="assets/screenshots/simulation_placeholder.png" alt="Simulation Results" width="200"/></td>
    </tr>
    <tr>
      <td align="center"><b>1. Package Scan</b></td>
      <td align="center"><b>2. AI Risk Dashboard</b></td>
      <td align="center"><b>3. Action Dispatch</b></td>
      <td align="center"><b>4. Execution Ledger</b></td>
    </tr>
  </table>
</div>

---

## 🚀 11. Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/your-team/pharmaguard-mobile.git
cd pharmaguard-mobile
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

**4. Start the Mock External APIs (FDA server)**
```bash
npm run mock:fda
```

**5. Run the Mobile App**
```bash
npx expo start
```
*(Scan the QR code with Expo Go on your physical device, or press `i` / `a` to open in a simulator).*

---

## 🔮 12. Future Improvements
- **Hardware Integration:** Connect the app to Bluetooth-enabled local pharmacy point-of-sale systems to physically block barcode scans at checkout.
- **Blockchain Ledgers:** Migrate the Supabase Audit Trail to an immutable public blockchain (like Ethereum or Hyperledger) for absolute global transparency.
- **Predictive Modeling:** Train models on outbreak clusters to proactively dispatch medications to nearby hospitals *before* adverse events peak.

---

## 👥 13. Team Contributions
- **[Team Member 1 Name]** - Lead AI Architect & Orchestration
- **[Team Member 2 Name]** - Frontend Developer & React Native Specialist
- **[Team Member 3 Name]** - Backend Engineer & Supabase Administrator
- **[Team Member 4 Name]** - UI/UX Designer & Product Strategist

<br />
<div align="center">
  <b>Built with ❤️ at [Hackathon Name] 2026</b>
</div>
