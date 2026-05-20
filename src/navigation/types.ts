import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Splash: undefined;
  MainApp: undefined; // Wrapper for Bottom Tabs
  UploadMedicine: undefined;
  OcrAnalysis: {
    // Demo mode: pass a scenarioId to run mock simulation
    scenarioId?: 'SAFE_DRUG' | 'EXPIRED_BATCH' | 'COUNTERFEIT_PACKAGING' | 'TOXIC_CONTAMINANT';
    // Real mode: pass a base64 image to run the Gemini pipeline
    imageBase64?: string;
    mode: 'demo' | 'real';
  };
  RiskDashboard: undefined;
  ActionRecommendation: undefined;
  ActionSimulation: undefined;
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
