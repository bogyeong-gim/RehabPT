import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Text, Searchbar, Avatar, Chip } from 'react-native-paper';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { COLORS } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';

export default function PatientListScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const [patients, setPatients] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'patient'),
        where('therapistId', '==', user.id),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
      setPatients(data);
    } catch {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = searchQuery
    ? patients.filter(
        (p) =>
          p.name.includes(searchQuery) ||
          p.email.includes(searchQuery) ||
          p.phone.includes(searchQuery),
      )
    : patients;

  const renderPatient = ({ item }: { item: User }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('ScheduleManage', { patientId: item.id, patientName: item.name })}
    >
      <Card.Content style={styles.cardContent}>
        <Avatar.Text size={44} label={item.name.charAt(0)} style={{ backgroundColor: COLORS.primary }} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.detail}>{item.phone}</Text>
          <Text style={styles.detail}>{item.email}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>담당 환자</Title>
        <Chip style={styles.countChip}>{patients.length}명</Chip>
      </View>

      <Searchbar
        placeholder="환자 검색..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {loading ? (
        <Text style={styles.emptyText}>로딩 중...</Text>
      ) : filteredPatients.length === 0 ? (
        <Text style={styles.emptyText}>
          {searchQuery ? '검색 결과가 없습니다.' : '담당 환자가 없습니다.'}
        </Text>
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderPatient}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  countChip: { backgroundColor: COLORS.primary },
  searchbar: { margin: 16, borderRadius: 12, elevation: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { marginBottom: 10, borderRadius: 12 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  info: { marginLeft: 14, flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  detail: { fontSize: 13, color: COLORS.textSecondary },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40 },
});
