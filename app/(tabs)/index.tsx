import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

type NotesState = {
  notes: Note[];
  addNote: (title: string, content: string) => void;
  deleteNote: (id: string) => void;
};

const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (title, content) =>
        set((state) => ({
          notes: [
            {
              id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              title: title.trim() || 'Untitled',
              content: content.trim(),
              createdAt: Date.now(),
            },
            ...state.notes,
          ],
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),
    }),
    {
      name: 'notes-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default function HomeScreen() {
  const listRef = useRef<FlatList<Note>>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const notes = useNotesStore((state) => state.notes);
  const addNote = useNotesStore((state) => state.addNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);

  const handleAddNote = () => {
    if (!title.trim() && !content.trim()) {
      return;
    }

    addNote(title, content);
    setTitle('');
    setContent('');
    Keyboard.dismiss();

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Personal Notes</ThemedText>
        <ThemedText type="default">
          Capture quick thoughts, reminders and ideas, stored on this device.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.inputCard}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.contentInput}
          placeholder="Write your note..."
          value={content}
          onChangeText={setContent}
          placeholderTextColor="#999"
          multiline
        />
        <Pressable style={styles.addButton} onPress={handleAddNote}>
          <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
            Save note
          </ThemedText>
        </Pressable>
      </ThemedView>
      <ThemedView style={styles.listContainer}>
        <ThemedText type="subtitle">Your notes</ThemedText>
        <FlatList
          ref={listRef}
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedText type="default" style={styles.emptyText}>
              No notes yet. Add your first note above.
            </ThemedText>
          }
          renderItem={({ item }) => (
            <View style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <ThemedText type="defaultSemiBold" style={styles.noteTitle}>
                  {item.title}
                </ThemedText>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => {
                    deleteNote(item.id);
                  }}>
                  <ThemedText type="defaultSemiBold" style={styles.deleteButtonText}>
                    Delete
                  </ThemedText>
                </Pressable>
              </View>
              {item.content ? (
                <ThemedText type="default" style={styles.noteContent}>
                  {item.content}
                </ThemedText>
              ) : null}
            </View>
          )}
        />
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 4,
  },
  inputCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  contentInput: {
    minHeight: 80,
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  addButton: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  addButtonText: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 24,
    gap: 8,
  },
  emptyText: {
    marginTop: 8,
  },
  noteCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteTitle: {
    flex: 1,
    marginRight: 8,
  },
  noteContent: {
    marginTop: 2,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});
