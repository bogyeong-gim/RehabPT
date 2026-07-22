import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Button, Avatar } from 'react-native-paper';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPO } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { subscribeToSchedules } from '../../services/scheduleService';
import { getStatusLabel, getStatusColor } from '../../utils/helpers';
import { logoutUser } from '../../services/authService';

export default function PatientHomeScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const { schedules, setSchedules } = useScheduleStore();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSchedules(user.id, 'patient', setSchedules);
    return unsubscribe;
  }, [user]);

  const todaySchedules = schedules.filter((s) => {
    const scheduleDate = s.date.toDate();
    const today = new Date();
    return (
      scheduleDate.getFullYear() === today.getFullYear() &&
      scheduleDate.getMonth() === today.getMonth() &&
      scheduleDate.getDate() === today.getDate()
    );
  });

  const pendingCount = schedules.filter((s) => s.status === 'pending').length;
  const completedCount = schedules.filter((s) => s.status === 'completed').length;

  const handleLogout = async () => {
    await logoutUser();
    logout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: SPACING.xxl }}>
      {/* 딥 틸 히어로 */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.greeting}>안녕하세요</Text>
            <Title style={styles.userName}>{user?.name}님</Title>
          </View>
          <Button
            mode="text"
            onPress={handleLogout}
            textColor="rgba(255,255,255,0.85)"
            compact
          >
            로그아웃
          </Button>
        </View>
        <Text style={styles.heroSub}>오늘도 꾸준히 회복해 나가요.</Text>

        {/* 히어로 위에 얹히는 스탯 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>예정된 운동</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>{completedCount}</Text>
            <Text style={styles.statLabel}>완료한 운동</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>오늘의 운동</Text>
        {todaySchedules.length === 0 ? (
          <Card style={styles.emptyCard} mode="contained">
            <Card.Content>
              <Text style={styles.emptyText}>오늘 예정된 운동이 없습니다.</Text>
            </Card.Content>
          </Card>
        ) : (
          todaySchedules.map((schedule) => (
            <Card
              key={schedule.id}
              style={styles.scheduleCard}
              mode="contained"
              onPress={() => navigation.navigate('Schedule', { scheduleId: schedule.id })}
            >
              <Card.Content>
                <View style={styles.scheduleHeader}>
                  <Title style={styles.scheduleTitle}>{schedule.title}</Title>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
                    <Text style={styles.statusBadgeText}>{getStatusLabel(schedule.status)}</Text>
                  </View>
                </View>
                {!!schedule.description && (
                  <Text style={styles.scheduleDesc}>{schedule.description}</Text>
                )}
                <Text style={styles.exerciseCount}>운동 {schedule.exercises.length}개</Text>
              </Card.Content>
            </Card>
          ))
        )}

        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>빠른 메뉴</Text>
        <View style={styles.menuRow}>
          <MenuItem
            icon="calendar-month-outline"
            tint={COLORS.tintTeal}
            color={COLORS.primary}
            label="전체 스케줄"
            onPress={() => navigation.navigate('ScheduleTab')}
          />
          <MenuItem
            icon="chat-outline"
            tint={COLORS.tintGreen}
            color={COLORS.success}
            label="메시지"
            onPress={() => navigation.navigate('ChatTab')}
          />
          <MenuItem
            icon="play-circle-outline"
            tint={COLORS.tintAmber}
            color={COLORS.warning}
            label="운동 영상"
            onPress={() => navigation.navigate('VideoTab')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function MenuItem({ icon, tint, color, label, onPress }: any) {
  return (
    <Card style={styles.menuCard} mode="contained" onPress={onPress}>
      <Card.Content style={styles.menuContent}>
        <Avatar.Icon size={48} icon={icon} color={color} style={{ backgroundColor: tint }} />
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
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { ...TYPO.bodySm, color: 'rgba(255,255,255,0.7)' },
  userName: { ...TYPO.h1, color: COLORS.white, marginTop: 2 },
  heroSub: { ...TYPO.body, color: 'rgba(255,255,255,0.75)', marginTop: SPACING.xs },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  statNumber: { fontSize: 30, fontWeight: '700', color: COLORS.white },
  statLabel: { ...TYPO.caption, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  body: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  sectionTitle: { ...TYPO.h2, color: COLORS.textPrimary, marginBottom: SPACING.md },
  emptyCard: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, paddingVertical: SPACING.md },
  scheduleCard: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTitle: { ...TYPO.h3, color: COLORS.textPrimary },
  statusBadge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
  },
  statusBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  scheduleDesc: { ...TYPO.bodySm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  exerciseCount: { ...TYPO.bodySm, color: COLORS.primary, fontWeight: '600', marginTop: SPACING.sm },
  menuRow: { flexDirection: 'row', gap: SPACING.md },
  menuCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  menuContent: { alignItems: 'center', paddingVertical: SPACING.md },
  menuLabel: { ...TYPO.caption, color: COLORS.textPrimary, marginTop: SPACING.sm, textAlign: 'center' },
});
