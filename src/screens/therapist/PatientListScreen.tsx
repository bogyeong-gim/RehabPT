import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text, Searchbar, Avatar } from 'react-native-paper';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPO } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { getTherapistSchedules } from '../../services/scheduleService';
import { User, Schedule } from '../../types';

type SortKey = 'upcoming' | 'name';

interface PatientStat {
  total: number;
  completed: number;
  nextDate: Date | null; // 다가오는 수업
}

export default function PatientListScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const [patients, setPatients] = useState<User[]>([]);
  const [stats, setStats] = useState<Record<string, PatientStat>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'patient'),
        where('therapistId', '==', user.id),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as User));
      setPatients(data);

      const schedules = await getTherapistSchedules(user.id);
      setStats(buildStats(schedules));
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  };

  const buildStats = (schedules: Schedule[]): Record<string, PatientStat> => {
    const now = Date.now();
    const map: Record<string, PatientStat> = {};
    schedules.forEach((s) => {
      const stat = (map[s.patientId] ||= { total: 0, completed: 0, nextDate: null });
      stat.total += 1;
      if (s.status === 'completed') stat.completed += 1;
      const d = s.date.toDate();
      if (d.getTime() >= now && (!stat.nextDate || d < stat.nextDate)) {
        stat.nextDate = d;
      }
    });
    return map;
  };

  const list = useMemo(() => {
    const filtered = searchQuery
      ? patients.filter((p) => p.name.includes(searchQuery) || p.phone.includes(searchQuery) || p.email.includes(searchQuery))
      : [...patients];

    filtered.sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      // 다가오는 수업순: 예정된 수업이 가까운 순, 없는 사람은 뒤로
      const an = stats[a.id]?.nextDate?.getTime() ?? Infinity;
      const bn = stats[b.id]?.nextDate?.getTime() ?? Infinity;
      return an - bn;
    });
    return filtered;
  }, [patients, stats, searchQuery, sortKey]);

  const renderPatient = ({ item }: { item: User }) => {
    const stat = stats[item.id] || { total: 0, completed: 0, nextDate: null };
    const isActive = !!stat.nextDate;
    const dLabel = getDLabel(stat.nextDate);
    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('ScheduleManage', { patientId: item.id, patientName: item.name })}
      >
        <Avatar.Text size={46} label={item.name.charAt(0)} color={COLORS.white} style={{ backgroundColor: isActive ? COLORS.primary : COLORS.textLight }} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? COLORS.mint : COLORS.light }]}>
              <Text style={[styles.statusText, { color: isActive ? COLORS.primaryDark : COLORS.textSecondary }]}>
                {isActive ? '활성' : '대기'}
              </Text>
            </View>
            {dLabel && (
              <View style={styles.dBadge}>
                <Text style={styles.dText}>{dLabel}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.progressBlock}>
          <Text style={styles.progressCount}>
            <Text style={styles.progressDone}>{stat.completed}</Text>
            <Text style={styles.progressTotal}> / {stat.total}회</Text>
          </Text>
          <Text style={styles.progressLabel}>완료 회차</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 회원</Text>
      </View>

      <Searchbar
        placeholder="회원 이름 검색"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={{ minHeight: 0 }}
      />

      <View style={styles.toolbar}>
        <View style={styles.countRow}>
          <Avatar.Icon size={22} icon="account-group-outline" color={COLORS.textSecondary} style={{ backgroundColor: 'transparent' }} />
          <Text style={styles.countText}>전체 회원 {patients.length}명</Text>
        </View>
        <Pressable style={styles.sortBtn} onPress={() => setSortKey(sortKey === 'upcoming' ? 'name' : 'upcoming')}>
          <Avatar.Icon size={20} icon="swap-vertical" color={COLORS.primary} style={{ backgroundColor: 'transparent' }} />
          <Text style={styles.sortText}>{sortKey === 'upcoming' ? '다가오는 수업순' : '이름순'}</Text>
        </Pressable>
      </View>

      {loading ? (
        <Text style={styles.emptyText}>로딩 중...</Text>
      ) : list.length === 0 ? (
        <Text style={styles.emptyText}>
          {searchQuery ? '검색 결과가 없습니다.' : '담당 회원이 없습니다.'}
        </Text>
      ) : (
        <FlatList
          data={list}
          renderItem={renderPatient}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

function getDLabel(date: Date | null): string | null {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff <= 0) return 'D-DAY';
  return `D-${diff}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: 52, paddingBottom: SPACING.xs },
  title: { ...TYPO.h1, color: COLORS.textPrimary },
  searchbar: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 0,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  countText: { ...TYPO.bodySm, color: COLORS.textSecondary, fontWeight: '600' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sortText: { ...TYPO.bodySm, color: COLORS.primary, fontWeight: '600' },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  info: { flex: 1 },
  name: { ...TYPO.h3, color: COLORS.textPrimary },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 6 },
  statusBadge: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  statusText: { fontSize: 11, fontWeight: '700' },
  dBadge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  progressBlock: { alignItems: 'flex-end' },
  progressCount: { flexDirection: 'row' },
  progressDone: { ...TYPO.h3, color: COLORS.primary },
  progressTotal: { ...TYPO.bodySm, color: COLORS.textSecondary },
  progressLabel: { ...TYPO.caption, color: COLORS.textLight, marginTop: 2 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40 },
});
