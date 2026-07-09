import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Text, Avatar, Badge } from 'react-native-paper';
import { COLORS } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { subscribeToChatRooms } from '../../services/chatService';
import { getRelativeTime } from '../../utils/helpers';
import { ChatRoom } from '../../types';

export default function ChatListScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const { chatRooms, setChatRooms } = useChatStore();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToChatRooms(user.id, setChatRooms);
    return unsubscribe;
  }, [user]);

  const getOtherParticipant = (room: ChatRoom) => {
    if (!user) return { id: '', name: '' };
    const otherId = room.participants.find((p) => p !== user.id) || '';
    return { id: otherId, name: room.participantNames[otherId] || '알 수 없음' };
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => {
    const other = getOtherParticipant(item);
    const unread = user ? item.unreadCount[user.id] || 0 : 0;

    return (
      <Card
        style={styles.card}
        onPress={() =>
          navigation.navigate('ChatRoom', {
            roomId: item.id,
            otherName: other.name,
            otherId: other.id,
          })
        }
      >
        <Card.Content style={styles.cardContent}>
          <Avatar.Text
            size={48}
            label={other.name.charAt(0)}
            style={{ backgroundColor: COLORS.primary }}
          />
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{other.name}</Text>
              <Text style={styles.time}>
                {item.lastMessageAt ? getRelativeTime(item.lastMessageAt) : ''}
              </Text>
            </View>
            <View style={styles.messageRow}>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage || '대화를 시작해보세요'}
              </Text>
              {unread > 0 && (
                <Badge style={styles.badge}>{unread}</Badge>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>메시지</Title>

      {chatRooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>대화가 없습니다.</Text>
          <Text style={styles.emptySubtext}>
            담당 치료사 또는 환자와 대화를 시작해보세요.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          renderItem={renderChatRoom}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 16, marginBottom: 12 },
  list: { paddingHorizontal: 16 },
  card: { marginBottom: 8, borderRadius: 12 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  time: { fontSize: 12, color: COLORS.textLight },
  messageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  lastMessage: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  badge: { backgroundColor: COLORS.danger, fontSize: 11 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
  emptySubtext: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
});
