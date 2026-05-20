# Implementation Plan — PharmaGuard AI Mobile Client

This implementation plan outlines the steps to build a high-fidelity, fully functioning **React Native + Expo** mobile prototype for **PharmaGuard AI** inside the workspace `c:\Users\Administrator\Desktop\Hackathon`. 

To maximize hackathon speed, visual excellence, and ease of demonstration, the app will incorporate a **Local Agentic Simulation Engine**. This allows the 6-agent pipeline (OCR $\rightarrow$ Verification $\rightarrow$ Risk $\rightarrow$ Decision $\rightarrow$ Simulation $\rightarrow$ Notification) to run fully in-app using pre-configured mock package datasets, providing a real-time terminal progress logger and before/after metrics screens out-of-the-box *even without external Firebase connectivity*, while remaining fully structured and coded to link with Firestore using active listeners.

---

## User Review Required

> [!IMPORTANT]
> **Key Implementation Pillars:**
> 1. **Cross-Platform Vanilla Stylesheets**: We will build custom styled layouts utilizing React Native's core `StyleSheet` styling, incorporating deep charcoal velvet linear gradients (`#090D10` to `#121A21`) and high-end glassmorphic border elements (`rgba(255, 255, 255, 0.06)`).
> 2. **Mock Ingestion Selector**: We will build an interactive "Package Emulator Selector" directly inside the `UploadScreen` camera frame. This allows you to choose from 4 scenarios (Safe Medicine, Expired Serial, Counterfeit Packaging, Toxic Fillers) during a live demo to instantly run the whole multi-agent execution pipeline.
> 3. **Zustand & Live Firestore Bridge**: We will write a complete, fully functional Zustand state store and custom React hooks that can be toggled between **Local Simulation Mode** and **Live Firestore Web-Socket Mode** seamlessly.

---

## Proposed Changes

We will create a structured React Native Expo project at the root of the workspace directory.

### Root Directory Configurations

#### [NEW] [package.json](file:///c:/Users/Administrator/Desktop/Hackathon/package.json)
Configure the npm package manifest containing dependencies for Expo SDK (React Native, Expo, React Navigation, React Native SVG, Zustand, Lucide Icons, Expo Linear Gradient).

#### [NEW] [app.json](file:///c:/Users/Administrator/Desktop/Hackathon/app.json)
Standard Expo configuration schema.

#### [NEW] [App.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/App.tsx)
Main app entry point registering navigation containers and themes.

---

### Core Styles & Utilities

#### [NEW] [colors.ts](file:///c:/Users/Administrator/Desktop/Hackathon/src/styles/colors.ts)
Core brand color definitions (Midnight background, Emerald alert accents, Danger orange/crimson).

#### [NEW] [theme.ts](file:///c:/Users/Administrator/Desktop/Hackathon/src/styles/theme.ts)
Layout constants and text sizes.

#### [NEW] [firebase.ts](file:///c:/Users/Administrator/Desktop/Hackathon/src/config/firebase.ts)
Firebase modular configuration file ready to bind real keys.

---

### Global State Store & Sync Services

#### [NEW] [useScanStore.ts](file:///c:/Users/Administrator/Desktop/Hackathon/src/store/useScanStore.ts)
Zustand global store managing scan collections, current active scan execution traces, and pre-packaged simulation scenarios.

#### [NEW] [useFirestoreLive.ts](file:///c:/Users/Administrator/Desktop/Hackathon/src/hooks/useFirestoreLive.ts)
Real-time Firebase listener synchronization hook.

#### [NEW] [agentSimulator.ts](file:///c:/Users/Administrator/Desktop/Hackathon/src/api/agentSimulator.ts)
The engine driving local multi-agent simulations step-by-step with synthetic timing.

---

### Premium Reusable UI Elements

#### [NEW] [GlassCard.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/components/GlassCard.tsx)
High-end semi-transparent backdrop panel.

#### [NEW] [PrimaryButton.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/components/PrimaryButton.tsx)
Pulsing glow interaction button.

#### [NEW] [RiskGauge.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/components/RiskGauge.tsx)
Animated, circular SVG Authenticity Risk Speedometer.

#### [NEW] [TimelineStep.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/components/TimelineStep.tsx)
Vertical agentic timeline indicator with pulsing state icons.

#### [NEW] [ActionCard.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/components/ActionCard.tsx)
Accordion alert message detail card.

---

### Core View Screen Stack

#### [NEW] [AppNavigator.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/navigation/AppNavigator.tsx)
Navigation structure wrapping Stack and Tab views with route types.

#### [NEW] [SplashScreen.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/screens/SplashScreen.tsx)
Glassmorphic pulsing logo fade entry.

#### [NEW] [HomeScreen.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/screens/HomeScreen.tsx)
Core cockpit showing network safety ratings and the scan trigger.

#### [NEW] [UploadScreen.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/screens/UploadScreen.tsx)
Snapping viewport showing camera grids and the interactive Scenario selector.

#### [NEW] [OcrScreen.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/screens/OcrScreen.tsx)
Live terminal log stream rendering multi-agent pipelines dynamically.

#### [NEW] [DashboardScreen.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/screens/DashboardScreen.tsx)
Speedometer risk assessment dashboard showing discrepancy panels.

#### [NEW] [RecommendationScreen.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/screens/RecommendationScreen.tsx)
Formulated alerts checklist and the Human-in-the-Loop approval slider.

#### [NEW] [SimulationScreen.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/screens/SimulationScreen.tsx)
Before vs. After comparison charts and block hashing previews.

#### [NEW] [NotificationScreen.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/screens/NotificationScreen.tsx)
Historical security logs panel.

#### [NEW] [HistoryScreen.tsx](file:///c:/Users/Administrator/Desktop/Hackathon/src/screens/HistoryScreen.tsx)
Searchable audits archive and expandable trace log viewer.

---

## Verification Plan

### Automated Build Verification
1.  **Dependency Assembly**: Run `npm install` inside the workspace to compile all packages.
2.  **Dev Server Validation**: Propose running `npx expo start` to ensure the project runs seamlessly.
3.  **Local Web Compilation**: Propose starting `npx expo start --web` (if standard web configs exist) to inspect and verify the screens on localhost web browsers.

### Manual Presentation Verification
1.  Launch the application in simulator or web browser.
2.  Snaps the visual interface through `UploadScreen`, select **Scenario C: Counterfeit Packaging**, and observe the live multi-agent terminal logs streaming in the `OcrScreen`.
3.  Ensure that `DashboardScreen` displays the high-risk orange speedometer dial (68%) and that the `SimulationScreen` calculates the before vs after systemic risk dropping successfully.
