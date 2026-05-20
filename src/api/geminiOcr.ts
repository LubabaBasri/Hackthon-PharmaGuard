/**
 * PharmaGuard AI — Stage 1: Gemini Vision OCR Extraction
 * Sends medicine packaging image to Gemini 2.0 Flash Vision
 * and extracts structured text fields.
 */

import { OcrExtractionResult } from '../types/pipeline';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const OCR_EXTRACTION_PROMPT = `
You are a pharmaceutical OCR extraction agent for PharmaGuard AI.
Analyze this medicine packaging image and extract ALL visible text fields.

Return a JSON object with EXACTLY this structure:
{
  "raw_text": "complete raw text visible on package",
  "extracted_fields": {
    "medicine_name": "brand name or null",
    "generic_name": "generic/chemical name or null",
    "manufacturer": "manufacturer name or null",
    "batch_number": "batch/lot number or null",
    "serial_number": "serial or tracking number or null",
    "expiry_date": "expiry date in YYYY-MM-DD format or null",
    "manufacturing_date": "mfg date in YYYY-MM-DD format or null",
    "dosage": "dosage info (e.g. '500mg') or null",
    "ndc_code": "NDC or registration number or null",
    "barcode_text": "any barcode numbers visible or null",
    "country_of_origin": "country if visible or null"
  },
  "visual_indicators": {
    "packaging_quality": "HIGH or MEDIUM or LOW",
    "text_clarity": "CLEAR or BLURRY or PARTIALLY_READABLE",
    "color_consistency": "CONSISTENT or INCONSISTENT or FADED",
    "logo_present": true,
    "hologram_visible": false,
    "seal_intact": true
  },
  "ocr_confidence": 0.85,
  "notes": "any observations about image quality or readability"
}

RULES:
- Extract EXACTLY what you see. Do not guess or fabricate fields.
- If a field is not visible, set it to null.
- Dates must be converted to YYYY-MM-DD format when possible.
- ocr_confidence should reflect text readability (1.0 = perfect, 0.0 = unreadable).
- Return ONLY valid JSON with no markdown fences or extra text.
`;

/**
 * Send a base64 medicine packaging image to Gemini Vision
 * and get structured OCR extraction.
 */
export async function extractMedicineText(
  base64Image: string,
  apiKey: string
): Promise<OcrExtractionResult> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: OCR_EXTRACTION_PROMPT },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini OCR API error (${response.status}): ${errBody}`);
  }

  const result = await response.json();

  // Extract JSON text from Gemini response
  const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini returned empty OCR response');
  }

  // Parse JSON — handle potential markdown fences from Gemini
  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned) as OcrExtractionResult;
  } catch (parseErr) {
    console.error('Failed to parse Gemini OCR JSON:', cleaned);
    throw new Error('Gemini returned malformed OCR JSON');
  }
}
