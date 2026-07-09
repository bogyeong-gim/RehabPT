import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Text, Button, Chip, Divider } from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { COLORS } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { subscribeToSchedules, updateScheduleStatus } from '../../services/scheduleService';
import { formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers';
import { Schedule } from '../../types';

LocaleConfig.locales['ko'] = {
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
};
LocaleConfig.defaultLocale = 'ko';

export default function ScheduleScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const { schedules, setSchedules } = useScheduleStore();
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSchedules(user.id, 'patient', setSchedules);
    return unsubscribe;
  }, [user]);

  const markedDates: any = {};
  schedules.forEach((s) => {
    const dateStr = s.date.toDate().toISOString().split('T')[0];
    markedDates[dateStr] = {
      marked: true,
      dotColor: getStatusColor(s.status),
      selected: dateStr === selectedDate,
      selectedColor: COLORS.primary,
    };
  });

  if (selectedDate && !markedDates[selectedDate]) {
    markedDates[selectedDate] = { selected: true, selectedColor: COLORS.primary };
  }

  const filteredSchedules = selectedDate
    ? schedules.filter((s) => s.date.toDate().toISOString().split('T')[0] === selectedDate)
    : schedules;

  const handleComplete = async (scheduleId: string) => {
    Alert.alert('운동 완료', '이 운동을 완료로 표시하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '완료',
        onPress: async () => {
          await updateScheduleStatus(scheduleId, 'completed');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        theme={{
          selectedDayBackgroundColor: COLORS.primary,
          todayTextColor: COLORS.primary,
          arrowColor: COLORS.primary,
        }}
        style={styles.calendar}
      />

      <Title style={styles.sectionTitle}>
        {selectedDate
          ? `${selectedDate.replace(/-/g, '.')} 스케줄`
          : '전체 스케줄'}
      </Title>

      {filteredSchedules.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>해당 날짜에 예정된 운동이 없습니다.</Text>
          </Card.Content>
        </Card>
      ) : (
        filteredSchedules.map((schedule) => (
          <Card key={schedule.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.cardTitle}>{schedule.title}</Title>
                <Chip
                  style={{ backgroundColor: getStatusColor(schedule.status) }}
                  textStyle={{ color: COLORS.white, fontSize: 11 }}
                >
                  {getStatusLabel(schedule.status)}
                </Chip>
              </View>
              <Text style={styles.cardDate}>{formatDate(schedule.date)}</Text>
              <Text style={styles.cardDesc}>{schedule.description}</Text>

              <Divider style={styles.divider} />
              <Text style={styles.exerciseTitle}>운동 목록</Text>
              {schedule.exercises.map((ex, idx) => (
                <View key={idx} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseDetail}>
                    {ex.sets}세트 x {ex.reps}회
                    {ex.duration ? ` (${ex.duration}분)` : ''}
                  </Text>
                </View>
              ))}
            </Card.Content>
            {schedule.status === 'pending' && (
              <Card.Actions style={styles.actions}>
                <Button
                  mode="contained"
                  onPress={() => handleComplete(schedule.id)}
                  buttonColor={COLORS.success}
                >
                  운동 완료
                </Button>
                <Button
                  mode="outlined"
                  onPress={() =>
                    navigation.navigate('Feedback', { schedule })
                  }
                  textColor={COLORS.primary}
                >
                  피드백 작성
                </Button>
              </Card.Actions>
            )}
            {schedule.status === 'completed' && (
              <Card.Actions style={styles.actions}>
                <Button
                  mode="text"
                  onPress={() =>
                    navigation.navigate('Feedback', { schedule })
                  }
                  textColor={COLORS.primary}
                >
                  피드백 보기/작성
                </Button>
              </Card.Actions>
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  calendar: { marginHorizontal: 16, marginTop: 16, borderRadius: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyCard: { marginHorizontal: 20, borderRadius: 12 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, paddingVertical: 12 },
  card: { marginHorizontal: 20, marginBottom: 12, borderRadius: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardDate: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  cardDesc: { color: COLORS.textSecondary, marginTop: 8, fontSize: 14 },
  divider: { marginVertical: 12 },
  exerciseTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  exerciseName: { fontSize: 14, color: COLORS.textPrimary },
  exerciseDetail: { fontSize: 13, color: COLORS.textSecondary },
  actions: { justifyContent: 'flex-end', paddingHorizontal: 8, gap: 8 },
});
