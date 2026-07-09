import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import {
  Card, Title, Text, Searchbar, Avatar, SegmentedButtons, Button, Portal, Modal, Chip,
} from 'react-native-paper';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { COLORS } from '../../utils/constants';
import { User } from '../../types';
import { getRoleLabel } from '../../utils/helpers';

export default function UserManageScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchModal, setMatchModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [therapists, setTherapists] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as User));
      setUsers(data);
      setTherapists(data.filter((u) => u.role === 'therapist'));
    } catch {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filter !== 'all' && u.role !== filter) return false;
    if (searchQuery) {
      return (
        u.name.includes(searchQuery) ||
        u.email.includes(searchQuery) ||
        u.phone.includes(searchQuery)
      );
    }
    return true;
  });

  const openMatchModal = (patient: User) => {
    setSelectedPatient(patient);
    setMatchModal(true);
  };

  const handleMatch = async (therapistId: string) => {
    if (!selectedPatient) return;
    try {
      await updateDoc(doc(db, 'users', selectedPatient.id), { therapistId });
      Alert.alert('완료', '치료사가 배정되었습니다.');
      setMatchModal(false);
      loadUsers();
    } catch {
      Alert.alert('오류', '배정에 실패했습니다.');
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Text
          size={44}
          label={item.name.charAt(0)}
          style={{
            backgroundColor: item.role === 'therapist' ? COLORS.success : COLORS.primary,
          }}
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <Chip style={styles.roleChip} textStyle={{ fontSize: 11 }}>
              {getRoleLabel(item.role)}
            </Chip>
          </View>
          <Text style={styles.detail}>{item.email}</Text>
          <Text style={styles.detail}>{item.phone}</Text>
          {item.role === 'patient' && (
            <Text style={styles.therapistInfo}>
              담당 치료사: {item.therapistId
                ? therapists.find((t) => t.id === item.therapistId)?.name || '알 수 없음'
                : '미배정'}
            </Text>
          )}
        </View>
      </Card.Content>
      {item.role === 'patient' && (
        <Card.Actions>
          <Button
            mode="text"
            onPress={() => openMatchModal(item)}
            textColor={COLORS.primary}
          >
            치료사 배정
          </Button>
        </Card.Actions>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <Title style={styles.title}>사용자 관리</Title>

      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        buttons={[
          { value: 'all', label: '전체' },
          { value: 'patient', label: '환자' },
          { value: 'therapist', label: '치료사' },
        ]}
        style={styles.segment}
      />

      <Searchbar
        placeholder="사용자 검색..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <Portal>
        <Modal
          visible={matchModal}
          onDismiss={() => setMatchModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>치료사 배정</Title>
          <Text style={styles.modalSubtitle}>
            {selectedPatient?.name}님에게 배정할 치료사를 선택하세요.
          </Text>

          {therapists.map((t) => (
            <Card
              key={t.id}
              style={styles.therapistCard}
              onPress={() => handleMatch(t.id)}
            >
              <Card.Content style={styles.therapistContent}>
                <Avatar.Text size={36} label={t.name.charAt(0)} style={{ backgroundColor: COLORS.success }} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.therapistName}>{t.name}</Text>
                  <Text style={styles.therapistEmail}>{t.email}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 16 },
  segment: { marginHorizontal: 20, marginVertical: 12 },
  searchbar: { marginHorizontal: 20, marginBottom: 12, borderRadius: 12, elevation: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { marginBottom: 10, borderRadius: 12 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  info: { marginLeft: 14, flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '600' },
  roleChip: { height: 24 },
  detail: { fontSize: 13, color: COLORS.textSecondary },
  therapistInfo: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  modal: {
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: '60%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  therapistCard: { marginBottom: 8, borderRadius: 10 },
  therapistContent: { flexDirection: 'row', alignItems: 'center' },
  therapistName: { fontSize: 15, fontWeight: '600' },
  therapistEmail: { fontSize: 13, color: COLORS.textSecondary },
});
