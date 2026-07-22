import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Card, Chip } from 'react-native-paper';
import { COLORS } from '../../utils/constants';
import { Video } from '../../types';

export default function VideoPlayerScreen({ route }: any) {
  const { video } = route.params as { video: Video };

  return (
    <View style={styles.container}>
      <View style={styles.playerPlaceholder}>
        {video.isPlaceholder ? (
          <Text style={styles.placeholderText}>영상 준비 중</Text>
        ) : (
          <Text style={styles.placeholderText}>영상 재생 영역</Text>
        )}
      </View>

      <View style={styles.content}>
        <Chip style={styles.categoryChip}>{video.category}</Chip>
        <Title style={styles.title}>{video.title}</Title>
        <Text style={styles.description}>{video.description}</Text>

        {video.isPlaceholder && (
          <Card style={styles.noticeCard}>
            <Card.Content>
              <Text style={styles.noticeText}>
                이 운동의 영상은 아직 등록되지 않았습니다.{'\n'}
                담당 치료사에게 문의해주세요.
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  playerPlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: COLORS.white, fontSize: 16 },
  content: { padding: 20 },
  categoryChip: { alignSelf: 'flex-start', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  noticeCard: { marginTop: 20, backgroundColor: COLORS.tintAmber, borderRadius: 12 },
  noticeText: { color: COLORS.warning, textAlign: 'center', lineHeight: 22 },
});
