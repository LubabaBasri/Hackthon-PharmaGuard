/**
 * PharmaGuard AI — Supabase Helper Functions
 * CRUD operations for persisting pipeline data to Supabase tables.
 * All writes are fire-and-forget with error logging.
 */

import { supabase } from './supabaseConfig';
import { OcrExtractionResult, CounterfeitAnalysisResult, RecommendedAction } from '../types/pipeline';

const isSupabaseActive =
  !!process.env.EXPO_PUBLIC_SUPABASE_URL && !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Create initial scan record in Supabase.
 * Returns the UUID scan_id from the database, or a local fallback ID.
 */
export async function createScanRecord(rawText: string): Promise<string> {
  if (!isSupabaseActive) return `local_${Date.now()}`;

  try {
    const { data, error } = await supabase
      .from('medicine_scans')
      .insert({
        raw_ocr_text: rawText || '',
        image_url: 'camera_upload',
        gps_latitude: 0,
        gps_longitude: 0,
        device_info: { client: 'PharmaGuard Mobile', mode: 'real_pipeline' },
      })
      .select('id')
      .single();

    if (error) {
      console.warn('Supabase createScanRecord error:', error.message);
      return `local_${Date.now()}`;
    }
    return data.id;
  } catch (err) {
    console.warn('Supabase createScanRecord failed:', err);
    return `local_${Date.now()}`;
  }
}

/**
 * Log an agent reasoning trace step.
 */
export function logAgentTrace(
  scanId: string,
  step: string,
  agentName: string,
  message: string
): void {
  if (!isSupabaseActive || scanId.startsWith('local_')) return;

  supabase
    .from('agent_traces')
    .insert({
      scan_id: scanId,
      step,
      agent_name: agentName,
      thought_process: message,
      output_payload: { timestamp: new Date().toISOString() },
    })
    .then(({ error }) => {
      if (error) console.warn('Supabase trace insert error:', error.message);
    });
}

/**
 * Store medicine analysis (OCR extraction results).
 */
export function storeMedicineAnalysis(
  scanId: string,
  ocr: OcrExtractionResult
): void {
  if (!isSupabaseActive || scanId.startsWith('local_')) return;

  supabase
    .from('medicine_analysis')
    .insert({
      scan_id: scanId,
      extracted_name: ocr.extracted_fields.medicine_name,
      extracted_manufacturer: ocr.extracted_fields.manufacturer,
      extracted_batch_number: ocr.extracted_fields.batch_number,
      extracted_expiry_date: ocr.extracted_fields.expiry_date,
      is_packaging_valid: ocr.visual_indicators.packaging_quality === 'HIGH',
      is_expiry_valid: ocr.visual_indicators.seal_intact,
      mismatch_details: [ocr.notes],
    })
    .then(({ error }) => {
      if (error) console.warn('Supabase analysis insert error:', error.message);
    });
}

/**
 * Store risk assessment results.
 */
export function storeRiskAssessment(
  scanId: string,
  score: number,
  classification: string,
  analysis: CounterfeitAnalysisResult
): void {
  if (!isSupabaseActive || scanId.startsWith('local_')) return;

  supabase
    .from('risk_assessments')
    .insert({
      scan_id: scanId,
      overall_score: score,
      risk_level: classification,
      confidence_score: analysis.confidence_score,
      threat_matrix: analysis.registry_checks,
      reasoning_summary: analysis.reasoning.summary,
    })
    .then(({ error }) => {
      if (error) console.warn('Supabase risk assessment error:', error.message);
    });
}

/**
 * Store action logs for containment plans.
 */
export function storeActionLogs(
  scanId: string,
  actions: RecommendedAction[]
): void {
  if (!isSupabaseActive || scanId.startsWith('local_')) return;

  actions.forEach((action) => {
    supabase
      .from('action_logs')
      .insert({
        scan_id: scanId,
        action_type: action.action_type,
        status: 'PENDING',
        parameters: {
          priority: action.priority,
          description: action.description,
          target: action.target,
        },
      })
      .then(({ error }) => {
        if (error) console.warn('Supabase action log error:', error.message);
      });
  });
}

/**
 * Update scan status (e.g., to COMPLETED).
 */
export function updateScanStatus(scanId: string, status: string): void {
  if (!isSupabaseActive || scanId.startsWith('local_')) return;

  supabase
    .from('medicine_scans')
    .update({ status })
    .eq('id', scanId)
    .then(({ error }) => {
      if (error) console.warn('Supabase scan status update error:', error.message);
    });
}
