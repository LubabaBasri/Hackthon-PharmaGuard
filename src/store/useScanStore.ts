import { create } from 'zustand';

export interface ScanDocument {
  id: string;
  userId: string;
  imageUrl: string;
  status: 'uploaded' | 'extracting' | 'analyzing' | 'recommending' | 'simulating' | 'completed' | 'failed';
  createdAt: string;
  ocrData?: {
    rawText: string;
    brandName: string;
    genericName: string;
    manufacturer: string;
    batchNumber: string;
    serialNumber: string;
    mfgDate: string;
    expiryDate: string;
    ndc: string;
    detectedBarcodes: string[];
    packagingColorHex: string;
    fontFamilyMatch: string;
    logoDisplacementMm: number;
  };
  riskAnalysis?: {
    score: number;
    category: 'safe' | 'low_risk' | 'moderate_risk' | 'high_risk' | 'critical_danger';
    confidence: number;
    discrepancyLogs: Array<{
      field: string;
      extractedValue: string;
      registryValue: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    registryChecks: {
      fdaApproved: boolean;
      gs1SerialExists: boolean;
      batchActive: boolean;
      originCountryMismatch: boolean;
    };
  };
  clinicalImpact?: {
    severityLevel: 'negligible' | 'moderate' | 'severe' | 'lethal';
    therapeuticInactionRisk: string;
    contaminantRisk: {
      suspectedToxins: string[];
      toxicityDescription: string;
    };
    publicHealthHazard: {
      communityExposureIndex: number;
      marketInfiltrationRadiusMiles: number;
      localPanicRating: number;
    };
  };
  actionsPlan?: Array<{
    actionId: string;
    type: 'patient_quarantine' | 'supplier_alert' | 'regulatory_report' | 'manufacturer_audit' | 'broadcast_warning';
    title: string;
    description: string;
    recipientName: string;
    recipientEndpoint: string;
    messagePayload: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'simulated_success' | 'simulated_failed' | 'executed';
  }>;
  simulation?: {
    executionTimeline: Array<{
      timestamp: string;
      agentName: string;
      message: string;
      systemLog: string;
    }>;
    stateChange: {
      metricsBefore: {
        exposureRisk: number;
        distributorLiabilityScore: number;
        patientRecoveryChance: number;
        legalExposureScore: number;
        supplyChainTrustRating: number;
      };
      metricsAfter: {
        exposureRisk: number;
        distributorLiabilityScore: number;
        patientRecoveryChance: number;
        legalExposureScore: number;
        supplyChainTrustRating: number;
      };
      ledgerTransactionsSimulated: Array<{
        transactionHash: string;
        actionApplied: string;
        nodesNotified: string[];
      }>;
    };
  };
  errorMessage?: string;
}

export interface ScanState {
  currentScanId: string | null;
  activeScanData: ScanDocument | null;
  scanHistory: ScanDocument[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setScanId: (scanId: string | null) => void;
  updateActiveScan: (data: Partial<ScanDocument>) => void;
  appendHistory: (scan: ScanDocument) => void;
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
  updateActiveScan: (data) => set((state) => ({
    activeScanData: state.activeScanData 
      ? { ...state.activeScanData, ...data } as ScanDocument
      : data as ScanDocument
  })),
  appendHistory: (scan) => set((state) => ({ 
    scanHistory: [scan, ...state.scanHistory.filter((s) => s.id !== scan.id)] 
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err }),
  resetScan: () => set({ currentScanId: null, activeScanData: null, error: null, isLoading: false }),
}));
