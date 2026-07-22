import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Title, Card, Chip } from 'react-native-paper';
import { COLORS, PAIN_LEVELS, DIFFICULTY_LEVELS } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { createFeedback, getFeedbackBySchedule } from '../../services/feedbackService';
import { updateScheduleStatus } from '../../services/scheduleService';
import { notifyDialog } from '../../utils/helpers';
import { Feedback, Schedule } from '../../types';

function LevelSelector({
  value,
  onChange,
  min,
  max,
  disabled,
  getColor,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  disabled: boolean;
  getColor: (v: number) => string;
}) {
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <View style={selectorStyles.row}>
      {items.map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => !disabled && onChange(n)}
          style={[
            selectorStyles.item,
            {
              backgroundColor: n <= value ? getColor(n) : COLORS.light,
              opacity: disabled ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={[
              selectorStyles.itemText,
              { color: n <= value ? COLORS.white : COLORS.textSecondary },
            ]}
          >
            {n}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const selectorStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  item: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: { fontSize: 13, fontWeight: '600' },
});

export default function ExerciseFeedbackScreen({ route, navigation }: any) {
  const { schedule } = route.params as { schedule: Schedule };
  const user = useAuthStore((s) => s.user);
  const [painLevel, setPainLevel] = useState(5);
  const [difficulty, setDifficulty] = useState(3);
  const [memo, setMemo] = useState('');
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  useEffect(() => {
    loadExistingFeedback();
  }, []);

  const loadExistingFeedback = async () => {
    try {
      const feedback = await getFeedbackBySchedule(schedule.id);
      if (feedback) {
        setExistingFeedback(feedback);
        setPainLevel(feedback.painLevel);
        setDifficulty(feedback.difficulty);
        setMemo(feedback.memo);
        setCompletedExercises(feedback.completedExercises);
      }
    } catch (e) {
      console.log('피드백 로드 실패:', e);
    } finally {
      setLoadingExisting(false);
    }
  };

  const toggleExercise = (name: string) => {
    setCompletedExercises((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const painInfo = PAIN_LEVELS.find((p) => p.value === painLevel) || PAIN_LEVELS[4];
  const diffInfo = DIFFICULTY_LEVELS.find((d) => d.value === difficulty) || DIFFICULTY_LEVELS[2];

  const getPainColor = (v: number) => {
    const info = PAIN_LEVELS.find((p) => p.value === v);
    return info?.color || COLORS.primary;
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (completedExercises.length === 0) {
      Alert.alert('알림', '완료한 운동을 최소 1개 선택해주세요.');
      return;
    }
    setLoading(true);
    try {
      await createFeedback(
        schedule.id,
        user.id,
        schedule.therapistId,
        painLevel,
        difficulty,
        memo,
        completedExercises,
      );
      // 스케줄 상태를 완료로 변경
      await updateScheduleStatus(schedule.id, 'completed');
      notifyDialog('완료', '피드백이 전송되었습니다.', () => navigation.goBack());
    } catch (e) {
      console.log('피드백 전송 에러:', e);
      Alert.alert('오류', '피드백 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingExisting) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>{schedule.title}</Title>
        <Text style={styles.subtitle}>운동 피드백</Text>

        {existingFeedback?.therapistComment && (
          <Card style={styles.commentCard}>
            <Card.Content>
              <Text style={styles.commentLabel}>치료사 코멘트</Text>
              <Text style={styles.commentText}>{existingFeedback.therapistComment}</Text>
            </Card.Content>
          </Card>
        )}

        <Text style={styles.sectionLabel}>완료한 운동을 선택해주세요</Text>
        <View style={styles.chipRow}>
          {schedule.exercises.map((ex, idx) => (
            <Chip
              key={idx}
              selected={completedExercises.includes(ex.name)}
              onPress={() => !existingFeedback && toggleExercise(ex.name)}
              style={[
                styles.chip,
                completedExercises.includes(ex.name) && styles.chipSelected,
              ]}
              textStyle={{
                color: completedExercises.includes(ex.name)
                  ? COLORS.white
                  : COLORS.textPrimary,
              }}
            >
              {ex.name}
            </Chip>
          ))}
        </View>

        <Text style={styles.sectionLabel}>
          통증 정도: {painInfo.label} ({painLevel}/10)
        </Text>
        <LevelSelector
          value={painLevel}
          onChange={setPainLevel}
          min={1}
          max={10}
          disabled={!!existingFeedback}
          getColor={getPainColor}
        />

        <Text style={styles.sectionLabel}>
          운동 난이도: {diffInfo.label} ({difficulty}/5)
        </Text>
        <LevelSelector
          value={difficulty}
          onChange={setDifficulty}
          min={1}
          max={5}
          disabled={!!existingFeedback}
          getColor={() => COLORS.primary}
        />

        <Text style={styles.sectionLabel}>메모</Text>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          mode="outlined"
          multiline
          numberOfLines={4}
          placeholder="운동 중 느낀 점이나 특이사항을 적어주세요"
          style={styles.memoInput}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
          disabled={!!existingFeedback}
        />

        {!existingFeedback && (
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            buttonColor={COLORS.primary}
          >
            피드백 전송
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  commentCard: {
    backgroundColor: COLORS.tintGreen,
    marginBottom: 20,
    borderRadius: 12,
  },
  commentLabel: { fontSize: 13, fontWeight: '600', color: COLORS.success, marginBottom: 4 },
  commentText: { fontSize: 14, color: COLORS.textPrimary },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 16,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginBottom: 4, backgroundColor: COLORS.light },
  chipSelected: { backgroundColor: COLORS.primary },
  memoInput: { backgroundColor: COLORS.white, marginBottom: 12 },
  submitButton: { marginTop: 16, paddingVertical: 4, borderRadius: 8 },
});
