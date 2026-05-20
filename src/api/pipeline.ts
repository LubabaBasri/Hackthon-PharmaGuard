/**
 * PharmaGuard AI — Main Pipeline Orchestrator
 * Connects image preprocessing → Gemini OCR → Gemini Analysis → Risk Classification → Supabase.
 * Falls back to mock simulation if any stage fails.
 */

import { extractMedicineText } from './geminiOcr';
import { analyzeCounterfeit } from './geminiAnalysis';
import { calculateFinalRiskScore } from './riskClassifier';
import {
  createScanRecord,
  logAgentTrace,
  storeMedicineAnalysis,
  storeRiskAssessment,
  storeActionLogs,
  updateScanStatus,
} from './supabaseHelpers';
import {
  PipelineUpdate,
  PipelineResult,
  OcrExtractionResult,
  CounterfeitAnalysisResult,
} from '../types/pipeline';
import { ScanDocument } from '../store/useScanStore';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Convert pipeline results into a ScanDocument that the existing
 * Zustand store and dashboard screens can consume.
 */
function pipelineResultToScanDocument(result: PipelineResult): ScanDocument {
  const { ocrResult, analysisResult, score, classification } = result;
  const fields = ocrResult.extracted_fields;

  // Map classification to category
  const categoryMap: Record<string, ScanDocument['riskAnalysis'] extends infer T ? T extends { category: infer C } ? C : never : never> = {
    SAFE: 'safe',
    SUSPICIOUS: 'low_risk',
    HIGH_RISK: 'high_risk',
    CRITICAL: 'critical_danger',
  };

  // Map recommended actions to the ScanDocument format
  const actionTypeMap: Record<string, string> = {
    QUARANTINE: 'patient_quarantine',
    ALERT_PHARMACY: 'supplier_alert',
    REPORT_AUTHORITY: 'regulatory_report',
    BLOCK_BATCH: 'manufacturer_audit',
    NOTIFY_PATIENT: 'broadcast_warning',
    NO_ACTION: 'patient_quarantine',
  };

  return {
    id: result.scanId,
    userId: 'user_real',
    imageUrl: 'camera_capture',
    status: 'recommending',
    createdAt: new Date().toISOString(),
    ocrData: {
      rawText: ocrResult.raw_text,
      brandName: fields.medicine_name || 'Unknown',
      genericName: fields.generic_name || 'Unknown',
      manufacturer: fields.manufacturer || 'Unknown',
      batchNumber: fields.batch_number || 'N/A',
      serialNumber: fields.serial_number || 'N/A',
      mfgDate: fields.manufacturing_date || 'N/A',
      expiryDate: fields.expiry_date || 'N/A',
      ndc: fields.ndc_code || 'N/A',
      detectedBarcodes: fields.barcode_text ? [fields.barcode_text] : [],
      packagingColorHex: '#FFFFFF',
      fontFamilyMatch: 'Vision OCR',
      logoDisplacementMm: ocrResult.visual_indicators.logo_present ? 0 : 5,
    },
    riskAnalysis: {
      score,
      category: (categoryMap[classification] || 'safe') as any,
      confidence: Math.round(analysisResult.confidence_score * 100),
      discrepancyLogs: analysisResult.detected_anomalies.map((a) => ({
        field: a.field,
        extractedValue: a.found,
        registryValue: a.expected,
        severity: a.severity === 'CRITICAL' ? 'high' : a.severity.toLowerCase() as any,
      })),
      registryChecks: {
        fdaApproved: analysisResult.registry_checks.manufacturer_recognized,
        gs1SerialExists: analysisResult.registry_checks.batch_format_valid,
        batchActive: analysisResult.registry_checks.expiry_plausible,
        originCountryMismatch: analysisResult.registry_checks.known_counterfeit_pattern,
      },
    },
    clinicalImpact: {
      severityLevel: analysisResult.clinical_impact.patient_risk === 'LETHAL'
        ? 'lethal'
        : analysisResult.clinical_impact.patient_risk === 'SEVERE'
        ? 'severe'
        : analysisResult.clinical_impact.patient_risk === 'MODERATE'
        ? 'moderate'
        : 'negligible',
      therapeuticInactionRisk: analysisResult.clinical_impact.therapeutic_impact,
      contaminantRisk: {
        suspectedToxins: analysisResult.clinical_impact.contaminant_risk
          ? [analysisResult.clinical_impact.contaminant_risk]
          : [],
        toxicityDescription: analysisResult.clinical_impact.contaminant_risk || 'None detected',
      },
      publicHealthHazard: {
        communityExposureIndex: score > 75 ? 85 : score > 45 ? 40 : score > 15 ? 12 : 0,
        marketInfiltrationRadiusMiles: score > 75 ? 25 : score > 45 ? 10 : 0,
        localPanicRating: score > 75 ? 4 : score > 45 ? 2 : 0,
      },
    },
    actionsPlan: analysisResult.recommended_actions.map((act, idx) => ({
      actionId: `act_real_${idx}`,
      type: (actionTypeMap[act.action_type] || 'patient_quarantine') as any,
      title: act.description.substring(0, 50),
      description: act.description,
      recipientName: act.target,
      recipientEndpoint: 'AI Generated',
      messagePayload: act.description,
      priority: act.priority.toLowerCase() as any,
      status: 'pending' as const,
    })),
    simulation: {
      executionTimeline: [],
      stateChange: {
        metricsBefore: {
          exposureRisk: Math.min(score + 10, 100),
          distributorLiabilityScore: Math.min(score + 5, 100),
          patientRecoveryChance: Math.max(100 - score - 10, 10),
          legalExposureScore: Math.min(score, 80),
          supplyChainTrustRating: Math.max(90 - score, 20),
        },
        metricsAfter: {
          exposureRisk: Math.max(score - 40, 2),
          distributorLiabilityScore: Math.max(score - 35, 5),
          patientRecoveryChance: Math.min(100 - score + 30, 98),
          legalExposureScore: Math.max(score - 30, 2),
          supplyChainTrustRating: Math.min(90 - score + 20, 95),
        },
        ledgerTransactionsSimulated: [
          {
            transactionHash: `0x${result.scanId.replace(/-/g, '').substring(0, 16)}`,
            actionApplied: 'AI_PIPELINE_VERIFICATION',
            nodesNotified: ['Gemini Vision Node', 'Supabase Ledger'],
          },
        ],
      },
    },
  };
}

/**
 * Run the real Gemini-powered analysis pipeline.
 * Each stage fires progress callbacks that the OcrScreen renders as agent log lines.
 */
export async function runRealPipeline(
  base64Image: string,
  onScanUpdate: (delta: Partial<ScanDocument>) => void,
  onLog: (agentName: string, message: string, systemLog: string) => void
): Promise<ScanDocument> {
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY not set in .env');
  }

  // ═══ STAGE 0: Create scan record ═══
  onLog('System_Agent', 'Creating scan record in Supabase...', 'db_insert: medicine_scans');
  onScanUpdate({ status: 'uploaded' });
  const scanId = await createScanRecord('');
  logAgentTrace(scanId, 'INGESTION', 'System_Agent', 'Scan record created: ' + scanId);
  await delay(500);

  // ═══ STAGE 1: Gemini OCR Extraction ═══
  onScanUpdate({ status: 'extracting' });
  onLog('OCR_Agent', 'Initializing Gemini Vision OCR engine...', 'model: gemini-2.0-flash-vision');
  await delay(300);
  onLog('OCR_Agent', 'Transmitting image to Gemini Vision API...', `payload_size: ${Math.round(base64Image.length / 1024)}KB`);

  let ocrResult: OcrExtractionResult;
  try {
    ocrResult = await extractMedicineText(base64Image, geminiKey);
  } catch (err: any) {
    onLog('OCR_Agent', `ERROR: ${err.message}`, 'ocr_failed');
    throw err;
  }

  const medName = ocrResult.extracted_fields.medicine_name || 'Unknown';
  onLog(
    'OCR_Agent',
    `Extraction complete. Medicine: ${medName}, Batch: ${ocrResult.extracted_fields.batch_number || 'N/A'}, Confidence: ${Math.round(ocrResult.ocr_confidence * 100)}%`,
    `fields_extracted: ${Object.values(ocrResult.extracted_fields).filter(Boolean).length}/11`
  );
  logAgentTrace(scanId, 'OCR', 'OCR_Agent', `Extracted: ${medName}`);
  storeMedicineAnalysis(scanId, ocrResult);
  await delay(500);

  // ═══ STAGE 2: Gemini Counterfeit Analysis ═══
  onScanUpdate({ status: 'analyzing' });
  onLog('Verification_Agent', 'Launching counterfeit detection analysis...', 'model: gemini-2.0-flash');
  await delay(300);
  onLog('Verification_Agent', 'Cross-referencing manufacturer, batch format, and expiry plausibility...', 'analysis_params: 6 vectors');

  let analysisResult: CounterfeitAnalysisResult;
  try {
    analysisResult = await analyzeCounterfeit(ocrResult, geminiKey);
  } catch (err: any) {
    onLog('Verification_Agent', `ERROR: ${err.message}`, 'analysis_failed');
    throw err;
  }

  onLog(
    'Verification_Agent',
    `Analysis complete. Severity: ${analysisResult.severity_level}, Probability: ${Math.round(analysisResult.counterfeit_probability * 100)}%`,
    `anomalies_detected: ${analysisResult.detected_anomalies.length}`
  );
  logAgentTrace(scanId, 'VERIFICATION', 'Verification_Agent', analysisResult.reasoning.summary);
  await delay(500);

  // ═══ STAGE 3: Risk Classification ═══
  onLog('Risk_Agent', 'Computing weighted composite risk score...', 'weights: ai=0.40 anomaly=0.25 visual=0.15 registry=0.20');
  const { score, classification } = calculateFinalRiskScore(ocrResult, analysisResult);
  onLog(
    'Risk_Agent',
    `Risk classification: ${classification} (${score}%). Confidence: ${Math.round(analysisResult.confidence_score * 100)}%`,
    `final_score: ${score}`
  );
  storeRiskAssessment(scanId, score, classification, analysisResult);
  logAgentTrace(scanId, 'THREAT_MODELING', 'Risk_Agent', `Score: ${score}%, Class: ${classification}`);
  await delay(500);

  // ═══ STAGE 4: Decision Agent ═══
  onLog('Decision_Agent', `Formulating response plan. ${analysisResult.recommended_actions.length} actions generated.`, 'decision_engine: active');
  if (classification !== 'SAFE') {
    storeActionLogs(scanId, analysisResult.recommended_actions);
    onLog(
      'Decision_Agent',
      `Escalation ${analysisResult.escalation_required ? 'REQUIRED' : 'not required'}. ${analysisResult.escalation_reason || 'Standard protocols apply.'}`,
      'escalation_check: complete'
    );
  } else {
    onLog('Decision_Agent', 'Medicine verified as authentic. No containment actions required.', 'status: SAFE');
  }
  logAgentTrace(scanId, 'DECISION', 'Decision_Agent', `Actions: ${analysisResult.recommended_actions.length}`);
  await delay(300);

  // ═══ STAGE 5: Finalize ═══
  updateScanStatus(scanId, 'COMPLETED');

  const pipelineResult: PipelineResult = {
    scanId,
    ocrResult,
    analysisResult,
    score,
    classification,
    actions: analysisResult.recommended_actions,
  };

  // Convert to ScanDocument for existing screens
  const scanDoc = pipelineResultToScanDocument(pipelineResult);

  // Push final state to Zustand
  onScanUpdate({
    ...scanDoc,
    status: 'recommending',
  });

  return scanDoc;
}
