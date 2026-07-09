import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Button, Avatar, Badge } from 'react-native-paper';
import { COLORS } from '../../utils/constants';
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>안녕하세요,</Text>
          <Title style={styles.userName}>{user?.name} 치료사님</Title>
        </View>
        <Button mode="text" onPress={handleLogout} textColor={COLORS.textSecondary}>
          로그아웃
        </Button>
      </View>

      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statNumber}>{totalPatients}</Text>
            <Text style={styles.statLabel}>담당 환자</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Card.Content style={styles.statContent}>
            <Text style={[styles.statNumber, { color: COLORS.warning }]}>{todaySchedules.length}</Text>
            <Text style={styles.statLabel}>오늘 스케줄</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: '#FCE4EC' }]}>
          <Card.Content style={styles.statContent}>
            <Text style={[styles.statNumber, { color: COLORS.danger }]}>{pendingFeedbacks}</Text>
            <Text style={styles.statLabel}>미확인 피드백</Text>
          </Card.Content>
        </Card>
      </View>

      <Title style={styles.sectionTitle}>빠른 메뉴</Title>
      <View style={styles.menuGrid}>
        <Card style={styles.menuCard} onPress={() => navigation.navigate('PatientListTab')}>
          <Card.Content style={styles.menuContent}>
            <Avatar.Icon size={40} icon="account-group" style={{ backgroundColor: COLORS.primary }} />
            <Text style={styles.menuLabel}>환자 목록</Text>
          </Card.Content>
        </Card>
        <Card style={styles.menuCard} onPress={() => navigation.navigate('ScheduleManageTab')}>
          <Card.Content style={styles.menuContent}>
            <Avatar.Icon size={40} icon="calendar-plus" style={{ backgroundColor: COLORS.success }} />
            <Text style={styles.menuLabel}>스케줄 관리</Text>
          </Card.Content>
        </Card>
        <Card style={styles.menuCard} onPress={() => navigation.navigate('FeedbackReviewTab')}>
          <Card.Content style={styles.menuContent}>
            <Avatar.Icon size={40} icon="clipboard-text" style={{ backgroundColor: COLORS.warning }} />
            <Text style={styles.menuLabel}>피드백 확인</Text>
          </Card.Content>
        </Card>
        <Card style={styles.menuCard} onPress={() => navigation.navigate('ChatTab')}>
          <Card.Content style={styles.menuContent}>
            <Avatar.Icon size={40} icon="chat" style={{ backgroundColor: '#9C27B0' }} />
            <Text style={styles.menuLabel}>메시지</Text>
          </Card.Content>
        </Card>
        <Card style={styles.menuCard} onPress={() => navigation.navigate('VideoManageTab')}>
          <Card.Content style={styles.menuContent}>
            <Avatar.Icon size={40} icon="video" style={{ backgroundColor: COLORS.danger }} />
            <Text style={styles.menuLabel}>영상 관리</Text>
          </Card.Content>
        </Card>
      </View>

      {recentFeedbacks.length > 0 && (
        <>
          <Title style={styles.sectionTitle}>최근 피드백</Title>
          {recentFeedbacks.slice(0, 3).map((fb) => (
            <Card key={fb.id} style={styles.feedbackCard}>
              <Card.Content>
                <View style={styles.feedbackRow}>
                  <Text style={styles.feedbackLabel}>통증: {fb.painLevel}/10</Text>
                  <Text style={styles.feedbackLabel}>난이도: {fb.difficulty}/5</Text>
                  {!fb.therapistComment && (
                    <Badge style={styles.badge}>미확인</Badge>
                  )}
                </View>
                {fb.memo ? (
                  <Text style={styles.feedbackMemo} numberOfLines={2}>{fb.memo}</Text>
                ) : null}
              </Card.Content>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  greeting: { fontSize: 14, color: COLORS.textSecondary },
  userName: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: { flex: 1, borderRadius: 12, elevation: 0 },
  statContent: { alignItems: 'center', paddingVertical: 14 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  menuCard: { width: '47%', borderRadius: 12 },
  menuContent: { alignItems: 'center', paddingVertical: 16 },
  menuLabel: { fontSize: 13, marginTop: 8, color: COLORS.textPrimary },
  feedbackCard: { marginHorizontal: 20, marginBottom: 10, borderRadius: 12 },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feedbackLabel: { fontSize: 13, color: COLORS.textSecondary },
  feedbackMemo: { fontSize: 13, color: COLORS.textPrimary, marginTop: 6 },
  badge: { backgroundColor: COLORS.danger },
});
