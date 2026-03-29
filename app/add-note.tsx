import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { createNoteApi, updateNoteApi } from '../src/api/diaryApi';
import { formStyles as styles } from '../src/styles/formStyles';

function isValidDateString(value: string) {
  if (!value.trim()) return false;
  const parsedDate = new Date(value);
  return !Number.isNaN(parsedDate.getTime());
}

export default function AddNoteScreen() {
  const params = useLocalSearchParams<{
    noteId?: string;
    content?: string;
    date?: string;
  }>();

  const isEdit = useMemo(() => Boolean(params.noteId), [params.noteId]);

  const [content, setContent] = useState(params.content ?? '');
  const [date, setDate] = useState(params.date ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const normalizedContent = content.trim();
    const normalizedDate = date.trim();

    if (!normalizedContent || !normalizedDate) {
      Alert.alert('Ошибка', 'Заполните текст заметки и дату');
      return;
    }

    if (!isValidDateString(normalizedDate)) {
      Alert.alert('Ошибка', 'Введите корректную дату');
      return;
    }

    const payload = {
      content: normalizedContent,
      date: normalizedDate,
    };

    setIsSubmitting(true);

    try {
      if (isEdit && params.noteId) {
        await updateNoteApi(params.noteId, payload);
        Alert.alert('Успешно', 'Заметка обновлена');
      } else {
        await createNoteApi(payload);
        Alert.alert('Успешно', 'Заметка сохранена');
      }

      router.back();
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось сохранить заметку'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {isEdit ? 'Редактировать заметку' : 'Заметка'}
        </Text>
        <Text style={styles.subtitle}>Добавьте наблюдение или важный комментарий</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Дата</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Текст заметки</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            multiline
            value={content}
            onChangeText={setContent}
            editable={!isSubmitting}
          />

          <TouchableOpacity
            style={[styles.button, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
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