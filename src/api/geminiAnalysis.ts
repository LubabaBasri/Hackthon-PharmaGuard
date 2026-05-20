/**
 * PharmaGuard AI — Stage 2: Gemini Counterfeit Analysis
 * Takes structured OCR output and performs AI-powered
 * counterfeit risk analysis using Gemini 2.0 Flash.
 */

import { OcrExtractionResult, CounterfeitAnalysisResult } from '../types/pipeline';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function buildAnalysisPrompt(ocrResult: OcrExtractionResult): string {
  return `
You are a pharmaceutical counterfeit detection AI agent for PharmaGuard AI.

Analyze the following medicine data extracted via OCR and determine counterfeit risk.

EXTRACTED DATA:
${JSON.stringify(ocrResult.extracted_fields, null, 2)}

VISUAL INDICATORS FROM IMAGE:
${JSON.stringify(ocrResult.visual_indicators, null, 2)}

OCR CONFIDENCE: ${ocrResult.ocr_confidence}
RAW TEXT: ${ocrResult.raw_text}

Perform the following analysis:
1. Cross-reference medicine name against known pharmaceutical databases
2. Check batch number format validity for the stated manufacturer
3. Verify expiry date is reasonable (not impossibly far future or past)
4. Check manufacturer name for misspellings or known counterfeiter patterns
5. Evaluate visual packaging quality indicators
6. Detect any suspicious patterns (mismatched fonts, unusual formatting, etc.)

Return a JSON object with EXACTLY this structure:
{
  "counterfeit_probability": 0.0,
  "severity_level": "SAFE",
  "confidence_score": 0.0,
  "detected_anomalies": [
    {
      "field": "field name",
      "issue": "description of anomaly",
      "severity": "LOW or MEDIUM or HIGH or CRITICAL",
      "expected": "what was expected",
      "found": "what was found"
    }
  ],
  "reasoning": {
    "summary": "1-2 sentence overall assessment",
    "detailed_analysis": "paragraph-length reasoning",
    "key_risk_factors": ["factor1", "factor2"],
    "mitigating_factors": ["factor1", "factor2"]
  },
  "recommended_actions": [
    {
      "action_type": "QUARANTINE or ALERT_PHARMACY or REPORT_AUTHORITY or BLOCK_BATCH or NOTIFY_PATIENT or NO_ACTION",
      "priority": "LOW or MEDIUM or HIGH or CRITICAL",
      "description": "what should be done",
      "target": "who/what this action targets"
    }
  ],
  "escalation_required": false,
  "escalation_reason": null,
  "registry_checks": {
    "manufacturer_recognized": true,
    "batch_format_valid": true,
    "expiry_plausible": true,
    "ndc_format_valid": true,
    "known_counterfeit_pattern": false
  },
  "clinical_impact": {
    "patient_risk": "NONE or LOW or MODERATE or SEVERE or LETHAL",
    "therapeutic_impact": "description of potential health impact",
    "contaminant_risk": "description of contamination risk"
  }
}

CLASSIFICATION RULES:
- SAFE (probability 0.0-0.15): All checks pass, legitimate medicine confirmed
- SUSPICIOUS (probability 0.16-0.45): Minor anomalies detected, further verification needed
- HIGH_RISK (probability 0.46-0.75): Multiple red flags, likely counterfeit
- CRITICAL (probability 0.76-1.0): Confirmed counterfeit indicators, immediate action required

IMPORTANT: Return ONLY valid JSON with no markdown fences or extra text.
`;
}

/**
 * Analyze OCR extraction results for counterfeit risk using Gemini.
 */
export async function analyzeCounterfeit(
  ocrResult: OcrExtractionResult,
  apiKey: string
): Promise<CounterfeitAnalysisResult> {
  const prompt = buildAnalysisPrompt(ocrResult);

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini Analysis API error (${response.status}): ${errBody}`);
  }

  const result = await response.json();
  const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini returned empty analysis response');
  }

  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned) as CounterfeitAnalysisResult;
  } catch (parseErr) {
    console.error('Failed to parse Gemini Analysis JSON:', cleaned);
    throw new Error('Gemini returned malformed analysis JSON');
  }
}
