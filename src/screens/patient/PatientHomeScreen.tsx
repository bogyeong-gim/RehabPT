import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Button, Avatar, Divider } from 'react-native-paper';
import { COLORS } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { subscribeToSchedules } from '../../services/scheduleService';
import { formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers';
import { logoutUser } from '../../services/authService';
import { Schedule } from '../../types';

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>안녕하세요,</Text>
          <Title style={styles.userName}>{user?.name}님</Title>
        </View>
        <Button mode="text" onPress={handleLogout} textColor={COLORS.textSecondary}>
          로그아웃
        </Button>
      </View>

      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>예정된 운동</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Card.Content style={styles.statContent}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>{completedCount}</Text>
            <Text style={styles.statLabel}>완료한 운동</Text>
          </Card.Content>
        </Card>
      </View>

      <Title style={styles.sectionTitle}>오늘의 운동</Title>
      {todaySchedules.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>오늘 예정된 운동이 없습니다.</Text>
          </Card.Content>
        </Card>
      ) : (
        todaySchedules.map((schedule) => (
          <Card
            key={schedule.id}
            style={styles.scheduleCard}
            onPress={() => navigation.navigate('Schedule', { scheduleId: schedule.id })}
          >
            <Card.Content>
              <View style={styles.scheduleHeader}>
                <Title style={styles.scheduleTitle}>{schedule.title}</Title>
                <Text
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}
                >
                  {getStatusLabel(schedule.status)}
                </Text>
              </View>
              <Text style={styles.scheduleDesc}>{schedule.description}</Text>
              <Text style={styles.exerciseCount}>
                운동 {schedule.exercises.length}개
              </Text>
            </Card.Content>
          </Card>
        ))
      )}

      <Title style={styles.sectionTitle}>빠른 메뉴</Title>
      <View style={styles.menuRow}>
        <Card style={styles.menuCard} onPress={() => navigation.navigate('ScheduleTab')}>
          <Card.Content style={styles.menuContent}>
            <Avatar.Icon size={40} icon="calendar" style={{ backgroundColor: COLORS.primary }} />
            <Text style={styles.menuLabel}>전체 스케줄</Text>
          </Card.Content>
        </Card>
        <Card style={styles.menuCard} onPress={() => navigation.navigate('ChatTab')}>
          <Card.Content style={styles.menuContent}>
            <Avatar.Icon size={40} icon="chat" style={{ backgroundColor: COLORS.success }} />
            <Text style={styles.menuLabel}>메시지</Text>
          </Card.Content>
        </Card>
        <Card style={styles.menuCard} onPress={() => navigation.navigate('VideoTab')}>
          <Card.Content style={styles.menuContent}>
            <Avatar.Icon size={40} icon="play-circle" style={{ backgroundColor: COLORS.warning }} />
            <Text style={styles.menuLabel}>운동 영상</Text>
          </Card.Content>
        </Card>
      </View>
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
  userName: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: { flex: 1, borderRadius: 12, elevation: 0 },
  statContent: { alignItems: 'center', paddingVertical: 16 },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 12,
    color: COLORS.textPrimary,
  },
  emptyCard: { marginHorizontal: 20, marginBottom: 24, borderRadius: 12 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, paddingVertical: 12 },
  scheduleCard: { marginHorizontal: 20, marginBottom: 10, borderRadius: 12 },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTitle: { fontSize: 16, fontWeight: '600' },
  statusBadge: {
    color: COLORS.white,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scheduleDesc: { color: COLORS.textSecondary, marginTop: 4, fontSize: 13 },
  exerciseCount: { color: COLORS.primary, marginTop: 8, fontSize: 13 },
  menuRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 40,
  },
  menuCard: { flex: 1, borderRadius: 12 },
  menuContent: { alignItems: 'center', paddingVertical: 16 },
  menuLabel: { fontSize: 13, marginTop: 8, color: COLORS.textPrimary },
});
