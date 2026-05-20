# PharmaGuard AI — React Native + Expo Mobile App Architecture

This document specifies the complete mobile client architecture for **PharmaGuard AI** built with React Native and Expo. It provides the structured schemas, navigation architectures, lightweight state stores, and Firebase service layers designed for rapid, high-fidelity hackathon execution.

---

## 1. Directory & Monorepo Folder Structure

```text
pharmaguard-mobile/
├── package.json
├── tsconfig.json
├── App.tsx                      # Entry Point
├── app.json                     # Expo Settings (SDK 50+)
├── src/
│   ├── api/                     # External Mocks & REST Client
│   │   ├── fdaClient.ts
│   │   └── gs1Client.ts
│   ├── components/              # Reusable UI Elements (Midnight Glass)
│   │   ├── GlassCard.tsx        # Blur card shell
│   │   ├── RiskGauge.tsx        # Circular SVG Risk Indicator
│   │   ├── ActionCard.tsx       # Interactive response item
│   │   ├── TimelineStep.tsx     # Vertical execution indicator
│   │   └── PrimaryButton.tsx    # Neon accented clickables
│   ├── config/                  # Initializations
│   │   └── firebase.ts
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useFirestoreLive.ts  # Real-time scan synchronizer
│   │   └── useCameraPrep.ts
│   ├── navigation/              # Navigation Routings
│   │   ├── AppNavigator.tsx
│   │   └── types.ts             # Route TypeScript definitions
│   ├── screens/                 # Mobile Screen Views
│   │   ├── SplashScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── UploadScreen.tsx
│   │   ├── OcrScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── RecommendationScreen.tsx
│   │   ├── SimulationScreen.tsx
│   │   ├── NotificationScreen.tsx
│   │   └── HistoryScreen.tsx
│   ├── store/                   # Zustand Global States
│   │   └── useScanStore.ts      # Active scan, timeline state & history
│   └── styles/                  # Theme variables & Tailwind styles
│       ├── colors.ts
│       └── theme.ts
```

---

## 2. Navigation Architecture & Route Typings

We utilize React Navigation v6 with Stack and Bottom-Tab routing structures. The route definitions are strictly typed to enforce safety across screens.

### `src/navigation/types.ts`
```typescript
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Splash: undefined;
  MainApp: undefined; // Wrapper for Bottom Tabs
  UploadMedicine: undefined;
  OcrAnalysis: { scanId: string };
  RiskDashboard: { scanId: string };
  ActionRecommendation: { scanId: string };
  ActionSimulation: { scanId: string };
  LogsHistory: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  History: undefined;
  Notifications: undefined;
};

export type NavigationProp<RouteName extends keyof RootStackParamList> = StackNavigationProp<
  RootStackParamList,
  RouteName
>;

export type RoutePropType<RouteName extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  RouteName
>;
```

### `src/navigation/AppNavigator.tsx`
```typescript
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList, BottomTabParamList } from './types';

// Screens
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import OcrScreen from '../screens/OcrScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import SimulationScreen from '../screens/SimulationScreen';
import NotificationScreen from '../screens/NotificationScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#090D10',
          borderTopColor: 'rgba(255,255,255,0.06)',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#00E676', // Emerald Glow
        tabBarInactiveTintColor: '#8E9AA6',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#090D10' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainApp" component={BottomTabNavigator} />
        <Stack.Screen name="UploadMedicine" component={UploadScreen} />
        <Stack.Screen name="OcrAnalysis" component={OcrScreen} />
        <Stack.Screen name="RiskDashboard" component={DashboardScreen} />
        <Stack.Screen name="ActionRecommendation" component={RecommendationScreen} />
        <Stack.Screen name="ActionSimulation" component={SimulationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 3. Zustand State Management Store

Zustand provides boilerplate-free state management, which is ideal for hackathons. We use a single store to manage active scanning metadata, timeline stages, history records, and system settings.

### `src/store/useScanStore.ts`
```typescript
import { create } from 'zustand';

export interface ScanState {
  currentScanId: string | null;
  activeScanData: any | null;
  scanHistory: any[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setScanId: (scanId: string | null) => void;
  updateActiveScan: (data: any) => void;
  appendHistory: (scan: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
  resetScan: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  currentScanId: null,
  activeScanData: null,
  scanHistory: [],
  isLoading: false,
  error: null,

  setScanId: (scanId) => set({ currentScanId: scanId }),
  updateActiveScan: (data) => set({ activeScanData: data }),
  appendHistory: (scan) => set((state) => ({ 
    scanHistory: [scan, ...state.scanHistory.filter((s) => s.id !== scan.id)] 
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err }),
  resetScan: () => set({ currentScanId: null, activeScanData: null, error: null, isLoading: false }),
}));
```

---

## 4. Firebase API & Real-Time Sync Hook

To capture the "Autonomous Multi-Agent Progress" visual flow, we set up an active WebSocket snapshot listener targeting the selected Firestore document. Whenever an orchestrating agent updates the Firestore status, the app UI updates in real time.

### `src/hooks/useFirestoreLive.ts`
```typescript
import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useScanStore } from '../store/useScanStore';

export function useFirestoreLive(scanId: string | null) {
  const updateActiveScan = useScanStore((state) => state.updateActiveScan);
  const setError = useScanStore((state) => state.setError);
  const setLoading = useScanStore((state) => state.setLoading);

  useEffect(() => {
    if (!scanId) return;

    setLoading(true);
    const docRef = doc(db, 'scans', scanId);

    // Active real-time document sync
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          updateActiveScan({ id: snapshot.id, ...data });
          setError(null);
        } else {
          setError('Scan record not found in system databases.');
        }
        setLoading(false);
      },
      (err) => {
        setError(`Database connection interrupted: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [scanId]);
}
```

---

## 5. Screen Specifications & Layout Designs

Each screen incorporates standard glassmorphic details to match the professional midnight aesthetic.

---

### Screen 1: Splash Screen (`SplashScreen.tsx`)
*   **Purpose**: Display the brand identity, load typography/assets, and run initial authorization sweeps.
*   **Visual Elements**: Animated custom vector SVG logo centered on deep charcoal backgrounds. Pulse animation loops on the logo, with a glassmorphic loader at the bottom.
*   **Navigation Trigger**: Triggers automatically after 2 seconds of visual assets initialization $\rightarrow$ redirects to `HomeScreen`.

---

### Screen 2: Home Screen (`HomeScreen.tsx`)
*   **Purpose**: Act as the master control hub for active users.
*   **Visual Elements**: 
    *   *Scan Launchpad*: A large, prominent action button accented with a pulsing emerald outer aura labeled "INITIATE SCAN VERIFICATION".
    *   *Status Snapshot*: Small dashboard indicators showing community risk indexes, total scans processed, and active counterfeit alert counts.
*   **Navigation Trigger**: Clicking the scanning launchpad $\rightarrow$ `UploadScreen`.

---

### Screen 3: Upload Medicine Screen (`UploadScreen.tsx`)
*   **Purpose**: Interface with device hardware (camera and local media libraries) to upload packaging photography.
*   **Visual Elements**: High-contrast, interactive dashed viewport overlay with guiding brackets for medicine packaging alignment. Once an image is snapped, displays a high-resolution preview along with metadata input fields (e.g. batch number inputs if OCR cannot resolve the packaging).
*   **Navigation Trigger**: Successful upload to Firebase Storage returns `scanId` $\rightarrow$ redirects to `OcrScreen(scanId)`.

---

### Screen 4: OCR Analysis Screen (`OcrScreen.tsx`)
*   **Purpose**: Render the active progress timeline of the multi-agent orchestration pipeline.
*   **Visual Elements**:
    *   *Glassmorphic Terminal Stream*: A live terminal panel executing console-style typing indicators displaying parsed metadata strings (e.g. `OCR_Agent: Ingesting Package...`, `Detected NDC: 0006-0711-54`).
    *   *Timeline Progress*: Vertical interactive steps showing agent operational states: `Vision OCR` $\rightarrow$ `Registry Check` $\rightarrow$ `Risk Grading` $\rightarrow$ `Action Formulator`.
*   **Navigation Trigger**: Orchestrator sets scan document state to `status: "recommending"` $\rightarrow$ automatically navigate to `DashboardScreen(scanId)`.

---

### Screen 5: Risk Assessment Dashboard (`DashboardScreen.tsx`)
*   **Purpose**: Provide an analytical grading profile of the medicine's authenticity.
*   **Visual Elements**:
    *   *Radial Speedometer Gauge*: Circular animated risk gauge transitioning from bright emerald green (0-15%) to orange (15-50%), and flashing neon crimson red (50-100%).
    *   *Discrepancy Cards*: High-contrast warning panels summarizing anomalies (e.g. Brand Mismatch warning blocks, Expiry Delta warning logs).
*   **Navigation Trigger**: Bottom screen CTA "VIEW CONTAINMENT RECOMMENDATIONS" $\rightarrow$ `RecommendationScreen`.

---

### Screen 6: Action Recommendation Screen (`RecommendationScreen.tsx`)
*   **Purpose**: Display the list of drafted crisis actions and request Human-in-the-Loop review parameters.
*   **Visual Elements**:
    *   *Actions Checklist*: Dynamic accordion cards containing detailed draft alerts (e.g. drafted warning SMS text to patient, drafted formal complaint letter to manufacturer legal division).
    *   *H.I.T.L. Approval Switch*: Interactive confirmation buttons (Approve / Redraft).
*   **Navigation Trigger**: Toggling actions confirmation triggers the simulator engine $\rightarrow$ automatically navigates to `SimulationScreen(scanId)`.

---

### Screen 7: Action Simulation Screen (`SimulationScreen.tsx`)
*   **Purpose**: Render the simulated systemic improvements calculated from the action plan.
*   **Visual Elements**:
    *   *Ecosystem State Delta Card*: High-fidelity "Before vs. After" comparison bars demonstrating risk metrics dropping (e.g. Exposure Level falling from 88% down to 4%).
    *   *Ledger Transaction preview*: A block hashing terminal visual showing simulated updates written to supply chain registers.
*   **Navigation Trigger**: Pressing "DISPATCH CONTAINMENT ALERTS" releases alerts $\rightarrow$ navigates back to tab navigator home screen with success feedback.

---

### Screen 8: Notification Screen (`NotificationScreen.tsx`)
*   **Purpose**: Display an archive of systemic alerts, safety advisories, and administrative notifications.
*   **Visual Elements**: Sleek, list-based notification entries displaying priority levels (High Risk, Global Advisory) accented with neon colored left borders matching warning states.
*   **Navigation Trigger**: Tapping notifications opens detail modals showing specific scan reference points.

---

### Screen 9: Logs & History Screen (`HistoryScreen.tsx`)
*   **Purpose**: Render the persistent database history of past scans and trace execution JSON arrays.
*   **Visual Elements**:
    *   *List Directory*: Searchable cards of historical scans containing mini-risk badges and dates.
    *   *Trace Log Inspector*: Expands a modal layout displaying complete raw JSON telemetry data files for advanced medical audits.

---

## 6. Reusable Components Code Blueprints

These modular styling segments match our midnight glassmorphism theme using standard React Native style structures.

### `src/components/GlassCard.tsx`
```typescript
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
}

export function GlassCard({ children, style, ...props }: GlassCardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});
```

---

## 7. Recommended Libraries for Hackathon Acceleration

To maximize development speed while delivering premium UI transitions and micro-animations, add the following packages:

| Dependency | Purpose | Hackathon Acceleration Benefit |
| :--- | :--- | :--- |
| `lucide-react-native` | High-quality icons system | Out-of-the-box professional medical/technical visual icons. |
| `react-native-svg` | Render inline vector graphics | Core asset for the custom circular Risk gauge and SVG logos. |
| `react-native-reanimated` | Perform ultra-smooth animations | Renders smooth transitions, timeline bars, and gauge sweeps. |
| `expo-image` | High-speed, cached image loading | Supports instant base64 visual renders and placeholder transitions. |
| `expo-camera` | Interface with mobile device lenses | Out-of-the-box high performance camera APIs and frame analyzers. |
| `zustand` | Lightweight state store | Boilerplate-free state manager replacing heavy Redux stores. |
| `expo-linear-gradient` | Premium visual blending overlays | Core tool for sleek dark-mode charcoal transitions. |

---
*PharmaGuard AI — Verified Mobile Architecture Specification Document — May 2026.*
