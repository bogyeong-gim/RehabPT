import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import {
  Text, Searchbar, FAB, Portal, Modal, TextInput, Button, Chip, Avatar, IconButton,
} from 'react-native-paper';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPO } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { subscribeToLogs, createLog, toggleLike } from '../../services/logService';
import { formatDate, getRelativeTime, notifyDialog } from '../../utils/helpers';
import { TreatmentLog } from '../../types';

export default function LogFeedScreen() {
  const user = useAuthStore((s) => s.user);
  const [logs, setLogs] = useState<TreatmentLog[]>([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToLogs(user.id, 'therapist', setLogs);
    loadPatients();
    return unsub;
  }, [user]);

  const loadPatients = async () => {
    if (!user) return;
    const q = query(collection(db, 'users'), where('role', '==', 'patient'), where('therapistId', '==', user.id));
    const snap = await getDocs(q);
    setPatients(snap.docs.map((d) => ({ id: d.id, name: d.data().name })));
  };

  const filtered = useMemo(() => {
    if (!search) return logs;
    return logs.filter((l) => l.patientName.includes(search) || l.content.includes(search));
  }, [logs, search]);

  const handleLike = (log: TreatmentLog) => {
    if (!user) return;
    toggleLike(log.id, user.id, log.likedBy?.includes(user.id) ?? false);
  };

  const renderLog = ({ item }: { item: TreatmentLog }) => {
    const liked = item.likedBy?.includes(user?.id || '') ?? false;
    const isOpen = expanded[item.id];
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Chip style={styles.kindChip} textStyle={styles.kindChipText} compact>수업 일지</Chip>
        </View>
        <View style={styles.authorRow}>
          <Avatar.Text size={38} label={item.therapistName?.charAt(0) || '치'} color={COLORS.white} style={{ backgroundColor: COLORS.primary }} />
          <View style={{ flex: 1 }}>
            <View style={styles.nameLine}>
              <Text style={styles.author}>{item.therapistName}</Text>
              <Avatar.Icon size={16} icon="chevron-right" color={COLORS.textLight} style={{ backgroundColor: 'transparent' }} />
              <Text style={styles.target}>{item.patientName} 회원</Text>
            </View>
            <Text style={styles.time}>{getRelativeTime(item.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.sessionBox}>
          <View style={styles.sessionBadge}>
            <Text style={styles.sessionBadgeText}>{item.sessionNumber}회차</Text>
          </View>
          <Text style={styles.sessionDate}>{formatDate(item.sessionDate)}</Text>
        </View>

        <Text style={styles.content} numberOfLines={isOpen ? undefined : 3}>{item.content}</Text>
        {item.content.length > 60 && (
          <Pressable onPress={() => setExpanded((p) => ({ ...p, [item.id]: !isOpen }))}>
            <Text style={styles.more}>{isOpen ? '접기' : '더보기'}</Text>
          </Pressable>
        )}

        <View style={styles.actionRow}>
          <Pressable style={styles.likeBtn} onPress={() => handleLike(item)}>
            <Avatar.Icon
              size={26}
              icon={liked ? 'heart' : 'heart-outline'}
              color={liked ? COLORS.danger : COLORS.textLight}
              style={{ backgroundColor: 'transparent' }}
            />
            <Text style={[styles.likeCount, liked && { color: COLORS.danger }]}>{item.likedBy?.length || 0}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>일지 피드</Text>
        <Text style={styles.subtitle}>회원별 치료 일지를 기록하고 모아보세요.</Text>
      </View>
      <Searchbar
        placeholder="치료 일지 검색"
        value={search}
        onChangeText={setSearch}
        style={styles.searchbar}
        inputStyle={{ minHeight: 0 }}
      />

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Avatar.Icon size={44} icon="notebook-outline" color={COLORS.primary} style={{ backgroundColor: COLORS.mint }} />
          <Text style={styles.emptyText}>
            {search ? '검색 결과가 없습니다.' : '아직 작성한 치료 일지가 없습니다.\n오른쪽 아래 + 로 첫 일지를 남겨보세요.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderLog}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB icon="plus" style={styles.fab} color={COLORS.white} onPress={() => setModalVisible(true)} />

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <CreateLogForm
            patients={patients}
            logs={logs}
            onClose={() => setModalVisible(false)}
            therapist={user}
          />
        </Modal>
      </Portal>
    </View>
  );
}

function CreateLogForm({ patients, logs, onClose, therapist }: any) {
  const [patientId, setPatientId] = useState('');
  const [sessionNumber, setSessionNumber] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  // 선택한 회원의 기존 일지 수 + 1 을 회차 기본값으로 제안
  const selectPatient = (id: string) => {
    setPatientId(id);
    const count = logs.filter((l: TreatmentLog) => l.patientId === id).length;
    setSessionNumber(String(count + 1));
  };

  const submit = async () => {
    const patient = patients.find((p: any) => p.id === patientId);
    if (!therapist || !patient || !content || !sessionNumber) {
      notifyDialog('알림', '회원·회차·내용을 모두 입력해주세요.');
      return;
    }
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      notifyDialog('알림', '날짜 형식이 올바르지 않습니다. (예: 2026-07-22)');
      return;
    }
    setSaving(true);
    try {
      await createLog(
        therapist.id, therapist.name, patient.id, patient.name,
        parseInt(sessionNumber, 10) || 1, parsed, content.trim(),
      );
      onClose();
    } catch {
      notifyDialog('오류', '일지 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView>
      <Text style={styles.modalTitle}>치료 일지 작성</Text>

      <Text style={styles.label}>회원 선택</Text>
      <View style={styles.chipRow}>
        {patients.length === 0 ? (
          <Text style={styles.hint}>담당 회원이 없습니다.</Text>
        ) : patients.map((p: any) => (
          <Chip
            key={p.id}
            selected={patientId === p.id}
            onPress={() => selectPatient(p.id)}
            style={[styles.patientChip, patientId === p.id && styles.patientChipSel]}
            textStyle={{ color: patientId === p.id ? COLORS.white : COLORS.textPrimary }}
          >
            {p.name}
          </Chip>
        ))}
      </View>

      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>회차</Text>
          <TextInput mode="outlined" keyboardType="number-pad" value={sessionNumber} onChangeText={setSessionNumber}
            outlineColor={COLORS.border} activeOutlineColor={COLORS.primary} style={styles.input} dense />
        </View>
        <View style={{ flex: 2 }}>
          <Text style={styles.label}>날짜</Text>
          <TextInput mode="outlined" value={dateStr} onChangeText={setDateStr} placeholder="2026-07-22"
            outlineColor={COLORS.border} activeOutlineColor={COLORS.primary} style={styles.input} dense />
        </View>
      </View>

      <Text style={styles.label}>치료 내용</Text>
      <TextInput
        mode="outlined" value={content} onChangeText={setContent} multiline numberOfLines={5}
        placeholder="진행한 운동/치료 내용을 기록하세요."
        outlineColor={COLORS.border} activeOutlineColor={COLORS.primary} style={[styles.input, { minHeight: 110 }]}
      />

      <Button mode="contained" onPress={submit} loading={saving} disabled={saving}
        buttonColor={COLORS.primary} style={styles.submitBtn} contentStyle={{ paddingVertical: SPACING.xs }}>
        일지 등록
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: 52, paddingBottom: SPACING.xs },
  title: { ...TYPO.h1, color: COLORS.textPrimary },
  subtitle: { ...TYPO.bodySm, color: COLORS.textSecondary, marginTop: 2 },
  searchbar: {
    marginHorizontal: SPACING.lg, marginTop: SPACING.sm, marginBottom: SPACING.sm,
    borderRadius: RADIUS.md, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, elevation: 0,
  },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 90 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
    marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  cardTop: { flexDirection: 'row', marginBottom: SPACING.sm },
  kindChip: { backgroundColor: COLORS.mint },
  kindChipText: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '700' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  nameLine: { flexDirection: 'row', alignItems: 'center' },
  author: { ...TYPO.bodySm, fontWeight: '700', color: COLORS.textPrimary },
  target: { ...TYPO.bodySm, fontWeight: '600', color: COLORS.primary },
  time: { ...TYPO.caption, color: COLORS.textLight, marginTop: 1 },
  sessionBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, marginTop: SPACING.md,
  },
  sessionBadge: { backgroundColor: COLORS.mintDeep, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  sessionBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark },
  sessionDate: { ...TYPO.bodySm, color: COLORS.textSecondary, fontWeight: '600' },
  content: { ...TYPO.body, color: COLORS.textPrimary, marginTop: SPACING.md },
  more: { ...TYPO.bodySm, color: COLORS.textSecondary, marginTop: SPACING.xs, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md,
    paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center' },
  likeCount: { ...TYPO.bodySm, color: COLORS.textLight, fontWeight: '600', marginLeft: -2 },
  empty: { alignItems: 'center', paddingTop: 60, gap: SPACING.md },
  emptyText: { ...TYPO.body, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  fab: { position: 'absolute', right: SPACING.lg, bottom: SPACING.lg, backgroundColor: COLORS.primary },

  modal: {
    backgroundColor: COLORS.surface, margin: SPACING.lg, padding: SPACING.lg,
    borderRadius: RADIUS.xl, maxHeight: '85%',
  },
  modalTitle: { ...TYPO.h2, color: COLORS.textPrimary, marginBottom: SPACING.md },
  label: { ...TYPO.bodySm, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.xs, marginTop: SPACING.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  hint: { ...TYPO.bodySm, color: COLORS.textLight },
  patientChip: { backgroundColor: COLORS.light },
  patientChipSel: { backgroundColor: COLORS.primary },
  row2: { flexDirection: 'row', gap: SPACING.md },
  input: { backgroundColor: COLORS.surface },
  submitBtn: { marginTop: SPACING.lg, borderRadius: RADIUS.md },
});
