import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  TextInput, Button, Title, Text, Card, FAB, Portal, Modal, Chip, IconButton, Divider,
} from 'react-native-paper';
import { COLORS } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { useScheduleStore } from '../../store/scheduleStore';
import {
  createSchedule, deleteSchedule, subscribeToSchedules,
} from '../../services/scheduleService';
import { formatDateTime, getStatusLabel, getStatusColor, confirmDialog } from '../../utils/helpers';
import { Exercise } from '../../types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

export default function ScheduleManageScreen({ route, navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const { schedules, setSchedules } = useScheduleStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState('10:00');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exName, setExName] = useState('');
  const [exSets, setExSets] = useState('3');
  const [exReps, setExReps] = useState('10');
  const [exDuration, setExDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(route?.params?.patientId || '');

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSchedules(user.id, 'therapist', setSchedules);
    loadPatients();
    return unsubscribe;
  }, [user]);

  const loadPatients = async () => {
    if (!user) return;
    const q = query(collection(db, 'users'), where('role', '==', 'patient'), where('therapistId', '==', user.id));
    const snapshot = await getDocs(q);
    setPatients(snapshot.docs.map((d) => ({ id: d.id, name: d.data().name })));
  };

  const filteredSchedules = selectedPatientId
    ? schedules.filter((s) => s.patientId === selectedPatientId)
    : schedules;

  const addExercise = () => {
    if (!exName) return;
    const ex: Exercise = { name: exName, sets: parseInt(exSets) || 3, reps: parseInt(exReps) || 10 };
    if (exDuration) ex.duration = parseInt(exDuration);
    setExercises([...exercises, ex]);
    setExName('');
    setExDuration('');
  };

  const removeExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    if (!user || !selectedPatientId || !title || !dateStr || exercises.length === 0) {
      Alert.alert('알림', '환자, 제목, 날짜, 운동을 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const time = /^\d{1,2}:\d{2}$/.test(timeStr) ? timeStr : '10:00';
      const date = new Date(`${dateStr}T${time}:00`);
      if (isNaN(date.getTime())) {
        Alert.alert('알림', '날짜 형식이 올바르지 않습니다. (예: 2026-07-10)');
        setLoading(false);
        return;
      }
      await createSchedule(selectedPatientId, user.id, title, description, date, exercises);
      setModalVisible(false);
      resetForm();
      Alert.alert('완료', '스케줄이 등록되었습니다.');
    } catch {
      Alert.alert('오류', '스케줄 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (scheduleId: string) => {
    confirmDialog('삭제 확인', '이 스케줄을 삭제하시겠습니까?', () => {
      deleteSchedule(scheduleId);
    }, '삭제', true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDateStr(new Date().toISOString().split('T')[0]);
    setTimeStr('10:00');
    setExercises([]);
    setExName('');
    setExDuration('');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Title style={styles.title}>스케줄 관리</Title>
        </View>

        {patients.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patientFilter}>
            <Chip
              selected={!selectedPatientId}
              onPress={() => setSelectedPatientId('')}
              style={[styles.filterChip, !selectedPatientId && styles.filterChipActive]}
              textStyle={{ color: !selectedPatientId ? COLORS.white : COLORS.textPrimary }}
            >
              전체
            </Chip>
            {patients.map((p) => (
              <Chip
                key={p.id}
                selected={selectedPatientId === p.id}
                onPress={() => setSelectedPatientId(p.id)}
                style={[styles.filterChip, selectedPatientId === p.id && styles.filterChipActive]}
                textStyle={{ color: selectedPatientId === p.id ? COLORS.white : COLORS.textPrimary }}
              >
                {p.name}
              </Chip>
            ))}
          </ScrollView>
        )}

        {filteredSchedules.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>등록된 스케줄이 없습니다.</Text>
            </Card.Content>
          </Card>
        ) : (
          filteredSchedules.map((s) => {
            const patientName = patients.find((p) => p.id === s.patientId)?.name || '환자';
            return (
              <Card key={s.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.cardTop}>
                    <View>
                      <Text style={styles.cardTitle}>{s.title}</Text>
                      <Text style={styles.cardPatient}>{patientName}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      <Chip
                        style={{ backgroundColor: getStatusColor(s.status) }}
                        textStyle={{ color: COLORS.white, fontSize: 11 }}
                      >
                        {getStatusLabel(s.status)}
                      </Chip>
                      <IconButton icon="delete" size={18} onPress={() => handleDelete(s.id)} />
                    </View>
                  </View>
                  <Text style={styles.cardDate}>{formatDateTime(s.date)}</Text>
                  <Text style={styles.cardExercises}>운동 {s.exercises.length}개</Text>
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color={COLORS.white}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>새 스케줄 등록</Title>

            <Text style={styles.label}>환자 선택</Text>
            <ScrollView horizontal style={{ marginBottom: 12 }}>
              {patients.map((p) => (
                <Chip
                  key={p.id}
                  selected={selectedPatientId === p.id}
                  onPress={() => setSelectedPatientId(p.id)}
                  style={[styles.filterChip, selectedPatientId === p.id && styles.filterChipActive]}
                  textStyle={{ color: selectedPatientId === p.id ? COLORS.white : COLORS.textPrimary }}
                >
                  {p.name}
                </Chip>
              ))}
            </ScrollView>

            <TextInput
              label="스케줄 제목"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="설명 (선택)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              style={styles.input}
            />
            <View style={styles.dateTimeRow}>
              <TextInput
                label="날짜 (2026-07-10)"
                value={dateStr}
                onChangeText={setDateStr}
                mode="outlined"
                style={[styles.input, { flex: 3 }]}
              />
              <TextInput
                label="시간"
                value={timeStr}
                onChangeText={setTimeStr}
                mode="outlined"
                placeholder="10:00"
                style={[styles.input, { flex: 2 }]}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((t) => (
                <Chip
                  key={t}
                  selected={timeStr === t}
                  onPress={() => setTimeStr(t)}
                  style={[styles.timeChip, timeStr === t && styles.filterChipActive]}
                  textStyle={{ color: timeStr === t ? COLORS.white : COLORS.textPrimary, fontSize: 12 }}
                  compact
                >
                  {t}
                </Chip>
              ))}
            </ScrollView>

            <Divider style={{ marginVertical: 12 }} />
            <Text style={styles.label}>운동 추가</Text>
            <View style={styles.exerciseInputRow}>
              <TextInput
                label="운동명"
                value={exName}
                onChangeText={setExName}
                mode="outlined"
                style={[styles.input, { flex: 2 }]}
              />
              <TextInput
                label="세트"
                value={exSets}
                onChangeText={setExSets}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, { flex: 1, marginHorizontal: 4 }]}
              />
              <TextInput
                label="횟수"
                value={exReps}
                onChangeText={setExReps}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
              />
              <TextInput
                label="시간(분)"
                value={exDuration}
                onChangeText={setExDuration}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, { flex: 1, marginLeft: 4 }]}
              />
            </View>
            <Button mode="outlined" onPress={addExercise} style={{ marginBottom: 8 }}>
              운동 추가
            </Button>

            {exercises.map((ex, idx) => (
              <View key={idx} style={styles.exerciseListItem}>
                <Text>{ex.name} - {ex.sets}세트 x {ex.reps}회{ex.duration ? ` (${ex.duration}분)` : ''}</Text>
                <IconButton icon="close" size={16} onPress={() => removeExercise(idx)} />
              </View>
            ))}

            <Button
              mode="contained"
              onPress={handleCreate}
              loading={loading}
              disabled={loading}
              style={styles.submitBtn}
              buttonColor={COLORS.primary}
            >
              등록하기
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  patientFilter: { paddingHorizontal: 20, marginVertical: 12 },
  filterChip: { marginRight: 8, backgroundColor: COLORS.light },
  filterChipActive: { backgroundColor: COLORS.primary },
  emptyCard: { margin: 20, borderRadius: 12 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, paddingVertical: 16 },
  card: { marginHorizontal: 20, marginBottom: 10, borderRadius: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardPatient: { fontSize: 13, color: COLORS.primary },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  cardDate: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  dateTimeRow: { flexDirection: 'row', gap: 8 },
  timeChip: { marginRight: 6, backgroundColor: COLORS.light },
  cardExercises: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
  },
  modal: {
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: COLORS.textPrimary },
  input: { marginBottom: 8, backgroundColor: COLORS.white },
  exerciseInputRow: { flexDirection: 'row' },
  exerciseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.light,
    borderRadius: 6,
    marginBottom: 4,
  },
  submitBtn: { marginTop: 16, paddingVertical: 4, borderRadius: 8 },
});
