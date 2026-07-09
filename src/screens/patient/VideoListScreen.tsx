import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Title, Text, Chip, Searchbar } from 'react-native-paper';
import { COLORS, EXERCISE_CATEGORIES } from '../../utils/constants';
import { getAllVideos, getVideosByCategory } from '../../services/videoService';
import { Video } from '../../types';

export default function VideoListScreen({ navigation }: any) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, [selectedCategory]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = selectedCategory
        ? await getVideosByCategory(selectedCategory)
        : await getAllVideos();
      setVideos(data);
    } catch {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = searchQuery
    ? videos.filter(
        (v) =>
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : videos;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>운동 영상</Title>

        <Searchbar
          placeholder="운동 검색..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <Chip
            selected={!selectedCategory}
            onPress={() => setSelectedCategory('')}
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipSelected]}
            textStyle={{ color: !selectedCategory ? COLORS.white : COLORS.textPrimary }}
          >
            전체
          </Chip>
          {EXERCISE_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipSelected,
              ]}
              textStyle={{
                color: selectedCategory === cat ? COLORS.white : COLORS.textPrimary,
              }}
            >
              {cat}
            </Chip>
          ))}
        </ScrollView>

        {filteredVideos.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                {loading ? '로딩 중...' : '등록된 영상이 없습니다.'}
              </Text>
              {!loading && (
                <Text style={styles.emptySubtext}>
                  치료사가 영상을 등록하면 여기에 표시됩니다.
                </Text>
              )}
            </Card.Content>
          </Card>
        ) : (
          filteredVideos.map((video) => (
            <Card
              key={video.id}
              style={styles.videoCard}
              onPress={() =>
                !video.isPlaceholder &&
                navigation.navigate('VideoPlayer', { video })
              }
            >
              <Card.Content>
                <View style={styles.videoHeader}>
                  <View style={styles.thumbnail}>
                    <Text style={styles.thumbnailText}>
                      {video.isPlaceholder ? '준비중' : '▶'}
                    </Text>
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle}>{video.title}</Text>
                    <Text style={styles.videoDesc} numberOfLines={2}>
                      {video.description}
                    </Text>
                    <Chip
                      style={styles.videoCategory}
                      textStyle={{ fontSize: 11 }}
                    >
                      {video.category}
                    </Chip>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  searchbar: { marginBottom: 12, borderRadius: 12, elevation: 1 },
  categoryScroll: { marginBottom: 16 },
  categoryChip: {
    marginRight: 8,
    backgroundColor: COLORS.light,
  },
  categoryChipSelected: { backgroundColor: COLORS.primary },
  emptyCard: { borderRadius: 12, marginTop: 20 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 15, paddingTop: 20 },
  emptySubtext: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 13,
    paddingBottom: 20,
    paddingTop: 4,
  },
  videoCard: { marginBottom: 12, borderRadius: 12 },
  videoHeader: { flexDirection: 'row' },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  thumbnailText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  videoInfo: { flex: 1 },
  videoTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  videoDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  videoCategory: { alignSelf: 'flex-start' },
});
