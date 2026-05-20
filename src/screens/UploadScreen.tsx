import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, ChevronLeft, Database, Info, Upload, Image as ImageIcon, Zap } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../navigation/types';
import { useScanStore } from '../store/useScanStore';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

type ScenarioKey = 'SAFE_DRUG' | 'EXPIRED_BATCH' | 'COUNTERFEIT_PACKAGING' | 'TOXIC_CONTAMINANT';

export default function UploadScreen() {
  const navigation = useNavigation<NavigationProp<'UploadMedicine'>>();
  const setScanId = useScanStore((state) => state.setScanId);
  const resetScan = useScanStore((state) => state.resetScan);

  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>('COUNTERFEIT_PACKAGING');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const hasGeminiKey = !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  // ─── Real Mode: Pick image from camera or gallery ─────────────
  const pickImage = async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera/Gallery access is needed to scan medicine packaging.');
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: false })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            base64: false,
          });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // ─── Real Mode: Process image and launch pipeline ─────────────
  const handleRealScan = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please capture or select a medicine packaging image first.');
      return;
    }
    if (!hasGeminiKey) {
      Alert.alert('API Key Missing', 'Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file to use real AI scanning.');
      return;
    }

    setIsProcessing(true);
    try {
      // Resize + convert to base64
      const manipulated = await ImageManipulator.manipulateAsync(
        selectedImage,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      resetScan();
      navigation.navigate('OcrAnalysis', {
        mode: 'real',
        imageBase64: manipulated.base64!,
      });
    } catch (err) {
      console.error('Image processing error:', err);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Demo Mode: Use mock scenario ─────────────────────────────
  const handleDemoScan = () => {
    resetScan();
    navigation.navigate('OcrAnalysis', { scenarioId: selectedScenario, mode: 'demo' });
  };

  const getScenarioLabel = (key: ScenarioKey) => {
    switch (key) {
      case 'SAFE_DRUG': return 'Safe: Singulair 10mg (Merck)';
      case 'EXPIRED_BATCH': return 'Expired & Mismatch: Lipitor 20mg (Pfizer)';
      case 'COUNTERFEIT_PACKAGING': return 'Counterfeit: Singulair 10mg (Arial/Offset)';
      case 'TOXIC_CONTAMINANT': return 'WHO Alert: Contaminated Guaifenesin Syrup';
    }
  };

  return (
    <LinearGradient
      colors={[THEME.colors.background, THEME.colors.backgroundDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ingestion Center</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ═══ REAL SCAN MODE ═══ */}
          <GlassCard style={[styles.modeCard, { borderColor: hasGeminiKey ? THEME.colors.primary : THEME.colors.border }]}>
            <View style={styles.sectionHeader}>
              <Zap size={18} color={THEME.colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: THEME.colors.primary }]}>
                AI SCAN MODE {!hasGeminiKey && '(KEY REQUIRED)'}
              </Text>
            </View>
            <Text style={styles.sectionDesc}>
              Capture or upload real medicine packaging. Gemini AI will extract text and analyze counterfeit risk.
            </Text>

            {/* Image Preview / Camera Controls */}
            <View style={styles.imageArea}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} resizeMode="contain" />
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Camera size={36} color="rgba(255,255,255,0.15)" />
                  <Text style={styles.cameraPlaceholderText}>NO IMAGE SELECTED</Text>
                </View>
              )}
            </View>

            <View style={styles.imageButtonRow}>
              <TouchableOpacity
                style={[styles.imageButton, { borderColor: THEME.colors.primary }]}
                onPress={() => pickImage(true)}
              >
                <Camera size={16} color={THEME.colors.primary} />
                <Text style={[styles.imageButtonText, { color: THEME.colors.primary }]}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.imageButton, { borderColor: THEME.colors.accent }]}
                onPress={() => pickImage(false)}
              >
                <ImageIcon size={16} color={THEME.colors.accent} />
                <Text style={[styles.imageButtonText, { color: THEME.colors.accent }]}>Gallery</Text>
              </TouchableOpacity>
            </View>

            <PrimaryButton
              title={isProcessing ? 'PROCESSING...' : 'RUN GEMINI AI ANALYSIS'}
              variant="emerald"
              onPress={handleRealScan}
              style={{ marginTop: THEME.spacing.sm, opacity: (hasGeminiKey && selectedImage && !isProcessing) ? 1 : 0.5 }}
            />
          </GlassCard>

          {/* ═══ DEMO MODE ═══ */}
          <GlassCard style={styles.modeCard}>
            <View style={styles.sectionHeader}>
              <Database size={18} color={THEME.colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: THEME.colors.accent }]}>DEMO SIMULATION MODE</Text>
            </View>
            <Text style={styles.sectionDesc}>
              Select a pre-built scenario to demo the full pipeline with mock data.
            </Text>

            <View style={styles.scenarioList}>
              {(['SAFE_DRUG', 'EXPIRED_BATCH', 'COUNTERFEIT_PACKAGING', 'TOXIC_CONTAMINANT'] as const).map((key) => {
                const isActive = selectedScenario === key;
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.8}
                    style={[
                      styles.scenarioOption,
                      isActive && { borderColor: THEME.colors.accent, backgroundColor: 'rgba(0, 229, 255, 0.05)' },
                    ]}
                    onPress={() => setSelectedScenario(key)}
                  >
                    <View style={[styles.radioCircle, isActive && { borderColor: THEME.colors.accent, backgroundColor: THEME.colors.accent }]} />
                    <Text style={[styles.scenarioText, isActive && { color: '#FFF', fontWeight: 'bold' }]}>
                      {getScenarioLabel(key)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <PrimaryButton
              title="RUN DEMO SIMULATION"
              variant="cyan"
              onPress={handleDemoScan}
              style={{ marginTop: THEME.spacing.sm }}
            />
          </GlassCard>

          {/* Footer Info */}
          <View style={styles.footerInfo}>
            <Info size={14} color={THEME.colors.textDark} style={{ marginRight: 6 }} />
            <Text style={styles.footerText}>
              AI Scan uses Gemini 2.0 Flash Vision for real OCR extraction and counterfeit analysis. Demo mode uses pre-built mock scenarios.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    height: 56,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: THEME.colors.backgroundLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: THEME.colors.border,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5 },
  content: { padding: THEME.spacing.md, paddingBottom: 40 },
  modeCard: { padding: THEME.spacing.md, marginBottom: THEME.spacing.md, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: THEME.spacing.xs },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5 },
  sectionDesc: { fontSize: 11, color: THEME.colors.textSecondary, lineHeight: 16, marginBottom: THEME.spacing.md },
  imageArea: {
    height: 180, borderRadius: 12, borderWidth: 1, borderColor: THEME.colors.border,
    overflow: 'hidden', backgroundColor: '#050709', marginBottom: THEME.spacing.sm,
  },
  imagePreview: { width: '100%', height: '100%' },
  cameraPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  cameraPlaceholderText: {
    fontSize: 10, color: THEME.colors.textDark, letterSpacing: 1.5, marginTop: THEME.spacing.sm, fontWeight: '600',
  },
  imageButtonRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: THEME.spacing.xs,
  },
  imageButton: {
    flex: 0.48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 42, borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.02)',
  },
  imageButtonText: { fontSize: 13, fontWeight: '600', marginLeft: 8 },
  scenarioList: { marginBottom: THEME.spacing.sm },
  scenarioOption: {
    flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 10,
    borderWidth: 1, borderColor: THEME.colors.border,
    backgroundColor: 'rgba(255,255,255,0.01)', paddingHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  radioCircle: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 1.5, borderColor: THEME.colors.textDark, marginRight: THEME.spacing.md,
  },
  scenarioText: { fontSize: 12, color: THEME.colors.textSecondary },
  footerInfo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: THEME.spacing.md, paddingHorizontal: THEME.spacing.md,
  },
  footerText: { fontSize: 10, color: THEME.colors.textDark, textAlign: 'center', lineHeight: 14, flex: 1 },
});
