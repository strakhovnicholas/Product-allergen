import { ScreenSafeArea } from '../../components/ScreenSafeArea';

import { Ionicons } from '@expo/vector-icons';

import { CameraView, useCameraPermissions } from 'expo-camera';

import * as Haptics from 'expo-haptics';

import { useEffect, useRef, useState } from 'react';

import {

  ActivityIndicator,

  Alert,

  Dimensions,

  Image,

  Platform,

  ScrollView,

  StyleSheet,

  Text,

  TextInput,

  TouchableOpacity,

  View,

} from 'react-native';

import Animated, {

  Easing,

  useAnimatedStyle,

  useSharedValue,

  withRepeat,

  withSequence,

  withTiming,

} from 'react-native-reanimated';



import { analyzeLabelPhotoApi } from '../../src/api/scanApi';

import { getUserProfileApi } from '../../src/api/profileApi';

import { recognizeLabelText } from '../../src/ocr/labelOcr';

import { parseIngredients, guessProductName } from '../../src/ocr/ingredientParser';

import { analyzeIngredients, type ScanAnalysisResult } from '../../src/ocr/ingredientSafety';

import { COLORS, withAlpha } from '../../src/styles/palette';

import { CONTROL, FONT, RADIUS, SHADOW, SPACING } from '../../src/styles/theme';



const PREVIEW_HEIGHT = Math.round(Dimensions.get('window').width * (4 / 3));



const SCAN_TIPS = [

  { icon: 'sunny-outline' as const, text: 'Хорошее освещение' },

  { icon: 'scan-outline' as const, text: 'Блок «Состав»' },

  { icon: 'hand-left-outline' as const, text: 'Держите ровно' },

] as const;



function displayRecommendation(text: string): string {

  if (/giga\s*chat|гига\s*чат/i.test(text)) {

    return 'Не удалось сформировать рекомендацию. Попробуйте снять этикетку заново.';

  }

  return text;

}



function ScanPulseRing({ active, color }: { active: boolean; color: string }) {

  const scale = useSharedValue(1);

  const opacity = useSharedValue(0.55);



  useEffect(() => {

    if (!active) {

      scale.value = 1;

      opacity.value = 0;

      return;

    }

    scale.value = withRepeat(

      withSequence(

        withTiming(1, { duration: 0 }),

        withTiming(1.22, { duration: 900, easing: Easing.out(Easing.quad) }),

      ),

      -1,

      false,

    );

    opacity.value = withRepeat(

      withSequence(

        withTiming(0.55, { duration: 0 }),

        withTiming(0, { duration: 900, easing: Easing.out(Easing.quad) }),

      ),

      -1,

      false,

    );

  }, [active, opacity, scale]);



  const ringStyle = useAnimatedStyle(() => ({

    transform: [{ scale: scale.value }],

    opacity: opacity.value,

  }));



  if (!active) return null;



  return (

    <Animated.View

      pointerEvents="none"

      style={[styles.pulseRing, { borderColor: color }, ringStyle]}

    />

  );

}



function ViewfinderOverlay({ hint }: { hint: string }) {

  return (

    <View style={styles.viewfinder} pointerEvents="none">

      <View style={[styles.corner, styles.cornerTL]} />

      <View style={[styles.corner, styles.cornerTR]} />

      <View style={[styles.corner, styles.cornerBL]} />

      <View style={[styles.corner, styles.cornerBR]} />

      <View style={styles.viewfinderHintWrap}>

        <Ionicons name="scan-outline" size={16} color="#fff" />

        <Text style={styles.viewfinderHint}>{hint}</Text>

      </View>

    </View>

  );

}



export default function ScanScreen() {

  const [permission, requestPermission] = useCameraPermissions();

  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);

  const [isScanning, setIsScanning] = useState(false);

  const [scanResult, setScanResult] = useState<ScanAnalysisResult | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [manualText, setManualText] = useState('');

  const [showManual, setShowManual] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);



  const shutterScale = useSharedValue(1);

  const shutterStyle = useAnimatedStyle(() => ({

    transform: [{ scale: shutterScale.value }],

  }));



  useEffect(() => {

    if (capturedUri || isScanning || isCapturing) {

      shutterScale.value = 1;

      return;

    }

    shutterScale.value = withRepeat(

      withSequence(

        withTiming(1, { duration: 0 }),

        withTiming(1.06, { duration: 700, easing: Easing.inOut(Easing.ease) }),

        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),

      ),

      -1,

      false,

    );

  }, [capturedUri, isCapturing, isScanning, shutterScale]);



  const runLocalAnalysis = async (rawText: string) => {

    const ingredients = parseIngredients(rawText);

    if (ingredients.length === 0) {

      Alert.alert(

        'Не распознан состав',

        'Введите текст состава вручную или сделайте более чёткое фото.',

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

    setStatusMessage(null);

  };



  const analyzeOnServer = async (uri: string) => {

    setIsScanning(true);

    setErrorMessage(null);

    setScanResult(null);

    setStatusMessage('Считываем состав и сверяем с вашим профилем…');

    try {

      const result = await analyzeLabelPhotoApi(uri);

      setScanResult(result);

      setStatusMessage(null);

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (e) {

      const msg = e instanceof Error ? e.message : 'Не удалось проанализировать этикетку.';

      setErrorMessage(msg);

      setStatusMessage(null);

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      Alert.alert('Ошибка анализа', msg);

    } finally {

      setIsScanning(false);

    }

  };



  const takePhoto = async () => {

    if (!cameraRef.current || isCapturing) return;

    try {

      setIsCapturing(true);

      setErrorMessage(null);

      setStatusMessage(null);

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({

        quality: 0.85,

        skipProcessing: Platform.OS === 'ios',

      });

      if (photo?.uri) {

        setCapturedUri(photo.uri);

        setScanResult(null);

        setShowManual(false);

        if (Platform.OS !== 'web') {

          await analyzeOnServer(photo.uri);

        } else {

          setStatusMessage('Нажмите «Повторить анализ» для отправки на сервер');

        }

      } else {

        Alert.alert('Ошибка', 'Фото не сохранилось. Попробуйте ещё раз.');

      }

    } catch {

      Alert.alert('Ошибка', 'Не удалось сделать фото.');

    } finally {

      setIsCapturing(false);

    }

  };



  const recognizePhotoLocal = async () => {

    if (!capturedUri || isScanning) return;

    try {

      setIsScanning(true);

      setErrorMessage(null);

      setStatusMessage('Локальное распознавание текста…');

      const ocr = await recognizeLabelText(capturedUri);

      if (!ocr.text) {

        setShowManual(true);

        setStatusMessage(null);

        Alert.alert(

          'OCR недоступен',

          'Используйте анализ на сервере или вставьте текст вручную.',

        );

        return;

      }

      await runLocalAnalysis(ocr.text);

    } catch {

      setErrorMessage('Не удалось распознать этикетку локально.');

      Alert.alert('Ошибка', 'Не удалось распознать этикетку.');

    } finally {

      setIsScanning(false);

    }

  };



  const resetCapture = () => {

    setCapturedUri(null);

    setScanResult(null);

    setShowManual(false);

    setStatusMessage(null);

    setErrorMessage(null);

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

        <View style={styles.permissionIconWrap}>

          <Ionicons name="camera-outline" size={40} color={COLORS.primary} />

        </View>

        <Text style={styles.permissionTitle}>Нужен доступ к камере</Text>

        <Text style={styles.permissionHint}>

          Без камеры нельзя сфотографировать состав на упаковке.

        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>

          <Text style={styles.primaryButtonText}>Разрешить камеру</Text>

        </TouchableOpacity>

      </ScreenSafeArea>

    );

  }



  const showLiveCamera = !capturedUri;

  const busy = isCapturing || isScanning;



  return (

    <ScreenSafeArea style={styles.container}>

      <ScrollView

        contentContainerStyle={styles.scrollContent}

        keyboardShouldPersistTaps="handled"

        showsVerticalScrollIndicator={false}

      >

        <View style={styles.heroCard}>

          <View style={styles.heroIconWrap}>

            <Ionicons name="nutrition-outline" size={26} color={COLORS.textInverse} />

          </View>

          <View style={styles.heroTextWrap}>

            <Text style={styles.heroTitle}>Проверка состава</Text>

            <Text style={styles.heroSubtitle}>

              Сфотографируйте блок «Состав» — приложение сравнит ингредиенты с вашим профилем.

            </Text>

          </View>

        </View>



        <View style={styles.tipsRow}>

          {SCAN_TIPS.map((tip) => (

            <View key={tip.text} style={styles.tipChip}>

              <Ionicons name={tip.icon} size={14} color={COLORS.primary} />

              <Text style={styles.tipChipText}>{tip.text}</Text>

            </View>

          ))}

        </View>



        <View style={[styles.cameraCard, { height: PREVIEW_HEIGHT }]}>

          {capturedUri ? (

            <>

              <Image

                source={{ uri: capturedUri }}

                style={styles.previewImage}

                resizeMode="contain"

              />

              {!isScanning && <View style={styles.previewBadge}>

                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />

                <Text style={styles.previewBadgeText}>Снимок готов</Text>

              </View>}

            </>

          ) : (

            <>

              <CameraView ref={cameraRef} style={styles.camera} facing="back" />

              <ViewfinderOverlay hint="Наведите на блок «Состав»" />

            </>

          )}



          {isScanning && (

            <View style={styles.previewOverlay}>

              <ScanPulseRing active color={COLORS.primaryBright} />

              <View style={styles.scanLoaderCore}>

                <ActivityIndicator size="large" color="#fff" />

              </View>

              <Text style={styles.overlayTitle}>Анализируем этикетку</Text>

              <Text style={styles.overlayText}>Обычно 30–90 секунд</Text>

            </View>

          )}

        </View>



        {statusMessage ? (

          <View style={styles.statusBanner}>

            <ActivityIndicator size="small" color={COLORS.primary} />

            <Text style={styles.statusText}>{statusMessage}</Text>

          </View>

        ) : null}



        {errorMessage ? (

          <View style={styles.errorBanner}>

            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />

            <Text style={styles.errorText}>{errorMessage}</Text>

          </View>

        ) : null}



        {showLiveCamera ? (

          <View style={styles.captureSection}>

            <Animated.View style={shutterStyle}>

              <TouchableOpacity

                style={[styles.shutterButton, busy && styles.shutterButtonDisabled]}

                onPress={() => void takePhoto()}

                disabled={busy}

                activeOpacity={0.85}

              >

                {isCapturing ? (

                  <ActivityIndicator color={COLORS.primary} />

                ) : (

                  <View style={styles.shutterInner} />

                )}

              </TouchableOpacity>

            </Animated.View>

            <Text style={styles.shutterHint}>Нажмите, чтобы сфотографировать</Text>

          </View>

        ) : (

          <View style={styles.actionsRow}>

            <TouchableOpacity

              style={[styles.secondaryButton, busy && styles.disabledButton]}

              onPress={resetCapture}

              disabled={busy}

            >

              <Ionicons name="refresh-outline" size={18} color={COLORS.textPrimary} />

              <Text style={styles.secondaryButtonText}>Заново</Text>

            </TouchableOpacity>



            <TouchableOpacity

              style={[styles.primaryButton, busy && styles.disabledButton]}

              onPress={() => void analyzeOnServer(capturedUri)}

              disabled={busy}

            >

              {busy ? (

                <ActivityIndicator color={COLORS.textInverse} />

              ) : (

                <>

                  <Ionicons name="sparkles-outline" size={18} color={COLORS.textInverse} />

                  <Text style={styles.primaryButtonText}>Повторить анализ</Text>

                </>

              )}

            </TouchableOpacity>

          </View>

        )}



        {capturedUri && Platform.OS === 'web' ? (

          <TouchableOpacity

            style={styles.linkButton}

            onPress={() => void recognizePhotoLocal()}

            disabled={isScanning}

          >

            <Text style={styles.linkText}>Локальное OCR (только dev build)</Text>

          </TouchableOpacity>

        ) : null}



        <TouchableOpacity onPress={() => setShowManual((v) => !v)} style={styles.manualToggle}>

          <Ionicons

            name={showManual ? 'chevron-up-outline' : 'create-outline'}

            size={16}

            color={COLORS.primary}

          />

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

              placeholderTextColor={COLORS.textMuted}

              value={manualText}

              onChangeText={setManualText}

            />

            <TouchableOpacity

              style={styles.primaryButton}

              onPress={() => void runLocalAnalysis(manualText)}

            >

              <Text style={styles.primaryButtonText}>Анализировать текст</Text>

            </TouchableOpacity>

          </View>

        )}



        {scanResult && (

          <View style={styles.resultCard}>

            <View style={styles.resultHeader}>

              <View style={{ flex: 1 }}>

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

              {scanResult.ingredients.length ? (

                scanResult.ingredients.map((item, index) => {

                  const isProblem = scanResult.problematic.includes(item);

                  return (

                    <View

                      key={`${item}-${index}`}

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

                })

              ) : (

                <Text style={styles.resultTextMuted}>Ингредиенты не распознаны</Text>

              )}

            </View>



            <Text style={styles.sectionTitle}>Обнаружены риски</Text>

            {scanResult.problematic.length ? (

              scanResult.problematic.map((item, index) => (

                <View key={`${item}-${index}`} style={styles.riskRow}>

                  <Ionicons name="warning-outline" size={16} color={COLORS.danger} />

                  <Text style={styles.allergenText}>{item}</Text>

                </View>

              ))

            ) : (

              <View style={styles.safeRow}>

                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.success} />

                <Text style={styles.safeText}>Проблемных ингредиентов не найдено</Text>

              </View>

            )}



            <Text style={styles.sectionTitle}>Рекомендация</Text>

            <Text style={styles.resultText}>

              {displayRecommendation(scanResult.recommendation)}

            </Text>

          </View>

        )}

      </ScrollView>

    </ScreenSafeArea>

  );

}



const CORNER_SIZE = 22;

const CORNER_THICK = 3;



const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: COLORS.bgPrimary },

  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xl, gap: SPACING.sm },

  centered: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    padding: 24,

    backgroundColor: COLORS.background,

    gap: 12,

  },

  heroCard: {

    flexDirection: 'row',

    gap: 12,

    padding: 14,

    borderRadius: RADIUS.lg,

    backgroundColor: COLORS.heroStart,

    ...SHADOW.medium,

  },

  heroIconWrap: {

    width: 48,

    height: 48,

    borderRadius: 14,

    backgroundColor: withAlpha('#FFFFFF', 0.18),

    alignItems: 'center',

    justifyContent: 'center',

  },

  heroTextWrap: { flex: 1, gap: 4 },

  heroTitle: {

    fontSize: FONT.title,

    fontWeight: '800',

    color: COLORS.textInverse,

  },

  heroSubtitle: {

    color: withAlpha('#FFFFFF', 0.9),

    lineHeight: 20,

    fontSize: FONT.body,

  },

  tipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  tipChip: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,

    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: RADIUS.pill,

    backgroundColor: COLORS.surface,

    borderWidth: 1,

    borderColor: COLORS.borderSoft,

  },

  tipChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },

  statusBanner: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 10,

    padding: 12,

    borderRadius: RADIUS.md,

    backgroundColor: COLORS.primarySoft,

    borderWidth: 1,

    borderColor: COLORS.borderSoft,

  },

  statusText: { flex: 1, color: COLORS.textPrimary, fontSize: FONT.body, fontWeight: '500' },

  errorBanner: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    gap: 8,

    padding: 12,

    borderRadius: RADIUS.md,

    backgroundColor: COLORS.dangerSoft,

    borderWidth: 1,

    borderColor: withAlpha(COLORS.danger, 0.25),

  },

  errorText: { flex: 1, color: COLORS.danger, fontSize: FONT.caption, lineHeight: 18 },

  linkText: { color: COLORS.primary, fontWeight: '600', fontSize: FONT.body },

  linkButton: { paddingVertical: 4, alignSelf: 'center' },

  manualToggle: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 6,

    paddingVertical: 4,

  },

  manualBox: { gap: 8 },

  manualInput: {

    minHeight: 100,

    borderWidth: 1,

    borderColor: COLORS.borderSoft,

    borderRadius: RADIUS.md,

    padding: 12,

    backgroundColor: COLORS.surface,

    textAlignVertical: 'top',

    color: COLORS.textPrimary,

  },

  cameraCard: {

    width: '100%',

    borderRadius: RADIUS.lg,

    overflow: 'hidden',

    borderWidth: 1,

    borderColor: COLORS.borderSoft,

    backgroundColor: '#030712',

    shadowColor: '#050814',

    ...SHADOW.soft,

  },

  camera: { flex: 1, width: '100%' },

  previewImage: { width: '100%', height: '100%' },

  previewBadge: {

    position: 'absolute',

    top: 12,

    left: 12,

    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,

    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: RADIUS.pill,

    backgroundColor: withAlpha('#000000', 0.55),

  },

  previewBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  viewfinder: {

    ...StyleSheet.absoluteFillObject,

    alignItems: 'center',

    justifyContent: 'center',

  },

  corner: {

    position: 'absolute',

    width: CORNER_SIZE,

    height: CORNER_SIZE,

    borderColor: withAlpha('#FFFFFF', 0.95),

  },

  cornerTL: {

    top: '18%',

    left: '10%',

    borderTopWidth: CORNER_THICK,

    borderLeftWidth: CORNER_THICK,

    borderTopLeftRadius: 8,

  },

  cornerTR: {

    top: '18%',

    right: '10%',

    borderTopWidth: CORNER_THICK,

    borderRightWidth: CORNER_THICK,

    borderTopRightRadius: 8,

  },

  cornerBL: {

    bottom: '22%',

    left: '10%',

    borderBottomWidth: CORNER_THICK,

    borderLeftWidth: CORNER_THICK,

    borderBottomLeftRadius: 8,

  },

  cornerBR: {

    bottom: '22%',

    right: '10%',

    borderBottomWidth: CORNER_THICK,

    borderRightWidth: CORNER_THICK,

    borderBottomRightRadius: 8,

  },

  viewfinderHintWrap: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,

    marginTop: '52%',

    paddingHorizontal: 12,

    paddingVertical: 8,

    borderRadius: RADIUS.pill,

    backgroundColor: withAlpha('#000000', 0.5),

  },

  viewfinderHint: { color: '#fff', fontSize: 13, fontWeight: '600' },

  previewOverlay: {

    ...StyleSheet.absoluteFillObject,

    backgroundColor: withAlpha('#020617', 0.72),

    alignItems: 'center',

    justifyContent: 'center',

    gap: 8,

    paddingHorizontal: 24,

  },

  pulseRing: {

    position: 'absolute',

    width: 88,

    height: 88,

    borderRadius: 44,

    borderWidth: 3,

  },

  scanLoaderCore: {

    width: 72,

    height: 72,

    borderRadius: 36,

    backgroundColor: withAlpha(COLORS.primary, 0.35),

    alignItems: 'center',

    justifyContent: 'center',

  },

  overlayTitle: { color: '#fff', fontWeight: '700', fontSize: FONT.bodyLg, marginTop: 4 },

  overlayText: { color: withAlpha('#FFFFFF', 0.85), fontSize: FONT.caption },

  captureSection: { alignItems: 'center', gap: 10, marginTop: 4 },

  shutterButton: {

    width: 76,

    height: 76,

    borderRadius: 38,

    borderWidth: 4,

    borderColor: COLORS.primary,

    backgroundColor: COLORS.surface,

    alignItems: 'center',

    justifyContent: 'center',

    ...SHADOW.medium,

  },

  shutterButtonDisabled: { opacity: 0.65 },

  shutterInner: {

    width: 56,

    height: 56,

    borderRadius: 28,

    backgroundColor: COLORS.primary,

  },

  shutterHint: { color: COLORS.textMuted, fontSize: FONT.caption, fontWeight: '500' },

  actionsRow: { flexDirection: 'row', gap: 10 },

  primaryButton: {

    flex: 1,

    height: CONTROL.buttonHeight,

    borderRadius: RADIUS.md,

    backgroundColor: COLORS.primary,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 8,

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

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 6,

  },

  secondaryButtonText: { color: COLORS.textPrimary, fontWeight: '600', fontSize: FONT.body },

  disabledButton: { opacity: 0.65 },

  permissionIconWrap: {

    width: 80,

    height: 80,

    borderRadius: 40,

    backgroundColor: COLORS.primarySoft,

    alignItems: 'center',

    justifyContent: 'center',

  },

  permissionTitle: { fontSize: FONT.title, fontWeight: '700', color: COLORS.textPrimary },

  permissionHint: {

    textAlign: 'center',

    color: COLORS.textSecondary,

    lineHeight: 20,

    marginBottom: 8,

  },

  resultCard: {

    marginTop: 4,

    backgroundColor: COLORS.surface,

    borderRadius: RADIUS.lg,

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

  resultText: { color: COLORS.textPrimary, lineHeight: 20 },

  resultTextMuted: { color: COLORS.textMuted, fontStyle: 'italic' },

  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  allergenText: { color: COLORS.danger, fontWeight: '600', flex: 1 },

  safeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  safeText: { color: COLORS.success, fontWeight: '600' },

});

