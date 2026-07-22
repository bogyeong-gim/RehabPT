import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, IconButton, Portal, Modal, Button, Avatar, FAB } from 'react-native-paper';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPO } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { subscribeToSchedules, updateScheduleStatus } from '../../services/scheduleService';
import {
  getWeekStart, getWeekDays, WEEKDAY_LABELS, formatHour, isSameDay,
  formatDate, formatTime, getStatusLabel, getStatusColor,
} from '../../utils/helpers';
import { Schedule } from '../../types';

const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 18;
const ROW_HEIGHT = 76;
const TIME_COL_WIDTH = 56;

export default function WeeklyScheduleScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const { schedules, setSchedules } = useScheduleStore();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [names, setNames] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Schedule | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSchedules(user.id, 'therapist', setSchedules);
    loadNames();
    return unsubscribe;
  }, [user]);

  const loadNames = async () => {
    if (!user) return;
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'patient'),
      where('therapistId', '==', user.id),
    );
    const snapshot = await getDocs(q);
    const map: Record<string, string> = {};
    snapshot.docs.forEach((d) => { map[d.id] = d.data().name; });
    setNames(map);
  };

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekEnd = weekDays[6];
  const today = new Date();

  // 이번 주 스케줄만 필터
  const weekSchedules = useMemo(() => {
    const startMs = weekStart.getTime();
    const endMs = weekDays[6].getTime() + 24 * 60 * 60 * 1000;
    return schedules.filter((s) => {
      const t = s.date.toMillis();
      return t >= startMs && t < endMs;
    });
  }, [schedules, weekStart, weekDays]);

  // 표시 시간 범위 (스케줄에 맞춰 확장, 기본 9~18시)
  const { startHour, hours } = useMemo(() => {
    let min = DEFAULT_START_HOUR;
    let max = DEFAULT_END_HOUR;
    weekSchedules.forEach((s) => {
      const h = s.date.toDate().getHours();
      if (h < min) min = h;
      if (h + 1 > max) max = h + 1;
    });
    const list: number[] = [];
    for (let h = min; h < max; h++) list.push(h);
    return { startHour: min, hours: list };
  }, [weekSchedules]);

  // [dayIndex][hour] → schedules
  const grid = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    weekSchedules.forEach((s) => {
      const d = s.date.toDate();
      const dayIndex = (d.getDay() + 6) % 7; // 월=0 ... 일=6
      const key = `${dayIndex}-${d.getHours()}`;
      (map[key] ||= []).push(s);
    });
    return map;
  }, [weekSchedules]);

  const shiftWeek = (delta: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  };

  const monthLabel = `${weekDays[3].getMonth() + 1}월`;
  const rangeLabel =
    `${weekStart.getMonth() + 1}.${weekStart.getDate()} - ${weekEnd.getMonth() + 1}.${weekEnd.getDate()}`;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.monthBlock}>
            <Text style={styles.month}>{monthLabel}</Text>
            <Text style={styles.range}>{rangeLabel}</Text>
          </View>
          <View style={styles.weekNav}>
            <IconButton icon="chevron-left" size={24} onPress={() => shiftWeek(-1)} iconColor={COLORS.textSecondary} />
            <Pressable onPress={() => setWeekStart(getWeekStart(new Date()))} style={styles.todayBtn}>
              <Text style={styles.todayBtnText}>오늘</Text>
            </Pressable>
            <IconButton icon="chevron-right" size={24} onPress={() => shiftWeek(1)} iconColor={COLORS.textSecondary} />
          </View>
        </View>

        {/* 범례 */}
        <View style={styles.legend}>
          <LegendItem color={getStatusColor('pending')} label="예정" />
          <LegendItem color={getStatusColor('completed')} label="완료" />
          <LegendItem color={getStatusColor('missed')} label="미수행(노쇼)" />
        </View>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.dayHeaderRow}>
        <View style={{ width: TIME_COL_WIDTH }} />
        {weekDays.map((d, i) => {
          const isToday = isSameDay(d, today);
          return (
            <View key={i} style={styles.dayHeaderCell}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{WEEKDAY_LABELS[i]}</Text>
              <View style={[styles.dateCircle, isToday && styles.dateCircleToday]}>
                <Text style={[styles.dateText, isToday && styles.dateTextToday]}>{d.getDate()}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* 타임테이블 */}
      <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xxl }}>
        {weekSchedules.length === 0 && (
          <View style={styles.emptyBanner}>
            <Avatar.Icon size={40} icon="calendar-blank-outline" color={COLORS.primary} style={{ backgroundColor: COLORS.mint }} />
            <Text style={styles.emptyText}>이번 주 등록된 스케줄이 없습니다.</Text>
          </View>
        )}
        {hours.map((hour) => (
          <View key={hour} style={[styles.gridRow, { height: ROW_HEIGHT }]}>
            <View style={styles.timeCell}>
              <Text style={styles.timeText}>{formatHour(hour)}</Text>
            </View>
            {weekDays.map((d, dayIndex) => {
              const cellSchedules = grid[`${dayIndex}-${hour}`] || [];
              const isToday = isSameDay(d, today);
              return (
                <View key={dayIndex} style={[styles.dayCell, isToday && styles.dayCellToday]}>
                  {cellSchedules.map((s) => (
                    <Pressable
                      key={s.id}
                      style={[styles.block, { backgroundColor: getStatusColor(s.status) }]}
                      onPress={() => setSelected(s)}
                    >
                      <Text style={styles.blockName} numberOfLines={1}>
                        {names[s.patientId] || '환자'}
                      </Text>
                      <Text style={styles.blockTitle} numberOfLines={1}>{s.title}</Text>
                    </Pressable>
                  ))}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        color={COLORS.white}
        onPress={() => navigation.navigate('ScheduleManageMain')}
      />

      {/* 상세 모달 */}
      <Portal>
        <Modal visible={!!selected} onDismiss={() => setSelected(null)} contentContainerStyle={styles.modal}>
          {selected && (
            <ScheduleDetail
              schedule={selected}
              patientName={names[selected.patientId] || '환자'}
              onClose={() => setSelected(null)}
              onManage={() => {
                setSelected(null);
                navigation.navigate('ScheduleManageMain', { patientId: selected.patientId });
              }}
            />
          )}
        </Modal>
      </Portal>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function ScheduleDetail({ schedule, patientName, onClose, onManage }: any) {
  const [saving, setSaving] = useState(false);
  const markCompleted = async () => {
    setSaving(true);
    try {
      await updateScheduleStatus(schedule.id, 'completed');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{patientName} 님의 치료 일정</Text>
        <View style={[styles.statusChip, { backgroundColor: getStatusColor(schedule.status) }]}>
          <Text style={styles.statusChipText}>{getStatusLabel(schedule.status)}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Avatar.Icon size={30} icon="calendar-outline" color={COLORS.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>{formatDate(schedule.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Avatar.Icon size={30} icon="clock-outline" color={COLORS.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>{formatTime(schedule.date)}</Text>
        </View>
      </View>

      <Text style={styles.detailTitle}>{schedule.title}</Text>
      {!!schedule.description && <Text style={styles.detailDesc}>{schedule.description}</Text>}

      {schedule.exercises?.length > 0 && (
        <View style={styles.exerciseWrap}>
          <Text style={styles.exerciseHeading}>운동 {schedule.exercises.length}개</Text>
          {schedule.exercises.map((ex: any, i: number) => (
            <View key={i} style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseMeta}>
                {ex.sets}세트 × {ex.reps}회{ex.duration ? ` · ${ex.duration}초` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.notice}>완료 처리 시 환자에게도 반영됩니다.</Text>

      <View style={styles.modalActions}>
        <Button mode="outlined" onPress={onManage} style={styles.actionBtn} textColor={COLORS.textSecondary} theme={{ colors: { outline: COLORS.border } }}>
          스케줄 관리
        </Button>
        {schedule.status !== 'completed' && (
          <Button mode="contained" onPress={markCompleted} loading={saving} disabled={saving} style={styles.actionBtn} buttonColor={COLORS.primary}>
            완료로 표시
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 56,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthBlock: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm },
  month: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
  range: { ...TYPO.bodySm, color: COLORS.textSecondary },
  weekNav: { flexDirection: 'row', alignItems: 'center' },
  todayBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.mint,
  },
  todayBtnText: { ...TYPO.caption, color: COLORS.primaryDark, fontWeight: '700' },
  legend: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fab: { position: 'absolute', right: SPACING.lg, bottom: SPACING.lg, backgroundColor: COLORS.primary },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { ...TYPO.caption, color: COLORS.textSecondary },

  dayHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayHeaderCell: { flex: 1, alignItems: 'center', gap: 4 },
  dayLabel: { ...TYPO.caption, color: COLORS.textSecondary },
  dayLabelToday: { color: COLORS.primary, fontWeight: '700' },
  dateCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dateCircleToday: { backgroundColor: COLORS.primary },
  dateText: { ...TYPO.bodySm, fontWeight: '600', color: COLORS.textPrimary },
  dateTextToday: { color: COLORS.white },

  gridRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  timeCell: { width: TIME_COL_WIDTH, paddingTop: 6, paddingRight: SPACING.xs, alignItems: 'flex-end' },
  timeText: { ...TYPO.caption, color: COLORS.textLight },
  dayCell: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    padding: 3,
    gap: 3,
  },
  dayCellToday: { backgroundColor: COLORS.mint },
  block: {
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: 6,
    flex: 1,
    justifyContent: 'center',
    minHeight: 34,
    ...SHADOWS.sm,
  },
  blockName: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  blockTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 10 },

  emptyBanner: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  emptyText: { ...TYPO.body, color: COLORS.textSecondary },

  modal: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { ...TYPO.h3, color: COLORS.textPrimary, flex: 1 },
  statusChip: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm + 2, paddingVertical: 3 },
  statusChipText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  infoCard: {
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  infoIcon: { backgroundColor: 'transparent' },
  infoText: { ...TYPO.body, color: COLORS.textPrimary, fontWeight: '600' },
  detailTitle: { ...TYPO.h3, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  detailDesc: { ...TYPO.bodySm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  exerciseWrap: { marginTop: SPACING.xs, marginBottom: SPACING.md },
  exerciseHeading: { ...TYPO.caption, color: COLORS.primary, fontWeight: '700', marginBottom: SPACING.sm },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exerciseName: { ...TYPO.bodySm, color: COLORS.textPrimary, fontWeight: '600' },
  exerciseMeta: { ...TYPO.caption, color: COLORS.textSecondary },
  notice: { ...TYPO.caption, color: COLORS.textLight, marginBottom: SPACING.md },
  modalActions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1, borderRadius: RADIUS.md },
});
