import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  deleteNoteApi,
  getNotesByDateApi,
} from '../src/api/diaryApi';

const formatDate = (date: Date) =>
  date.toISOString().split('T')[0];

export default function NotesScreen() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    formatDate(new Date())
  );

  // ===== LOAD =====
  const load = async () => {
    try {
      console.log('LOAD NOTES FOR DATE:', selectedDate);

      setLoading(true);

      const data = await getNotesByDateApi(selectedDate);

      console.log('NOTES RESULT:', data);

      setNotes(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.log('NOTES ERROR FULL:', e);

      if (e.message?.includes('401')) {
        Alert.alert(
          'Авторизация',
          'Ты не авторизован. Перезайди в приложение'
        );
      } else {
        Alert.alert('Ошибка загрузки заметок');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedDate]);

  // ===== REFRESH =====
  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // ===== DELETE =====
  const handleDelete = (id: string) => {
    Alert.alert('Удаление', 'Удалить заметку?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNoteApi(id);
            load();
          } catch (e) {
            console.log('DELETE ERROR:', e);
            Alert.alert('Ошибка удаления');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FB' }}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* ===== TITLE ===== */}
        <Text style={{ fontSize: 26, fontWeight: '700' }}>
          Заметки
        </Text>

        {/* ===== DATE ===== */}
        <View
          style={{
            marginTop: 12,
            backgroundColor: '#fff',
            padding: 14,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: '#667085' }}>Дата</Text>

          <Text style={{ fontWeight: '600', marginTop: 6 }}>
            {selectedDate}
          </Text>
        </View>

        {/* ===== ADD ===== */}
        <TouchableOpacity
          onPress={() => router.push('/add-note')}
          style={{
            marginTop: 12,
            backgroundColor: '#2F6690',
            padding: 14,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>
            + Добавить заметку
          </Text>
        </TouchableOpacity>

        {/* ===== CONTENT ===== */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} />
        ) : notes.length === 0 ? (
          <Text style={{ marginTop: 20 }}>
            Нет заметок за этот день
          </Text>
        ) : (
          notes.map((item) => (
            <View
              key={item.noteId}
              style={{
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 18,
                marginTop: 12,
              }}
            >
              <Text style={{ marginBottom: 8 }}>
                {item.content}
              </Text>

              <Text style={{ fontSize: 12, color: '#98A2B3' }}>
                {new Date(item.date).toLocaleString('ru-RU')}
              </Text>

              {/* ACTIONS */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/add-note',
                      params: {
                        noteId: item.noteId,
                        content: item.content,
                        date: item.date,
                      },
                    })
                  }
                  style={{ marginRight: 16 }}
                >
                  <Text style={{ color: '#2F6690' }}>
                    Редактировать
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(item.noteId)}
                >
                  <Text style={{ color: '#E63946' }}>
                    Удалить
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}