import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { createNoteApi, updateNoteApi } from '../src/api/diaryApi';

export default function AddNoteScreen() {
  const params = useLocalSearchParams<{
    noteId?: string;
    content?: string;
    date?: string;
  }>();

  const isEdit = useMemo(() => !!params.noteId, [params.noteId]);

  const [content, setContent] = useState(params.content ?? '');
  const [date, setDate] = useState(params.date ?? '');

  const handleSave = async () => {
    if (!content.trim() || !date.trim()) {
      Alert.alert('Ошибка', 'Заполните текст заметки и дату');
      return;
    }

    const payload = {
      content: content.trim(),
      date: date.trim(),
    };

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
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEdit ? 'Редактировать заметку' : 'Добавить заметку'}
        </Text>

        <Text style={styles.label}>Дата</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-03-29T10:10:00"
          value={date}
          onChangeText={setDate}
        />

        <Text style={styles.label}>Текст заметки</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="После молочных продуктов симптомы усиливаются"
          multiline
          value={content}
          onChangeText={setContent}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>
            {isEdit ? 'Обновить' : 'Сохранить'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FB' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#233142', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#344054', marginBottom: 8, marginTop: 12 },
  input: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  button: {
    marginTop: 24,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});