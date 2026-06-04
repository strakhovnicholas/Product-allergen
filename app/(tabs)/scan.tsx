import { ScreenSafeArea } from '../../components/ScreenSafeArea';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getUserProfileApi } from '../../src/api/profileApi';
import { recognizeLabelText } from '../../src/ocr/labelOcr';
import { parseIngredients, guessProductName } from '../../src/ocr/ingredientParser';
import { analyzeIngredients, type ScanAnalysisResult } from '../../src/ocr/ingredientSafety';
import { COLORS } from '../../src/styles/palette';
import { CONTROL, FONT, RADIUS, SHADOW, SPACING } from '../../src/styles/theme';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanAnalysisResult | null>(null);
  const [manualText, setManualText] = useState('');
  const [showManual, setShowManual] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  const runAnalysis = async (rawText: string) => {
    const ingredients = parseIngredients(rawText);
    if (ingredients.length === 0) {
      Alert.alert(
        'Не распознан состав',
        'Введите текст состава вручную или сделайте более чёткое фото. Для OCR нужна сборка приложения (не Expo Go).',
      );
      setShowManual(true);
      setManualText(rawText);
      return;
    }
    const profile = await getUserProfileApi();
    let result = analyzeIngredients(ingredients, profile);
    const productName = guessProductName(rawText);
    if (productName) result = { ...result, productName };

    setScanResult(result);
  };

  const takePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        setScanResult(null);
        setShowManual(false);
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось сделать фото.');
    } finally {
      setIsCapturing(false);
    }
  };

  const recognizePhoto = async () => {
    if (!capturedUri || isScanning) return;
    try {
      setIsScanning(true);
      const ocr = await recognizeLabelText(capturedUri);
      if (!ocr.text) {
        setShowManual(true);
        Alert.alert(
          'OCR недоступен',
          'Используйте development build (см. BUILD_PHONE.md) или вставьте текст состава вручную.',
        );
        return;
      }
      await runAnalysis(ocr.text);
    } catch {
      Alert.alert('Ошибка', 'Не удалось распознать этикетку.');
    } finally {
      setIsScanning(false);
    }
  };

  if (!permission) {
    return (
      <ScreenSafeArea style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} />
      </ScreenSafeArea>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenSafeArea style={styles.centered}>
        <Ionicons name="camera-outline" size={56} color={COLORS.primary} />
        <Text style={styles.permissionTitle}>Нужен доступ к камере</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Разрешить камеру</Text>
        </TouchableOpacity>
      </ScreenSafeArea>
    );
  }

  return (
    <ScreenSafeArea style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Сканер этикетки</Text>
        <Text style={styles.subtitle}>
          Фото → OCR на устройстве → проверка аллергенов по вашему профилю (без GigaChat).
        </Text>

        <View style={styles.cameraCard}>
          {capturedUri ? (
            <Image source={{ uri: capturedUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, isCapturing && styles.disabledButton]}
            onPress={() => {
              setCapturedUri(null);
              setScanResult(null);
              setShowManual(false);
            }}
            disabled={!capturedUri || isCapturing || isScanning}
          >
            <Text style={styles.secondaryButtonText}>Снять заново</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, (isCapturing || isScanning) && styles.disabledButton]}
            onPress={capturedUri ? recognizePhoto : takePhoto}
            disabled={isCapturing || isScanning}
          >
            {isCapturing || isScanning ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {capturedUri ? 'Распознать состав' : 'Сфотографировать'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setShowManual((v) => !v)}>
          <Text style={styles.linkText}>
            {showManual ? 'Скрыть ввод вручную' : 'Ввести текст состава вручную'}
          </Text>
        </TouchableOpacity>

        {showManual && (
          <View style={styles.manualBox}>
            <TextInput
              style={styles.manualInput}
              multiline
              placeholder="Вставьте текст с этикетки..."
              value={manualText}
              onChangeText={setManualText}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => void runAnalysis(manualText)}
            >
              <Text style={styles.primaryButtonText}>Анализировать текст</Text>
            </TouchableOpacity>
          </View>
        )}

        {scanResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultTitle}>Результат анализа</Text>
                <Text style={styles.resultProduct}>{scanResult.productName}</Text>
              </View>
              <View style={[styles.riskBadge, { backgroundColor: `${scanResult.riskColor}22` }]}>
                <Text style={[styles.riskBadgeText, { color: scanResult.riskColor }]}>
                  {scanResult.riskLabel}
                </Text>
              </View>
            </View>

            <View style={styles.scoreCard}>
              <View style={[styles.scoreCircle, { borderColor: scanResult.riskColor }]}>
                <Text style={[styles.scoreValue, { color: scanResult.riskColor }]}>
                  {scanResult.score}
                </Text>
                <Text style={styles.scoreFrom}>/100</Text>
              </View>
              <View style={styles.scoreTextWrap}>
                <Text style={styles.scoreTitle}>Оценка продукта</Text>
                <Text style={styles.scoreDescription}>
                  Чем выше оценка, тем безопаснее состав для вашего профиля.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Состав</Text>
            <View style={styles.chipsWrap}>
              {scanResult.ingredients.map((item) => {
                const isProblem = scanResult.problematic.includes(item);
                return (
                  <View
                    key={item}
                    style={[styles.ingredientChip, isProblem && styles.ingredientChipProblem]}
                  >
                    <Text
                      style={[
                        styles.ingredientChipText,
                        isProblem && styles.ingredientChipTextProblem,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Обнаружены риски</Text>
            {scanResult.problematic.length ? (
              scanResult.problematic.map((item) => (
                <Text key={item} style={styles.allergenText}>
                  • {item}
                </Text>
              ))
            ) : (
              <Text style={styles.resultText}>Проблемных ингредиентов не найдено.</Text>
            )}

            <Text style={styles.sectionTitle}>Рекомендация</Text>
            <Text style={styles.resultText}>{scanResult.recommendation}</Text>
          </View>
        )}
      </ScrollView>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scrollContent: { padding: SPACING.md, gap: SPACING.sm },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
    gap: 10,
  },
  title: { fontSize: FONT.headline, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { color: COLORS.textSecondary, lineHeight: 20, fontSize: FONT.body },
  linkText: { color: COLORS.primary, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  manualBox: { gap: 8 },
  manualInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    padding: 12,
    backgroundColor: COLORS.surface,
    textAlignVertical: 'top',
  },
  cameraCard: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: '#030712',
    shadowColor: '#050814',
    ...SHADOW.soft,
  },
  camera: { width: '100%', aspectRatio: 3 / 4 },
  previewImage: { width: '100%', aspectRatio: 3 / 4, backgroundColor: '#030712' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  primaryButton: {
    flex: 1,
    height: CONTROL.buttonHeight,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryStrong,
    ...SHADOW.soft,
  },
  primaryButtonText: { color: COLORS.textInverse, fontWeight: '700', fontSize: FONT.body },
  secondaryButton: {
    flex: 1,
    height: CONTROL.buttonHeight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: COLORS.textPrimary, fontWeight: '600', fontSize: FONT.body },
  disabledButton: { opacity: 0.65 },
  permissionTitle: { fontSize: FONT.title, fontWeight: '700', color: COLORS.textPrimary },
  resultCard: {
    marginTop: 4,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    padding: 14,
    gap: 10,
    shadowColor: '#050814',
    ...SHADOW.soft,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  resultTitle: { fontSize: FONT.title, fontWeight: '700', color: COLORS.textPrimary },
  resultProduct: { color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  riskBadge: { borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 6 },
  riskBadgeText: { fontWeight: '700', fontSize: 12 },
  scoreCard: {
    flexDirection: 'row',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceAlt,
  },
  scoreCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  scoreValue: { fontSize: 22, fontWeight: '800', lineHeight: 24 },
  scoreFrom: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  scoreTextWrap: { flex: 1 },
  scoreTitle: { fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  scoreDescription: { color: COLORS.textSecondary, lineHeight: 18, fontSize: FONT.caption },
  sectionTitle: { marginTop: 6, color: COLORS.textSecondary, fontWeight: '700' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ingredientChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.primarySoft,
  },
  ingredientChipProblem: { backgroundColor: COLORS.dangerSoft },
  ingredientChipText: { color: COLORS.primary, fontWeight: '600', fontSize: 12 },
  ingredientChipTextProblem: { color: COLORS.danger },
  resultText: { color: COLORS.textPrimary },
  allergenText: { color: COLORS.danger, fontWeight: '600' },
});
