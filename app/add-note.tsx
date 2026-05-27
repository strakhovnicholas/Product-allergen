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
import { Ionicons } from '@expo/vector-icons';

import {
  createNoteApi,
  updateNoteApi,
} from '../src/api/diaryApi';
import { formStyles as styles } from '../src/styles/formStyles';

export default function NotesScreen() {
  const params = useLocalSearchParams<{
    noteId?: string;
    content?: string;
    date?: string;
  }>();
  const isEdit = useMemo(() => Boolean(params.noteId), [params.noteId]);

  const [content, setContent] = useState(params.content ?? '');
  const [saving, setSaving] = useState(false);
  const templates = [
    'После обеда появилась реакция',
    'Симптомы усилились к вечеру',
    'После лекарства стало лучше',
    'Подозрение на продукт-триггер',
  ];
  const tags = ['Триггер', 'Лекарство', 'Симптом', 'Питание'];

  const handleSave = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      Alert.alert('Ошибка', 'Введите текст заметки');
      return;
    }

    setSaving(true);
    try {
      const baseDate = params.date ? new Date(params.date) : new Date();
      const payload = {
        content: trimmed,
        date: Number.isNaN(baseDate.getTime())
          ? new Date().toISOString()
          : baseDate.toISOString(),
      };

      if (isEdit && params.noteId) {
        await updateNoteApi(params.noteId, payload);
      } else {
        await createNoteApi(payload);
      }

      router.back();
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось сохранить заметку'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEdit ? 'Редактировать заметку' : 'Заметка'}
        </Text>

        <View style={styles.card}>
          <View style={localStyles.heroNote}>
            <Ionicons name="sparkles-outline" size={18} color="#1D4ED8" />
            <Text style={localStyles.heroNoteText}>
              Добавьте краткую заметку, чтобы лучше видеть связи между едой, симптомами и лечением.
            </Text>
          </View>

          <View style={localStyles.topRow}>
            <Ionicons name="document-text-outline" size={18} color="#1D4ED8" />
            <Text style={localStyles.topRowText}>Быстрые шаблоны</Text>
          </View>
          <View style={localStyles.templatesWrap}>
            {templates.map((item) => (
              <TouchableOpacity
                key={item}
                style={localStyles.templateChip}
                onPress={() => setContent(item)}
                activeOpacity={0.85}
              >
                <Text style={localStyles.templateChipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={localStyles.tagsWrap}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={localStyles.tagChip}
                onPress={() => setContent((prev) => (prev ? `${prev}\n#${tag}` : `#${tag}`))}
                activeOpacity={0.85}
              >
                <Text style={localStyles.tagChipText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Текст заметки</Text>
          <TextInput
            style={[styles.input, styles.multiline, localStyles.noteInput]}
            value={content}
            onChangeText={setContent}
            placeholder="Запишите наблюдение, симптом или важную деталь..."
            multiline
          />
          <Text style={localStyles.counter}>{content.trim().length} символов</Text>

          <TouchableOpacity
            style={[styles.button, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
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

const localStyles = StyleSheet.create({
  heroNote: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#D6E4FF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  heroNoteText: {
    flex: 1,
    color: '#1E3A8A',
    fontSize: 13,
    lineHeight: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  topRowText: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  templatesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagChipText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
  },
  templateChip: {
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#D6E4FF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  templateChipText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '600',
  },
  noteInput: {
    minHeight: 160,
    textAlignVertical: 'top',
  },
  counter: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 12,
    textAlign: 'right',
  },
});