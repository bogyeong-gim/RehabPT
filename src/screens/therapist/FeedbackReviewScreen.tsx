import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Text, TextInput, Button, Chip, Divider } from 'react-native-paper';
import { COLORS, PAIN_LEVELS, DIFFICULTY_LEVELS } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { getTherapistFeedbacks, addTherapistComment } from '../../services/feedbackService';
import { Feedback } from '../../types';
import { formatDateTime } from '../../utils/helpers';

export default function FeedbackReviewScreen() {
  const user = useAuthStore((s) => s.user);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    if (!user) return;
    const data = await getTherapistFeedbacks(user.id);
    setFeedbacks(data);
    setLoading(false);
  };

  const handleComment = async (feedbackId: string) => {
    const text = commentText[feedbackId];
    if (!text?.trim()) {
      Alert.alert('알림', '코멘트를 입력해주세요.');
      return;
    }
    setSubmitting(feedbackId);
    try {
      await addTherapistComment(feedbackId, text.trim());
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === feedbackId ? { ...f, therapistComment: text.trim() } : f,
        ),
      );
      setCommentText((prev) => ({ ...prev, [feedbackId]: '' }));
      Alert.alert('완료', '코멘트가 전송되었습니다.');
    } catch {
      Alert.alert('오류', '전송에 실패했습니다.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>피드백 확인</Title>

      {loading ? (
        <Text style={styles.emptyText}>로딩 중...</Text>
      ) : feedbacks.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>받은 피드백이 없습니다.</Text>
          </Card.Content>
        </Card>
      ) : (
        feedbacks.map((fb) => {
          const painInfo = PAIN_LEVELS.find((p) => p.value === fb.painLevel);
          const diffInfo = DIFFICULTY_LEVELS.find((d) => d.value === fb.difficulty);
          return (
            <Card key={fb.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text style={styles.dateText}>{formatDateTime(fb.createdAt)}</Text>
                  {!fb.therapistComment && (
                    <Chip style={styles.unreadChip} textStyle={{ color: COLORS.white, fontSize: 11 }}>
                      미확인
                    </Chip>
                  )}
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>통증</Text>
                    <Text style={[styles.metricValue, { color: painInfo?.color || COLORS.textPrimary }]}>
                      {fb.painLevel}/10
                    </Text>
                    <Text style={styles.metricDesc}>{painInfo?.label}</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>난이도</Text>
                    <Text style={[styles.metricValue, { color: COLORS.primary }]}>
                      {fb.difficulty}/5
                    </Text>
                    <Text style={styles.metricDesc}>{diffInfo?.label}</Text>
                  </View>
                </View>

                {fb.completedExercises.length > 0 && (
                  <View style={styles.exercisesRow}>
                    <Text style={styles.exercisesLabel}>완료한 운동: </Text>
                    {fb.completedExercises.map((ex, i) => (
                      <Chip key={i} style={styles.exerciseChip} textStyle={{ fontSize: 11 }}>
                        {ex}
                      </Chip>
                    ))}
                  </View>
                )}

                {fb.memo ? (
                  <>
                    <Divider style={styles.divider} />
                    <Text style={styles.memoLabel}>환자 메모</Text>
                    <Text style={styles.memoText}>{fb.memo}</Text>
                  </>
                ) : null}

                <Divider style={styles.divider} />

                {fb.therapistComment ? (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentLabel}>내 코멘트</Text>
                    <Text style={styles.commentText}>{fb.therapistComment}</Text>
                  </View>
                ) : (
                  <View>
                    <TextInput
                      label="코멘트 작성"
                      value={commentText[fb.id] || ''}
                      onChangeText={(text) =>
                        setCommentText((prev) => ({ ...prev, [fb.id]: text }))
                      }
                      mode="outlined"
                      multiline
                      numberOfLines={2}
                      style={styles.commentInput}
                    />
                    <Button
                      mode="contained"
                      onPress={() => handleComment(fb.id)}
                      loading={submitting === fb.id}
                      disabled={submitting === fb.id}
                      buttonColor={COLORS.primary}
                      style={styles.commentBtn}
                    >
                      코멘트 전송
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  emptyCard: { borderRadius: 12 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, paddingVertical: 16 },
  card: { marginBottom: 14, borderRadius: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: { fontSize: 13, color: COLORS.textSecondary },
  unreadChip: { backgroundColor: COLORS.danger },
  metricsRow: { flexDirection: 'row', gap: 20, marginBottom: 12 },
  metric: { alignItems: 'center' },
  metricLabel: { fontSize: 12, color: COLORS.textSecondary },
  metricValue: { fontSize: 20, fontWeight: 'bold' },
  metricDesc: { fontSize: 11, color: COLORS.textSecondary },
  exercisesRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  exercisesLabel: { fontSize: 13, color: COLORS.textSecondary },
  exerciseChip: { height: 26 },
  divider: { marginVertical: 10 },
  memoLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  memoText: { fontSize: 14, color: COLORS.textPrimary },
  commentBox: { backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8 },
  commentLabel: { fontSize: 12, fontWeight: '600', color: COLORS.success, marginBottom: 2 },
  commentText: { fontSize: 14, color: COLORS.textPrimary },
  commentInput: { backgroundColor: COLORS.white, marginBottom: 8 },
  commentBtn: { borderRadius: 8 },
});
