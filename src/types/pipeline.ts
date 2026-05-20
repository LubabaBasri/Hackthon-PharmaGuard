/**
 * PharmaGuard AI — Pipeline Type Definitions
 * Shared interfaces for the OCR + Gemini AI analysis pipeline.
 */

// ─── OCR Extraction Output ──────────────────────────────────────────

export interface OcrExtractionResult {
  raw_text: string;
  extracted_fields: {
    medicine_name: string | null;
    generic_name: string | null;
    manufacturer: string | null;
    batch_number: string | null;
    serial_number: string | null;
    expiry_date: string | null;
    manufacturing_date: string | null;
    dosage: string | null;
    ndc_code: string | null;
    barcode_text: string | null;
    country_of_origin: string | null;
  };
  visual_indicators: {
    packaging_quality: 'HIGH' | 'MEDIUM' | 'LOW';
    text_clarity: 'CLEAR' | 'BLURRY' | 'PARTIALLY_READABLE';
    color_consistency: 'CONSISTENT' | 'INCONSISTENT' | 'FADED';
    logo_present: boolean;
    hologram_visible: boolean;
    seal_intact: boolean;
  };
  ocr_confidence: number;
  notes: string;
}

// ─── Counterfeit Analysis Output ────────────────────────────────────

export interface DetectedAnomaly {
  field: string;
  issue: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expected: string;
  found: string;
}

export interface RecommendedAction {
  action_type: 'QUARANTINE' | 'ALERT_PHARMACY' | 'REPORT_AUTHORITY' | 'BLOCK_BATCH' | 'NOTIFY_PATIENT' | 'NO_ACTION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  target: string;
}

export interface CounterfeitAnalysisResult {
  counterfeit_probability: number;
  severity_level: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL';
  confidence_score: number;
  detected_anomalies: DetectedAnomaly[];
  reasoning: {
    summary: string;
    detailed_analysis: string;
    key_risk_factors: string[];
    mitigating_factors: string[];
  };
  recommended_actions: RecommendedAction[];
  escalation_required: boolean;
  escalation_reason: string | null;
  registry_checks: {
    manufacturer_recognized: boolean;
    batch_format_valid: boolean;
    expiry_plausible: boolean;
    ndc_format_valid: boolean;
    known_counterfeit_pattern: boolean;
  };
  clinical_impact: {
    patient_risk: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE' | 'LETHAL';
    therapeutic_impact: string;
    contaminant_risk: string;
  };
}

// ─── Pipeline Progress & Result ─────────────────────────────────────

export type PipelineStage =
  | 'preprocessing'
  | 'ingestion'
  | 'ocr'
  | 'analysis'
  | 'classification'
  | 'actions'
  | 'complete'
  | 'error';

export interface PipelineUpdate {
  stage: PipelineStage;
  message: string;
  agentName?: string;
  systemLog?: string;
}

export interface PipelineResult {
  scanId: string;
  ocrResult: OcrExtractionResult;
  analysisResult: CounterfeitAnalysisResult;
  score: number;
  classification: string;
  actions: RecommendedAction[];
}
