import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createCommonFeelingApi,
  updateCommonFeelingApi,
} from '../src/api/diaryApi';

import { formStyles as styles } from '../src/styles/formStyles';

export default function AddCommonFeelingScreen() {
  const params = useLocalSearchParams<{
    feelingId?: string;
    wellbeingScore?: string;
    comment?: string;
  }>();

  const isEdit = useMemo(() => Boolean(params.feelingId), [params.feelingId]);

  const [score, setScore] = useState(
    params.wellbeingScore ? Number(params.wellbeingScore) : 3
  );

  const [comment, setComment] = useState(params.comment ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!score) {
      Alert.alert('Ошибка', 'Выберите самочувствие');
      return;
    }

    const payload = {
      dateTime: new Date().toISOString(),
      wellbeingScore: score,
      comment: comment.trim() || undefined,
    };

    setIsSubmitting(true);

    try {
      if (isEdit && params.feelingId) {
        await updateCommonFeelingApi(params.feelingId, payload);
      } else {
        await createCommonFeelingApi(payload);
      }

      router.back();
    } catch (e) {
      console.log('FEELING ERROR:', e);
      Alert.alert('Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEdit ? 'Редактировать самочувствие' : 'Самочувствие'}
        </Text>

        <View style={styles.card}>
          {/* ===== SCORE ===== */}
          <Text style={styles.label}>Самочувствие</Text>

          <View style={ui.row}>
            {[1, 2, 3, 4, 5].map((s) => {
              const active = s <= score;

              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => setScore(s)}
                >
                  <View
                    style={[
                      ui.circle,
                      active && ui.circleActive,
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ===== COMMENT ===== */}
          <Text style={styles.label}>Комментарий</Text>

          <TextInput
            style={[styles.input, styles.multiline]}
            value={comment}
            onChangeText={setComment}
            placeholder="Опишите состояние..."
            multiline
          />

          {/* ===== BUTTON ===== */}
          <TouchableOpacity
            style={[styles.button, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isEdit ? 'Обновить' : 'Сохранить'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== UI =====
const ui = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D0D5DD',
    marginRight: 12,
  },
  circleActive: {
    backgroundColor: '#2F6690',
  },
});