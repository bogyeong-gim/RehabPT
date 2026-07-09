import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card, Title, Text, TextInput, Button, FAB, Portal, Modal, Chip, IconButton,
} from 'react-native-paper';
import { COLORS, EXERCISE_CATEGORIES } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { createVideo, deleteVideo, getAllVideos } from '../../services/videoService';
import { Video } from '../../types';

export default function VideoManageScreen() {
  const user = useAuthStore((s) => s.user);
  const [videos, setVideos] = useState<Video[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    const data = await getAllVideos();
    setVideos(data);
  };

  const handleCreate = async () => {
    if (!user || !title || !category) {
      Alert.alert('알림', '제목과 카테고리를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await createVideo(title, description, category, user.id);
      setModalVisible(false);
      setTitle('');
      setDescription('');
      setCategory('');
      loadVideos();
      Alert.alert('완료', '영상 정보가 등록되었습니다. 영상 파일은 추후 업로드할 수 있습니다.');
    } catch {
      Alert.alert('오류', '등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (videoId: string) => {
    Alert.alert('삭제 확인', '이 영상을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteVideo(videoId);
          loadVideos();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Title style={styles.title}>운동 영상 관리</Title>
        <Text style={styles.subtitle}>
          영상 정보를 먼저 등록하고, 실제 영상은 나중에 업로드할 수 있습니다.
        </Text>

        {videos.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>등록된 영상이 없습니다.</Text>
            </Card.Content>
          </Card>
        ) : (
          videos.map((video) => (
            <Card key={video.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{video.title}</Text>
                    <Text style={styles.cardDesc}>{video.description}</Text>
                  </View>
                  <IconButton icon="delete" size={18} onPress={() => handleDelete(video.id)} />
                </View>
                <View style={styles.cardFooter}>
                  <Chip style={styles.categoryChip}>{video.category}</Chip>
                  {video.isPlaceholder && (
                    <Text style={styles.placeholderText}>영상 미등록</Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color={COLORS.white}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>운동 영상 등록</Title>

          <TextInput
            label="영상 제목"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="설명"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Text style={styles.label}>카테고리</Text>
          <View style={styles.chipRow}>
            {EXERCISE_CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
                style={[styles.catChip, category === cat && styles.catChipSelected]}
                textStyle={{ color: category === cat ? COLORS.white : COLORS.textPrimary }}
              >
                {cat}
              </Chip>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleCreate}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
            buttonColor={COLORS.primary}
          >
            등록하기
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 16 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, paddingHorizontal: 20, marginBottom: 16 },
  emptyCard: { margin: 20, borderRadius: 12 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, paddingVertical: 16 },
  card: { marginHorizontal: 20, marginBottom: 10, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  categoryChip: { height: 26 },
  placeholderText: { fontSize: 12, color: COLORS.warning },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: COLORS.primary },
  modal: {
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { marginBottom: 12, backgroundColor: COLORS.white },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  catChip: { backgroundColor: COLORS.light },
  catChipSelected: { backgroundColor: COLORS.primary },
  submitBtn: { marginTop: 8, paddingVertical: 4, borderRadius: 8 },
});
