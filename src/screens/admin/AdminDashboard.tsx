import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Button, Avatar } from 'react-native-paper';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { COLORS } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { logoutUser } from '../../services/authService';

export default function AdminDashboard({ navigation }: any) {
  const logout = useAuthStore((s) => s.logout);
  const [stats, setStats] = useState({ patients: 0, therapists: 0, schedules: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const patientsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'patient')));
      const therapistsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'therapist')));
      const schedulesSnap = await getDocs(collection(db, 'schedules'));
      setStats({
        patients: patientsSnap.size,
        therapists: therapistsSnap.size,
        schedules: schedulesSnap.size,
      });
    } catch {
      // 에러 처리
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>관리자 대시보드</Title>
        <Button mode="text" onPress={handleLogout} textColor={COLORS.textSecondary}>
          로그아웃
        </Button>
      </View>

      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { backgroundColor: COLORS.tintTeal }]}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={36} icon="account" style={{ backgroundColor: COLORS.primary }} />
            <Text style={styles.statNumber}>{stats.patients}</Text>
            <Text style={styles.statLabel}>환자</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: COLORS.tintGreen }]}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={36} icon="doctor" style={{ backgroundColor: COLORS.success }} />
            <Text style={[styles.statNumber, { color: COLORS.success }]}>{stats.therapists}</Text>
            <Text style={styles.statLabel}>치료사</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: COLORS.tintAmber }]}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={36} icon="calendar" style={{ backgroundColor: COLORS.warning }} />
            <Text style={[styles.statNumber, { color: COLORS.warning }]}>{stats.schedules}</Text>
            <Text style={styles.statLabel}>스케줄</Text>
          </Card.Content>
        </Card>
      </View>

      <Title style={styles.sectionTitle}>관리 메뉴</Title>

      <Card style={styles.menuCard} onPress={() => navigation.navigate('UserManage')}>
        <Card.Content style={styles.menuContent}>
          <Avatar.Icon size={44} icon="account-group" style={{ backgroundColor: COLORS.primary }} />
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>사용자 관리</Text>
            <Text style={styles.menuDesc}>환자/치료사 계정 관리 및 매칭</Text>
          </View>
        </Card.Content>
      </Card>
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
  title: { fontSize: 22, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 12, elevation: 0 },
  statContent: { alignItems: 'center', paddingVertical: 14 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginTop: 8 },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 12 },
  menuCard: { marginHorizontal: 20, marginBottom: 10, borderRadius: 12 },
  menuContent: { flexDirection: 'row', alignItems: 'center' },
  menuInfo: { marginLeft: 14, flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600' },
  menuDesc: { fontSize: 13, color: COLORS.textSecondary },
});
