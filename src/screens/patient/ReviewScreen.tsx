import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, IconButton, Button } from 'react-native-paper';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPO, REVIEW_QUESTIONS, RATING_LABELS } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { createReview } from '../../services/reviewService';
import { notifyDialog } from '../../utils/helpers';
import { ReviewAnswer } from '../../types';

export default function ReviewScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [ratings, setRatings] = useState<number[]>(REVIEW_QUESTIONS.map(() => 0));
  const [tags, setTags] = useState<string[][]>(REVIEW_QUESTIONS.map(() => []));
  const [saving, setSaving] = useState(false);

  const total = REVIEW_QUESTIONS.length;
  const current = REVIEW_QUESTIONS[step];
  const rating = ratings[step];
  const selectedTags = tags[step];
  const isLast = step === total - 1;

  const setRating = (value: number) => {
    setRatings((prev) => prev.map((r, i) => (i === step ? value : r)));
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.map((list, i) => {
        if (i !== step) return list;
        return list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag];
      }),
    );
  };

  const handleNext = () => {
    if (rating === 0) return;
    if (isLast) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const answers: ReviewAnswer[] = REVIEW_QUESTIONS.map((q, i) => ({
        question: q.question,
        rating: ratings[i],
        tags: tags[i],
      }));
      const overall = Math.round((ratings.reduce((a, b) => a + b, 0) / total) * 10) / 10;
      await createReview(user.id, user.therapistId || '', answers, overall);
      notifyDialog('리뷰 완료', '소중한 리뷰가 등록되었습니다. 감사합니다!', () => navigation.goBack());
    } catch {
      notifyDialog('오류', '리뷰 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.eyebrow}>치료 리뷰</Text>
          <IconButton icon="close" size={22} iconColor={COLORS.textSecondary} onPress={() => navigation.goBack()} style={{ margin: 0 }} />
        </View>
        <Text style={styles.title}>치료 경험을 남겨주세요</Text>
        <Text style={styles.subtitle}>설문이 아닌 짧은 순간의 느낌으로, 별점과 태그로 가볍게 남겨요.</Text>

        {/* 진행 표시 */}
        <View style={styles.progressRow}>
          {REVIEW_QUESTIONS.map((_, i) => (
            <View key={i} style={[styles.progressSeg, i <= step && styles.progressSegActive]} />
          ))}
        </View>
        <Text style={styles.stepText}>{step + 1} / {total}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* 질문 카드 */}
        <View style={styles.card}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{step + 1}</Text>
          </View>
          <Text style={styles.question}>{current.question}</Text>

          {/* 별점 */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <IconButton
                key={n}
                icon={n <= rating ? 'star' : 'star-outline'}
                size={40}
                iconColor={n <= rating ? COLORS.warning : COLORS.border}
                onPress={() => setRating(n)}
                style={styles.star}
              />
            ))}
          </View>
          <Text style={[styles.ratingLabel, rating === 0 && styles.ratingLabelMuted]}>
            {rating === 0 ? '별점을 선택해주세요' : RATING_LABELS[rating - 1]}
          </Text>

          {/* 빠른 선택 태그 */}
          <Text style={styles.tagHeading}>기억에 남는 점이 있나요? (선택)</Text>
          <View style={styles.tagWrap}>
            {current.tags.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tag, selected && styles.tagSelected]}
                >
                  <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{tag}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        {step > 0 && (
          <Button
            mode="outlined"
            onPress={() => setStep(step - 1)}
            style={styles.prevBtn}
            textColor={COLORS.textSecondary}
            theme={{ colors: { outline: COLORS.border } }}
          >
            이전
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={rating === 0 || saving}
          loading={saving}
          style={styles.nextBtn}
          contentStyle={{ paddingVertical: SPACING.xs + 2 }}
          buttonColor={COLORS.primary}
        >
          {isLast ? '리뷰 제출하기' : '다음'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 52,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { ...TYPO.caption, color: COLORS.primary, fontWeight: '700' },
  title: { ...TYPO.h1, color: COLORS.textPrimary, marginTop: SPACING.xs },
  subtitle: { ...TYPO.bodySm, color: COLORS.textSecondary, marginTop: SPACING.xs, lineHeight: 20 },
  progressRow: { flexDirection: 'row', gap: 6, marginTop: SPACING.lg },
  progressSeg: { flex: 1, height: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.border },
  progressSegActive: { backgroundColor: COLORS.primary },
  stepText: { ...TYPO.caption, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'right' },

  body: { padding: SPACING.lg },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.ink,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  stepBadgeText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  question: { ...TYPO.h2, color: COLORS.textPrimary, textAlign: 'center', marginBottom: SPACING.lg },
  starsRow: { flexDirection: 'row', justifyContent: 'center' },
  star: { margin: 0 },
  ratingLabel: { ...TYPO.h3, color: COLORS.warning, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  ratingLabelMuted: { color: COLORS.textLight, fontWeight: '400', fontSize: 14 },
  tagHeading: { ...TYPO.bodySm, color: COLORS.textSecondary, alignSelf: 'flex-start', marginBottom: SPACING.sm },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, alignSelf: 'stretch' },
  tag: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  tagSelected: { backgroundColor: COLORS.mint, borderColor: COLORS.primary },
  tagText: { ...TYPO.bodySm, color: COLORS.textSecondary },
  tagTextSelected: { color: COLORS.primaryDark, fontWeight: '600' },

  footer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  prevBtn: { flex: 1, borderRadius: RADIUS.md, justifyContent: 'center' },
  nextBtn: { flex: 2, borderRadius: RADIUS.md },
});
