import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS } from '../../src/styles/palette';
import { CONTROL, FONT, RADIUS, SHADOW, SPACING } from '../../src/styles/theme';

type DemoScanResult = {
  productName: string;
  score: number;
  riskLabel: 'Низкий риск' | 'Средний риск' | 'Высокий риск';
  riskColor: string;
  ingredients: string[];
  problematic: string[];
  recommendation: string;
};

const DEMO_RESULT: DemoScanResult = {
  productName: 'Шоколадный батончик (демо)',
  score: 42,
  riskLabel: 'Средний риск',
  riskColor: COLORS.warning,
  ingredients: [
    'Сахар',
    'Какао-порошок',
    'Сухое молоко',
    'Соевый лецитин',
    'Ароматизатор ваниль',
  ],
  problematic: ['Сухое молоко', 'Соевый лецитин'],
  recommendation:
    'Учитывая ваш профиль, лучше ограничить этот продукт. Выбирайте вариант без молока и сои.',
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DemoScanResult | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

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
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось сделать фото. Попробуйте еще раз.');
    } finally {
      setIsCapturing(false);
    }
  };

  const showDemoResult = async () => {
    if (!capturedUri || isScanning) return;
    try {
      setIsScanning(true);
      // Temporary stub: product analysis UI without backend dependency.
      await new Promise((resolve) => setTimeout(resolve, 850));
      setScanResult(DEMO_RESULT);
    } catch {
      Alert.alert('Ошибка', 'Не удалось показать демо-результат.');
    } finally {
      setIsScanning(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="camera-outline" size={56} color={COLORS.primary} />
        <Text style={styles.permissionTitle}>Нужен доступ к камере</Text>
        <Text style={styles.permissionText}>
          Фото не сохраняется в галерею и используется только для анализа состава.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Разрешить камеру</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Сканер этикетки</Text>
        <Text style={styles.subtitle}>
          Сделайте фото состава и нажмите «Отправить в AI». Пока отобразится демо-экран результата.
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
            }}
            disabled={!capturedUri || isCapturing || isScanning}
          >
            <Text style={styles.secondaryButtonText}>Снять заново</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, (isCapturing || isScanning) && styles.disabledButton]}
            onPress={capturedUri ? showDemoResult : takePhoto}
            disabled={isCapturing || isScanning}
          >
            {isCapturing || isScanning ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {capturedUri ? 'Отправить в AI' : 'Сфотографировать'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

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
                    style={[
                      styles.ingredientChip,
                      isProblem && styles.ingredientChipProblem,
                    ]}
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
    </SafeAreaView>
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
  permissionText: { color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, fontSize: FONT.body },
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
  riskBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
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
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.primarySoft,
  },
  ingredientChipProblem: {
    backgroundColor: COLORS.dangerSoft,
  },
  ingredientChipText: { color: COLORS.primary, fontWeight: '600', fontSize: 12 },
  ingredientChipTextProblem: { color: COLORS.danger },
  resultText: { color: COLORS.textPrimary },
  allergenText: { color: COLORS.danger, fontWeight: '600' },
});
