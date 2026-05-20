/**
 * PharmaGuard AI — Risk Classifier
 * Computes a weighted composite risk score from OCR + Gemini analysis outputs.
 */

import { OcrExtractionResult, CounterfeitAnalysisResult } from '../types/pipeline';

/**
 * Weighted composite scoring that blends Gemini's AI probability
 * with visual quality indicators and registry check failures.
 */
export function calculateFinalRiskScore(
  ocr: OcrExtractionResult,
  analysis: CounterfeitAnalysisResult
): { score: number; classification: string } {
  const weights = {
    ai_probability: 0.40,
    anomaly_severity: 0.25,
    visual_quality: 0.15,
    registry_failures: 0.20,
  };

  // 1. AI probability (direct from Gemini)
  const aiScore = analysis.counterfeit_probability;

  // 2. Anomaly severity score
  const severityMap: Record<string, number> = { LOW: 0.1, MEDIUM: 0.3, HIGH: 0.6, CRITICAL: 0.9 };
  const anomalyScore =
    analysis.detected_anomalies.length > 0
      ? analysis.detected_anomalies.reduce(
          (sum, a) => sum + (severityMap[a.severity] || 0),
          0
        ) / Math.max(analysis.detected_anomalies.length, 1)
      : 0;

  // 3. Visual quality penalty score
  const visualPenalties = [
    ocr.visual_indicators.packaging_quality === 'LOW' ? 0.3 : 0,
    ocr.visual_indicators.text_clarity === 'BLURRY' ? 0.2 : 0,
    ocr.visual_indicators.color_consistency === 'FADED' ? 0.2 : 0,
    !ocr.visual_indicators.logo_present ? 0.15 : 0,
    !ocr.visual_indicators.seal_intact ? 0.15 : 0,
  ];
  const visualScore = Math.min(1.0, visualPenalties.reduce((a, b) => a + b, 0));

  // 4. Registry failure score
  const checks = analysis.registry_checks;
  const failedChecks = [
    !checks.manufacturer_recognized,
    !checks.batch_format_valid,
    !checks.expiry_plausible,
    !checks.ndc_format_valid,
    checks.known_counterfeit_pattern,
  ].filter(Boolean).length;
  const registryScore = failedChecks / 5;

  // Composite weighted score
  const finalScore = Math.min(
    1.0,
    aiScore * weights.ai_probability +
      anomalyScore * weights.anomaly_severity +
      visualScore * weights.visual_quality +
      registryScore * weights.registry_failures
  );

  // Classification thresholds
  let classification: string;
  if (finalScore <= 0.15) classification = 'SAFE';
  else if (finalScore <= 0.45) classification = 'SUSPICIOUS';
  else if (finalScore <= 0.75) classification = 'HIGH_RISK';
  else classification = 'CRITICAL';

  return { score: Math.round(finalScore * 100), classification };
}
