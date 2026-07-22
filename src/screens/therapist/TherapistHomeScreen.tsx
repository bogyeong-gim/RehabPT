import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Button, Avatar, Badge } from 'react-native-paper';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPO } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { subscribeToSchedules } from '../../services/scheduleService';
import { logoutUser } from '../../services/authService';
import { getTherapistFeedbacks } from '../../services/feedbackService';
import { Feedback } from '../../types';

export default function TherapistHomeScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const { schedules, setSchedules } = useScheduleStore();
  const logout = useAuthStore((s) => s.logout);
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSchedules(user.id, 'therapist', setSchedules);
    loadFeedbacks();
    return unsubscribe;
  }, [user]);

  const loadFeedbacks = async () => {
    if (!user) return;
    const feedbacks = await getTherapistFeedbacks(user.id);
    setRecentFeedbacks(feedbacks.slice(0, 5));
  };

  const todaySchedules = schedules.filter((s) => {
    const d = s.date.toDate();
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  });

  const totalPatients = new Set(schedules.map((s) => s.patientId)).size;
  const pendingFeedbacks = recentFeedbacks.filter((f) => !f.therapistComment).length;

  const handleLogout = async () => {
    await logoutUser();
    logout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: SPACING.xxl }}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.greeting}>안녕하세요</Text>
            <Title style={styles.userName}>{user?.name} 치료사님</Title>
          </View>
          <Button mode="text" onPress={handleLogout} textColor="rgba(255,255,255,0.85)" compact>
            로그아웃
          </Button>
        </View>

        <View style={styles.statsRow}>
          <Stat number={totalPatients} label="담당 환자" color={COLORS.white} />
          <Stat number={todaySchedules.length} label="오늘 스케줄" color="#F2C879" />
          <Stat number={pendingFeedbacks} label="미확인 피드백" color="#F0A28E" />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>빠른 메뉴</Text>
        <View style={styles.menuGrid}>
          <MenuItem icon="account-group-outline" tint={COLORS.tintTeal} color={COLORS.primary} label="환자 목록" onPress={() => navigation.navigate('PatientListTab')} />
          <MenuItem icon="calendar-plus" tint={COLORS.tintGreen} color={COLORS.success} label="스케줄 관리" onPress={() => navigation.navigate('ScheduleManageTab')} />
          <MenuItem icon="clipboard-text-outline" tint={COLORS.tintAmber} color={COLORS.warning} label="피드백 확인" onPress={() => navigation.navigate('FeedbackReviewTab')} />
          <MenuItem icon="chat-outline" tint={COLORS.tintBlue} color={COLORS.info} label="메시지" onPress={() => navigation.navigate('ChatTab')} />
          <MenuItem icon="video-outline" tint={COLORS.tintRose} color={COLORS.danger} label="영상 관리" onPress={() => navigation.navigate('VideoManageTab')} />
        </View>

        {recentFeedbacks.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>최근 피드백</Text>
            {recentFeedbacks.slice(0, 3).map((fb) => (
              <Card key={fb.id} style={styles.feedbackCard} mode="contained">
                <Card.Content>
                  <View style={styles.feedbackRow}>
                    <Text style={styles.feedbackLabel}>통증 {fb.painLevel}/10</Text>
                    <Text style={styles.feedbackLabel}>난이도 {fb.difficulty}/5</Text>
                    {!fb.therapistComment && <Badge style={styles.badge}>미확인</Badge>}
                  </View>
                  {fb.memo ? (
                    <Text style={styles.feedbackMemo} numberOfLines={2}>{fb.memo}</Text>
                  ) : null}
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ number, label, color }: any) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statNumber, { color }]}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, tint, color, label, onPress }: any) {
  return (
    <Card style={styles.menuCard} mode="contained" onPress={onPress}>
      <Card.Content style={styles.menuContent}>
        <Avatar.Icon size={44} icon={icon} color={color} style={{ backgroundColor: tint }} />
        <Text style={styles.menuLabel}>{label}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: {
    backgroundColor: COLORS.ink,
    paddingTop: 64,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { ...TYPO.bodySm, color: 'rgba(255,255,255,0.7)' },
  userName: { ...TYPO.h1, color: COLORS.white, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: SPACING.sm + 2, marginTop: SPACING.lg },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  statNumber: { fontSize: 26, fontWeight: '700', color: COLORS.white },
  statLabel: { ...TYPO.caption, color: 'rgba(255,255,255,0.75)', marginTop: 2, textAlign: 'center' },
  body: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  sectionTitle: { ...TYPO.h2, color: COLORS.textPrimary, marginBottom: SPACING.md },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm + 2 },
  menuCard: {
    width: '47.5%',
    flexGrow: 1,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  menuContent: { alignItems: 'center', paddingVertical: SPACING.md },
  menuLabel: { ...TYPO.bodySm, fontWeight: '600', marginTop: SPACING.sm, color: COLORS.textPrimary },
  feedbackCard: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  feedbackLabel: { ...TYPO.bodySm, color: COLORS.textSecondary },
  feedbackMemo: { ...TYPO.bodySm, color: COLORS.textPrimary, marginTop: SPACING.xs },
  badge: { backgroundColor: COLORS.danger },
});
