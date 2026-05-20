# 🎤 PharmaGuard AI: 5-Minute Hackathon Demo Script

> **Tone:** Confident, technical, innovation-focused, and concise.  
> **Goal:** Maximize judge engagement by highlighting autonomy, orchestration, and real-world impact.

---

## ⏱️ [0:00 - 0:45] 1. The Problem & Introduction
**(Presenter on stage. Screen shows the splash screen of PharmaGuard AI.)**

**Presenter:**
"Every year, over 1 million people lose their lives due to counterfeit and substandard medicines. The current global supply chain relies on reactive, fragmented manual reporting. If a toxic batch of medication hits a pharmacy shelf, it takes weeks for authorities to trace it, recall it, and warn the public.

Today, we are changing that. 

Judges, meet **PharmaGuard AI**—an autonomous, multi-agent orchestration engine that transforms passive counterfeit detection into **active, real-time systemic defense.** We aren’t just identifying bad medicine; we are letting AI instantly lock down the supply chain."

---

## ⏱️ [0:45 - 1:30] 2. User Workflow & 3. Agent Orchestration
**(Screen mirrors the mobile app. Presenter holds up a medicine box and initiates a scan.)**

**Presenter:**
"Let me show you how it works. I’m scanning a box of medication using our React Native mobile client. 

Behind the scenes, we aren't just calling a single API. We are triggering an **Antigravity Orchestration Workflow**. 

*(App transitions to the 'Under Review' state, showing the Agent Trace timeline.)*

Watch the timeline. What you are seeing is a swarm of specialized AI agents working in parallel:
1. First, the **OCR Agent** extracts typography, batch numbers, and detects millimetric logo displacements using Gemini Vision.
2. Next, the **Verification Agent** checks this data against simulated GS1 ledgers and FDA databases. 
3. Finally, the **Risk Analysis Agent** formulates a Bayesian threat model. 

In less than 3 seconds, the agents have reached consensus."

---

## ⏱️ [1:30 - 2:30] 4. AI Reasoning & The Threat
**(Screen transitions to the Dashboard, showing a red "CRITICAL DANGER" Risk Gauge and Discrepancy Logs.)**

**Presenter:**
"The result? This batch is flagged as **Lethal**. 

Look at the AI reasoning trace on the dashboard: The agents caught a 5.2mm logo displacement and a falsified expiration date. But the AI didn't stop at visual anomalies. It cross-referenced the batch number and discovered a match with a WHO recall list for highly toxic *diethylene glycol* contamination.

In a traditional system, the app would just tell the user 'Do not consume.' But PharmaGuard AI is an **Action Engine**. It doesn't just inform; it acts."

---

## ⏱️ [2:30 - 3:30] 5. Action Simulation & 7. Antigravity Workflow
**(Presenter taps "VIEW SYSTEMIC CONTAINMENT PROTOCOLS", moving to the Action Formulator screen.)**

**Presenter:**
"The **Decision Agent** has formulated a systemic containment protocol. It proposes four actions: blocking regional inventory, alerting local pharmacists, auto-filing an FDA escalation report, and pushing a safety alert to consumers.

I will now authorize the dispatch.

*(Presenter swipes the slider. The app transitions to the Simulation Loading Screen.)*

This triggers our **Supabase Edge Functions**, orchestrated by **Antigravity**. Antigravity acts as our reliable state machine. It queues the actions, executes them idempotently, and guarantees delivery. If an API fails, Antigravity handles the exponential backoff and retries. 

*(Screen shows the mock FDA server receiving the payload in terminal, and the mobile UI instantly updating via pg_notify realtime sockets.)*

Because we are using Supabase realtime channels, the UI updates instantly as each edge function successfully alters the database state."

---

## ⏱️ [3:30 - 4:15] 6. Before vs After System State & 8. Audit Trails
**(Screen shows the Simulation Results Dashboard with the sliding Before vs After metric bars.)**

**Presenter:**
"Let's look at the delta. 

Before intervention, community exposure risk was at 95%. Through autonomous inventory blocking and instant pharmacy notifications, **exposure risk plummets to 2%**. 

Furthermore, every single step—from the LLM's thought process to the database state mutation—is cryptographically hashed and logged into an **immutable Audit Trail**. Regulators don't have to guess what the AI did; they have a perfect, verifiable ledger of the exact state changes."

---

## ⏱️ [4:15 - 5:00] 9. Closing Impact Statement
**(Presenter locks the phone and looks directly at the judges. The screen shows the final "PharmaGuard AI" logo.)**

**Presenter:**
"PharmaGuard AI proves that large language models are no longer confined to chatbots. By combining React Native, Supabase Edge Functions, and Antigravity Orchestration, we have built an **Autonomous Action Simulation Engine** capable of enterprise-grade execution.

We took a process that takes weeks and costs lives, and reduced it to 5 seconds of autonomous, traceable AI action. 

The future of public health isn't just detecting anomalies. It's neutralizing them the moment they appear. 

Thank you."
