import { ScanDocument } from '../store/useScanStore';
import { supabase } from './supabaseConfig';

// Check if Supabase keys are configured in environment
const isSupabaseActive = !!process.env.EXPO_PUBLIC_SUPABASE_URL && !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Async timer helper used to pace the multi-agent simulation steps
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// Helper to generate ISO strings relative to current time
const getOffsetDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const MOCK_SCENARIOS = {
  SAFE_DRUG: {
    id: 'scan_safe_singulair',
    userId: 'user_dev',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300',
    status: 'uploaded' as const,
    createdAt: new Date().toISOString(),
    ocrData: {
      rawText: 'Singulair\nMontelukast Sodium 10mg\nMERCK\nBatch: B-118833\nSerial: PG-110022-US\nEXP: 2028-10-12\nNDC: 0006-0711-54',
      brandName: 'Singulair',
      genericName: 'Montelukast Sodium',
      manufacturer: 'Merck Sharp & Dohme Corp.',
      batchNumber: 'B-118833',
      serialNumber: 'PG-110022-US',
      mfgDate: getOffsetDate(-180),
      expiryDate: '2028-10-12',
      ndc: '0006-0711-54',
      detectedBarcodes: ['0006071154'],
      packagingColorHex: '#1E3A8A',
      fontFamilyMatch: 'Arial-Bold (Official: Arial-Bold)',
      logoDisplacementMm: 0.2
    },
    riskAnalysis: {
      score: 3,
      category: 'safe' as const,
      confidence: 98,
      discrepancyLogs: [],
      registryChecks: {
        fdaApproved: true,
        gs1SerialExists: true,
        batchActive: true,
        originCountryMismatch: false
      }
    },
    clinicalImpact: {
      severityLevel: 'negligible' as const,
      therapeuticInactionRisk: 'None. Medication contains 100% active compound (Montelukast Sodium 10mg) with approved pharmaceutical stability.',
      contaminantRisk: {
        suspectedToxins: [],
        toxicityDescription: 'No toxic fill agents or biological structural pollutants identified.'
      },
      publicHealthHazard: {
        communityExposureIndex: 0,
        marketInfiltrationRadiusMiles: 0,
        localPanicRating: 0
      }
    },
    actionsPlan: [
      {
        actionId: 'act_safe_auth',
        type: 'patient_quarantine' as const, // Reused standard type for simple approval message
        title: 'Authorize Consumption',
        description: 'Notify the patient that their Singulair package is fully authentic.',
        recipientName: 'Patient Device UI',
        recipientEndpoint: 'In-App Alert',
        messagePayload: 'VERIFIED: Your package of Singulair 10mg is 100% authentic and safe for consumption.',
        priority: 'low' as const,
        status: 'pending' as const
      }
    ],
    simulation: {
      executionTimeline: [],
      stateChange: {
        metricsBefore: {
          exposureRisk: 0,
          distributorLiabilityScore: 0,
          patientRecoveryChance: 98,
          legalExposureScore: 0,
          supplyChainTrustRating: 85
        },
        metricsAfter: {
          exposureRisk: 0,
          distributorLiabilityScore: 0,
          patientRecoveryChance: 98,
          legalExposureScore: 0,
          supplyChainTrustRating: 86
        },
        ledgerTransactionsSimulated: [
          {
            transactionHash: '0xabcde12345f7890',
            actionApplied: 'CONFIRMED_SCAN_TRANSACTION',
            nodesNotified: ['Merck Plant Node', 'Local Distributor Gateway']
          }
        ]
      }
    }
  },

  EXPIRED_BATCH: {
    id: 'scan_expired_lipitor',
    userId: 'user_dev',
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300',
    status: 'uploaded' as const,
    createdAt: new Date().toISOString(),
    ocrData: {
      rawText: 'Lipitor\nAtorvastatin Calcium 20mg\nPFIZER\nBatch: B-992288\nSerial: PFI-9022-BR\nEXP: 2025-11-01\nNDC: 0071-0156-23',
      brandName: 'Lipitor',
      genericName: 'Atorvastatin Calcium',
      manufacturer: 'Pfizer Inc.',
      batchNumber: 'B-992288',
      serialNumber: 'PFI-9022-BR',
      mfgDate: '2023-11-01',
      expiryDate: '2025-11-01', // Expired
      ndc: '0071-0156-23',
      detectedBarcodes: ['0071015623'],
      packagingColorHex: '#2563EB',
      fontFamilyMatch: 'Helvetica (Official: Arial)',
      logoDisplacementMm: 1.5
    },
    riskAnalysis: {
      score: 38,
      category: 'moderate_risk' as const,
      confidence: 94,
      discrepancyLogs: [
        {
          field: 'expiryDate',
          extractedValue: '2025-11-01',
          registryValue: 'Active date expired on 2025-11-01',
          severity: 'high' as const
        },
        {
          field: 'serialNumber',
          extractedValue: 'PFI-9022-BR (Brazil Destination)',
          registryValue: 'US Retail scan destination coordinates mismatch',
          severity: 'medium' as const
        }
      ],
      registryChecks: {
        fdaApproved: true,
        gs1SerialExists: true,
        batchActive: false, // Expired
        originCountryMismatch: true // BR serial scanned in US
      }
    },
    clinicalImpact: {
      severityLevel: 'moderate' as const,
      therapeuticInactionRisk: 'Medication has expired. Chemical degradation of Atorvastatin may decrease efficacy by 15-30%, leading to poor lipid profile management.',
      contaminantRisk: {
        suspectedToxins: [],
        toxicityDescription: 'No direct toxins suspected, but product efficacy is compromised due to active agent degradation.'
      },
      publicHealthHazard: {
        communityExposureIndex: 12,
        marketInfiltrationRadiusMiles: 2,
        localPanicRating: 1
      }
    },
    actionsPlan: [
      {
        actionId: 'act_exp_quar',
        type: 'patient_quarantine' as const,
        title: 'Quarantine Medication',
        description: 'Advise user to quarantine the package and stop consumption immediately.',
        recipientName: 'Consumer',
        recipientEndpoint: 'Push Notification',
        messagePayload: 'WARNING: Your Lipitor 20mg package has expired on 2025-11-01. Do not consume.',
        priority: 'medium' as const,
        status: 'pending' as const
      },
      {
        actionId: 'act_exp_pharm',
        type: 'supplier_alert' as const,
        title: 'Notify Retail Pharmacy',
        description: 'Send warning to local pharmacy regarding expired batch and import mismatch audit.',
        recipientName: 'Walgreens Apothecary Node 8',
        recipientEndpoint: 'walgreens-node-8@walgreens.com',
        messagePayload: 'ALERT: Expired/Import Mismatch batch B-992288 Lipitor scanned at Walgreens Location 14. Investigate supply records.',
        priority: 'medium' as const,
        status: 'pending' as const
      }
    ],
    simulation: {
      executionTimeline: [],
      stateChange: {
        metricsBefore: {
          exposureRisk: 30,
          distributorLiabilityScore: 45,
          patientRecoveryChance: 70,
          legalExposureScore: 20,
          supplyChainTrustRating: 75
        },
        metricsAfter: {
          exposureRisk: 5,
          distributorLiabilityScore: 10,
          patientRecoveryChance: 95,
          legalExposureScore: 5,
          supplyChainTrustRating: 78
        },
        ledgerTransactionsSimulated: [
          {
            transactionHash: '0x992288abcde0f890',
            actionApplied: 'EXPIRED_BATCH_WARNING_LOGGED',
            nodesNotified: ['Walgreens Supply Chain Node', 'FDA MedWatch Database']
          }
        ]
      }
    }
  },

  COUNTERFEIT_PACKAGING: {
    id: 'scan_fake_singulair',
    userId: 'user_dev',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300',
    status: 'uploaded' as const,
    createdAt: new Date().toISOString(),
    ocrData: {
      rawText: 'Singulair\nMontelukast Sodium 10mg\nMERCK\nBatch: B-998822\nSerial: PG-837492-US\nEXP: 2027-12-18\nNDC: 0006-0711-54',
      brandName: 'Singulair',
      genericName: 'Montelukast Sodium',
      manufacturer: 'Merck Sharp & Dohme Corp.',
      batchNumber: 'B-998822',
      serialNumber: 'PG-837492-US',
      mfgDate: getOffsetDate(-10),
      expiryDate: '2027-12-18',
      ndc: '0006-0711-54',
      detectedBarcodes: ['0006071154'],
      packagingColorHex: '#3B82F6',
      fontFamilyMatch: 'Helvetica-Bold (Official: Arial-Bold)', // Font anomaly
      logoDisplacementMm: 5.2 // Layout displacement > 4mm
    },
    riskAnalysis: {
      score: 68,
      category: 'high_risk' as const,
      confidence: 95,
      discrepancyLogs: [
        {
          field: 'fontFamilyMatch',
          extractedValue: 'Helvetica-Bold',
          registryValue: 'Arial-Bold (Official template matching failure)',
          severity: 'medium' as const
        },
        {
          field: 'logoDisplacementMm',
          extractedValue: '5.2mm offset',
          registryValue: 'Max allowed tolerance: 1.0mm (Critical visual fraud marker)',
          severity: 'high' as const
        },
        {
          field: 'batchNumber',
          extractedValue: 'B-998822 (Manufacturing date mismatch)',
          registryValue: 'This batch was officially registered as expired in Jun 2026. Packaging shows EXP 2027-12-18.',
          severity: 'high' as const
        }
      ],
      registryChecks: {
        fdaApproved: true,
        gs1SerialExists: true,
        batchActive: false, // Expired registry details
        originCountryMismatch: false
      }
    },
    clinicalImpact: {
      severityLevel: 'severe' as const,
      therapeuticInactionRisk: 'Substantial. Chemical evaluation suggests the active Montelukast ingredient is absent, replaced by standard chalk filler. Asthmatic patients using this will suffer uncontrolled bronchial constrictions and acute emergency triggers.',
      contaminantRisk: {
        suspectedToxins: ['Industrial Chalk Fillers', 'Talcum powder'],
        toxicityDescription: 'Suspected binding agent includes substandard chalk containing industrial chemical elements.'
      },
      publicHealthHazard: {
        communityExposureIndex: 55,
        marketInfiltrationRadiusMiles: 15,
        localPanicRating: 4
      }
    },
    actionsPlan: [
      {
        actionId: 'act_fake_quar',
        type: 'patient_quarantine' as const,
        title: 'Quarantine Medication Immediately',
        description: 'Notify the patient to isolate this specific box and seek medical alternatives.',
        recipientName: 'Consumer App Interface',
        recipientEndpoint: 'SMS Alert + Push Notification',
        messagePayload: 'CRITICAL ALERT: Your Singulair 10mg package has been categorized as high-risk COUNTERFEIT due to packaging and batch mismatches. Stop consumption immediately and preserve the container for inspector collection.',
        priority: 'critical' as const,
        status: 'pending' as const
      },
      {
        actionId: 'act_fake_fda',
        type: 'regulatory_report' as const,
        title: 'Draft FDA MedWatch ADR',
        description: 'Auto-compile official safety report detailing packaging fonts and batch date fraud.',
        recipientName: 'FDA MedWatch Portal',
        recipientEndpoint: 'https://safety.fda.gov/medwatch/reporting',
        messagePayload: 'PharmaGuard Counterfeit Influx Report: Detected packaging batch duplication. Extracted Batch: B-998822. Anomaly: Font changed, logo displaced, and expiry falsified to 2027.',
        priority: 'high' as const,
        status: 'pending' as const
      },
      {
        actionId: 'act_fake_pharm',
        type: 'supplier_alert' as const,
        title: 'Issue Pharmacy Recall Webhook',
        description: 'Instruct point-of-sale systems to block further sales of batch B-998822.',
        recipientName: 'Local Retailer Apothecary',
        recipientEndpoint: 'https://api.localpharmacy.org/quarantine',
        messagePayload: 'COMMAND: Immediately isolate all boxes of Singulair 10mg under batch B-998822. Counterfeit detected in local network coordinates.',
        priority: 'high' as const,
        status: 'pending' as const
      }
    ],
    simulation: {
      executionTimeline: [],
      stateChange: {
        metricsBefore: {
          exposureRisk: 82,
          distributorLiabilityScore: 88,
          patientRecoveryChance: 12,
          legalExposureScore: 70,
          supplyChainTrustRating: 40
        },
        metricsAfter: {
          exposureRisk: 4,
          distributorLiabilityScore: 12,
          patientRecoveryChance: 98,
          legalExposureScore: 15,
          supplyChainTrustRating: 65
        },
        ledgerTransactionsSimulated: [
          {
            transactionHash: '0x8fae8372d8aee37d2f838290',
            actionApplied: 'SERIAL_QUARANTINE_RECORD_COMMITTED',
            nodesNotified: ['Merck Global Node', 'FDA MedWatch Database', 'GS1 Electronic Ledger']
          }
        ]
      }
    }
  },

  TOXIC_CONTAMINANT: {
    id: 'scan_toxic_syrup',
    userId: 'user_dev',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300',
    status: 'uploaded' as const,
    createdAt: new Date().toISOString(),
    ocrData: {
      rawText: 'Guaifenesin Cough Syrup\nWHOOPING COUGH SPECIAL\nBatch: B-TOXIC-WHO\nSerial: SYR-9988-GL\nEXP: 2028-01-01\nNDC: 0000-9999-00',
      brandName: 'Guaifenesin Cough Syrup',
      genericName: 'Guaifenesin Expectorant',
      manufacturer: 'Substandard Global Lab',
      batchNumber: 'B-TOXIC-WHO',
      serialNumber: 'SYR-9988-GL',
      mfgDate: getOffsetDate(-30),
      expiryDate: '2028-01-01',
      ndc: '0000-9999-00',
      detectedBarcodes: ['0000999900'],
      packagingColorHex: '#7F1D1D',
      fontFamilyMatch: 'Courier (Official: Arial-Bold)',
      logoDisplacementMm: 8.5
    },
    riskAnalysis: {
      score: 96,
      category: 'critical_danger' as const,
      confidence: 99,
      discrepancyLogs: [
        {
          field: 'batchNumber',
          extractedValue: 'B-TOXIC-WHO',
          registryValue: 'MATCHED GLOBAL WHO LETHAL TOXIC recall lists (diethylene glycol contamination)',
          severity: 'high' as const
        }
      ],
      registryChecks: {
        fdaApproved: false,
        gs1SerialExists: false,
        batchActive: false,
        originCountryMismatch: true
      }
    },
    clinicalImpact: {
      severityLevel: 'lethal' as const,
      therapeuticInactionRisk: 'Fatal. The active formulation contains highly toxic concentrations of diethylene glycol (DEG) which leads to acute renal failure, encephalopathy, and cardiovascular collapse.',
      contaminantRisk: {
        suspectedToxins: ['Diethylene glycol (DEG)', 'Ethylene glycol'],
        toxicityDescription: 'Severe industrial solvent contaminants found in active glycerol base.'
      },
      publicHealthHazard: {
        communityExposureIndex: 94,
        marketInfiltrationRadiusMiles: 80,
        localPanicRating: 9
      }
    },
    actionsPlan: [
      {
        actionId: 'act_tox_quar',
        type: 'patient_quarantine' as const,
        title: 'EMERGENCY: Absolute Quarantine',
        description: 'Inform the patient of lethal toxicity risk.',
        recipientName: 'Consumer App UI',
        recipientEndpoint: 'Push Notification + Emergency Alert Audio',
        messagePayload: 'CRITICAL DANGER: Guaifenesin Syrup batch B-TOXIC-WHO is contaminated with diethylene glycol. Consuming this product causes fatal kidney failure. Flush immediately or hand over to healthcare responders.',
        priority: 'critical' as const,
        status: 'pending' as const
      },
      {
        actionId: 'act_tox_sms',
        type: 'broadcast_warning' as const,
        title: 'Emergency Community SMS Alert',
        description: 'Simulate localized emergency mobile cell broadcasts warning of lethal cough syrup distribution.',
        recipientName: 'Local Community Cell Tower',
        recipientEndpoint: 'Regional Broadcast API',
        messagePayload: 'HEALTH EMERGENCY: Contaminated Guaifenesin Syrup batch B-TOXIC-WHO is circulating in this area. Check your medicine cabinets immediately. Seek immediate emergency room care if consumed.',
        priority: 'critical' as const,
        status: 'pending' as const
      },
      {
        actionId: 'act_tox_recall',
        type: 'regulatory_report' as const,
        title: 'Immediate WHO / FDA Invalidation Recall',
        description: 'File emergency global safety recall notifications to suspend manufacturing plant distribution nodes.',
        recipientName: 'WHO GSPR Portal',
        recipientEndpoint: 'https://globalrecalls.who.int/emergency',
        messagePayload: 'CRITICAL RECALL DISPATCH: Guaifenesin Syrup batch B-TOXIC-WHO intercepted. Immediate serialization invalidation requested on international custom shipping gateways.',
        priority: 'critical' as const,
        status: 'pending' as const
      }
    ],
    simulation: {
      executionTimeline: [],
      stateChange: {
        metricsBefore: {
          exposureRisk: 95,
          distributorLiabilityScore: 99,
          patientRecoveryChance: 5,
          legalExposureScore: 90,
          supplyChainTrustRating: 15
        },
        metricsAfter: {
          exposureRisk: 2,
          distributorLiabilityScore: 8,
          patientRecoveryChance: 98,
          legalExposureScore: 10,
          supplyChainTrustRating: 70
        },
        ledgerTransactionsSimulated: [
          {
            transactionHash: '0xemergency96toxicledgerhash',
            actionApplied: 'LETHAL_CONTAMINANT_RECALL_DISPATCHED',
            nodesNotified: ['WHO Rapid Alert System', 'FDA recall division', 'Global Custom border control nodes']
          }
        ]
      }
    }
  }
};

export type ScenarioKey = keyof typeof MOCK_SCENARIOS;

export async function runLocalAgentSimulation(
  scenarioKey: ScenarioKey,
  onStateChange: (updatedScan: Partial<ScanDocument>) => void
) {
  const scenario = JSON.parse(JSON.stringify(MOCK_SCENARIOS[scenarioKey])) as ScanDocument;
  const timeline: Array<{ timestamp: string; agentName: string; message: string; systemLog: string }> = [];
  let dbScanId = scenario.id;
  if (isSupabaseActive) {
    if (scenario.id === 'scan_safe_singulair') dbScanId = '11111111-1111-1111-1111-111111111111';
    else if (scenario.id === 'scan_expired_lipitor') dbScanId = '22222222-2222-2222-2222-222222222222';
    else if (scenario.id === 'scan_fake_singulair') dbScanId = '33333333-3333-3333-3333-333333333333';
    else if (scenario.id === 'scan_toxic_contaminant') dbScanId = '44444444-4444-4444-4444-444444444444';
  }

  const addLog = async (agent: string, msg: string, system: string, step: 'OCR' | 'CLASSIFICATION' | 'VERIFICATION' | 'THREAT_MODELING' | 'DECISION') => {
    timeline.push({
      timestamp: new Date().toISOString(),
      agentName: agent,
      message: msg,
      systemLog: system
    });
    onStateChange({
      simulation: {
        ...scenario.simulation!,
        executionTimeline: [...timeline]
      }
    });

    if (isSupabaseActive) {
      // Fire-and-forget (non-blocking) so database issues never hang the UI thread
      supabase.from('agent_traces').insert({
        scan_id: dbScanId,
        step,
        agent_name: agent,
        thought_process: msg,
        output_payload: { system_log: system }
      }).then(({ error }) => {
        if (error) console.warn('Failed to insert trace to Supabase:', error);
      });
    }
  };

  // Step 1: Ingestion
  if (isSupabaseActive) {
    try {
      const { data: scan, error } = await supabase
        .from('medicine_scans')
        .insert({
          raw_ocr_text: scenario.ocrData?.rawText || '',
          image_url: scenario.imageUrl,
          gps_latitude: 37.7749,
          gps_longitude: -122.4194,
          device_info: { client: 'PharmaGuard Mobile Simulator' }
        })
        .select()
        .single();
      
      if (!error && scan) {
        dbScanId = scan.id;
        console.log('Successfully created scan record in Supabase medicine_scans:', dbScanId);
      }
    } catch (err) {
      console.warn('Failed to connect or create scan in Supabase:', err);
    }
  }

  onStateChange({ status: 'uploaded', id: dbScanId, imageUrl: scenario.imageUrl, createdAt: scenario.createdAt });
  await delay(1200);

  // Step 2: OCR Extractor
  onStateChange({ status: 'extracting' });
  await addLog('OCR_Agent', 'Initializing computer vision deskewing filters...', 'sharp_library_active: sharpen=1.5 contrast=1.2', 'OCR');
  await delay(800);
  await addLog('OCR_Agent', `Scanning package typography boundaries. Detected raw NDC code: ${scenario.ocrData?.ndc}`, `ocr_bounding_box: [x=45 y=12 h=80 w=230]`, 'OCR');
  await delay(1000);
  await addLog('OCR_Agent', `Metadata classification resolved. Brand: ${scenario.ocrData?.brandName}, Generic: ${scenario.ocrData?.genericName}, Serial: ${scenario.ocrData?.serialNumber}`, `regex_check: NDC_MATCH=SUCCESS SERIAL_MATCH=SUCCESS`, 'OCR');
  
  if (isSupabaseActive) {
    // Non-blocking write to Supabase
    supabase.from('medicine_analysis').insert({
      scan_id: dbScanId,
      extracted_name: scenario.ocrData?.brandName,
      extracted_manufacturer: scenario.ocrData?.manufacturer,
      extracted_batch_number: scenario.ocrData?.batchNumber,
      extracted_expiry_date: scenario.ocrData?.expiryDate,
      is_packaging_valid: scenario.riskAnalysis?.registryChecks.gs1SerialExists ?? true,
      is_expiry_valid: scenario.riskAnalysis?.registryChecks.batchActive ?? true,
      mismatch_details: scenario.riskAnalysis?.discrepancyLogs.map(d => `${d.field}: ${d.extractedValue}`) || []
    }).then(({ error }) => {
      if (error) console.warn('Failed to insert analysis in Supabase:', error);
    });
  }

  onStateChange({ ocrData: scenario.ocrData });
  await delay(1200);

  // Step 3: Verification Agent
  onStateChange({ status: 'analyzing' });
  await addLog('Medicine_Verification_Agent', `Accessing FDA NDC active registers for code ${scenario.ocrData?.ndc}...`, `rest_query: https://api.fda.gov/drugs/ndc/${scenario.ocrData?.ndc}`, 'VERIFICATION');
  await delay(1000);
  if (scenario.riskAnalysis?.registryChecks.fdaApproved) {
    await addLog('Medicine_Verification_Agent', `FDA registry confirmed: ${scenario.ocrData?.brandName} (${scenario.ocrData?.genericName}) is active and approved.`, 'registry_response_200: FDA_APPROVED=true', 'VERIFICATION');
  } else {
    await addLog('Medicine_Verification_Agent', `WARNING: NDC code is unregistered in FDA active databases!`, 'registry_response_404: FDA_APPROVED=false', 'VERIFICATION');
  }
  await delay(800);
  await addLog('Medicine_Verification_Agent', 'Connecting to GS1 Electronic Product Code supply registers...', 'rest_query: https://ledger.gs1.org/v1/verify-serial', 'VERIFICATION');
  await delay(1200);
  
  if (scenarioKey === 'EXPIRED_BATCH') {
    await addLog('Medicine_Verification_Agent', 'GS1 Audit: Serial exists, but current date exceeds registered EXPIRE details. Mismatch flagged.', 'gs1_exception: BATCH_EXPIRED=true', 'VERIFICATION');
  } else if (scenarioKey === 'COUNTERFEIT_PACKAGING') {
    await addLog('Medicine_Verification_Agent', 'GS1 Audit: Serial valid, but batch was registered as expired in Jun 2026. Packaging shows EXP 2027.', 'gs1_exception: DATE_FRAUD_FLAGGED=true', 'VERIFICATION');
  } else if (scenarioKey === 'TOXIC_CONTAMINANT') {
    await addLog('Medicine_Verification_Agent', 'CRITICAL AUDIT: Batch matches active WHO Alert listing B-TOXIC-WHO for fatal diethylene glycol.', 'who_recall_database: MATCH_FOUND=CRITICAL', 'VERIFICATION');
  } else {
    await addLog('Medicine_Verification_Agent', 'GS1 Audit: Serial validity, batch registration, and geographic origin validated.', 'gs1_auth: VERIFICATION=SUCCESS', 'VERIFICATION');
  }
  await delay(1200);

  // Step 4: Risk Analysis Agent
  await addLog('Risk_Analysis_Agent', 'Compiling visual and database discrepancy matrices...', 'bayesian_model_active: parameters=6', 'THREAT_MODELING');
  await delay(800);
  
  if (scenario.riskAnalysis!.score > 50) {
    await addLog('Risk_Analysis_Agent', `Discrepancy audit computed. Visual anomalies detected (logo offset: ${scenario.ocrData?.logoDisplacementMm}mm). Risk index: ${scenario.riskAnalysis?.score}%. Category: ${scenario.riskAnalysis?.category.toUpperCase()}`, `risk_matrix: logo_mismatch=0.40 batch_fraud=0.90`, 'THREAT_MODELING');
  } else if (scenario.riskAnalysis!.score > 15) {
    await addLog('Risk_Analysis_Agent', `Moderate discrepancies logged. Expiry check failed. Risk index: ${scenario.riskAnalysis?.score}%`, `risk_matrix: batch_expired=0.75`, 'THREAT_MODELING');
  } else {
    await addLog('Risk_Analysis_Agent', `Verification parameters complete. Zero anomalies resolved. Risk index: ${scenario.riskAnalysis?.score}%`, 'risk_matrix: clean=true', 'THREAT_MODELING');
  }

  if (isSupabaseActive) {
    // Non-blocking write to Supabase
    supabase.from('risk_assessments').insert({
      scan_id: dbScanId,
      overall_score: scenario.riskAnalysis?.score || 0,
      risk_level: scenario.riskAnalysis?.score! > 75 ? 'CRITICAL' : scenario.riskAnalysis?.score! > 50 ? 'HIGH' : scenario.riskAnalysis?.score! > 15 ? 'MEDIUM' : 'LOW',
      confidence_score: scenario.riskAnalysis?.confidence || 0,
      threat_matrix: scenario.riskAnalysis?.registryChecks || {},
      reasoning_summary: scenario.clinicalImpact?.therapeuticInactionRisk || ''
    }).then(({ error }) => {
      if (error) console.warn('Failed to insert assessment in Supabase:', error);
    });
  }

  onStateChange({ riskAnalysis: scenario.riskAnalysis, clinicalImpact: scenario.clinicalImpact });
  await delay(1400);

  // Step 5: Decision Agent
  onStateChange({ status: 'recommending' });
  await addLog('Decision_Agent', `Evaluating threat thresholds...`, `threshold_check: risk=${scenario.riskAnalysis?.score}`, 'DECISION');
  await delay(800);
  await addLog('Decision_Agent', `Formulating active containment strategy. Synthesized ${scenario.actionsPlan?.length} containment actions...`, 'generative_planning: standard_protocol=hazard', 'DECISION');
  await delay(1000);
  onStateChange({ actionsPlan: scenario.actionsPlan });
  await delay(1000);
}

export async function runLocalSimulationExecution(
  scenarioKey: ScenarioKey,
  onStateChange: (updatedScan: Partial<ScanDocument>) => void
) {
  const scenario = MOCK_SCENARIOS[scenarioKey];
  
  onStateChange({ status: 'simulating' });
  await delay(1200);

  let updatedStateChange = scenario.simulation.stateChange;

  let dbScanId = scenario.id;
  if (isSupabaseActive) {
    if (scenario.id === 'scan_safe_singulair') dbScanId = '11111111-1111-1111-1111-111111111111';
    else if (scenario.id === 'scan_expired_lipitor') dbScanId = '22222222-2222-2222-2222-222222222222';
    else if (scenario.id === 'scan_fake_singulair') dbScanId = '33333333-3333-3333-3333-333333333333';
    else if (scenario.id === 'scan_toxic_contaminant') dbScanId = '44444444-4444-4444-4444-444444444444';
  }

  if (isSupabaseActive) {
    try {
      // First ensure the target batch exists in inventory so the DB trigger works
      await supabase.from('inventory_status').insert({
        pharmacy_name: 'Metro Pharmacy',
        medicine_name: scenario.ocrData?.brandName || 'Unknown',
        batch_number: scenario.ocrData?.batchNumber || 'B-998822',
        stock_quantity: 450,
        status: 'ACTIVE'
      });

      // Insert action log to Supabase which triggers simulation trigger
      const { data: log, error } = await supabase
        .from('action_logs')
        .insert({
          scan_id: dbScanId,
          action_type: 'INVENTORY_BLOCK',
          status: 'PENDING',
          parameters: { batch_number: scenario.ocrData?.batchNumber }
        })
        .select()
        .single();
      
      if (!error && log) {
        console.log('Inserted simulation execution request to Supabase Action Logs:', log.id);
        
        // Query the state change updated by Postgres Trigger simulate_action_execution
        await delay(1500); // Wait for trigger to complete execution
        const { data: updatedLog } = await supabase
          .from('action_logs')
          .select('*')
          .eq('id', log.id)
          .single();
        
        if (updatedLog && updatedLog.before_state && updatedLog.after_state) {
          console.log('Supabase Trigger Executed Simulation successfully!');
          console.log('Before State:', updatedLog.before_state);
          console.log('After State:', updatedLog.after_state);
          
          // Map to state changes for UI dashboard
          updatedStateChange = {
            ...scenario.simulation.stateChange,
            ledgerTransactionsSimulated: [
              {
                transactionHash: '0x' + log.id.replace(/-/g, '').slice(0, 16),
                actionApplied: 'SUPABASE_TRIGGER_INVENTORY_BLOCK',
                nodesNotified: ['Supabase DB Node', 'Local Inventory Controller']
              }
            ]
          };
        }
      }
    } catch (err) {
      console.warn('Failed to execute database simulation trigger, falling back to local mocks:', err);
    }
  }

  // Simulation execution changes
  onStateChange({
    simulation: {
      executionTimeline: [
        {
          timestamp: new Date().toISOString(),
          agentName: 'Execution_Simulation_Agent',
          message: 'Modeling regional containment parameters...',
          systemLog: 'monte_carlo_runs=10000'
        },
        {
          timestamp: new Date().toISOString(),
          agentName: 'Execution_Simulation_Agent',
          message: `Exposure drops computed: Exposure risk drops by ${Math.abs(scenario.simulation.stateChange.metricsAfter.exposureRisk - scenario.simulation.stateChange.metricsBefore.exposureRisk)}%.`,
          systemLog: 'exposure_delta=success'
        }
      ],
      stateChange: updatedStateChange
    }
  });
  await delay(1500);

  // Completed & Notification dispatch
  onStateChange({ status: 'completed' });
}
