import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { ChatRoom, Message } from '../types';

export const getOrCreateChatRoom = async (
  userId1: string,
  userId2: string,
  userName1: string,
  userName2: string,
): Promise<string> => {
  const q = query(
    collection(db, 'chatRooms'),
    where('participants', 'array-contains', userId1),
  );
  const snapshot = await getDocs(q);

  const existingRoom = snapshot.docs.find((d) => {
    const data = d.data();
    return data.participants.includes(userId2);
  });

  if (existingRoom) return existingRoom.id;

  const roomRef = await addDoc(collection(db, 'chatRooms'), {
    participants: [userId1, userId2],
    participantNames: { [userId1]: userName1, [userId2]: userName2 },
    lastMessage: '',
    lastMessageAt: Timestamp.now(),
    unreadCount: { [userId1]: 0, [userId2]: 0 },
  });

  return roomRef.id;
};

export const sendMessage = async (
  roomId: string,
  senderId: string,
  receiverId: string,
  text: string,
  type: 'text' | 'image' | 'feedback' = 'text',
): Promise<void> => {
  await addDoc(collection(db, 'chatRooms', roomId, 'messages'), {
    senderId,
    text,
    type,
    createdAt: Timestamp.now(),
    read: false,
  });

  await updateDoc(doc(db, 'chatRooms', roomId), {
    lastMessage: text,
    lastMessageAt: Timestamp.now(),
    [`unreadCount.${receiverId}`]: increment(1),
  });
};

export const markMessagesAsRead = async (
  roomId: string,
  userId: string,
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'chatRooms', roomId), {
      [`unreadCount.${userId}`]: 0,
    });
  } catch (e) {
    console.log('읽음 처리 실패:', e);
  }
};

export const subscribeToChatRooms = (
  userId: string,
  callback: (rooms: ChatRoom[]) => void,
) => {
  // 인덱스 없이 동작하도록 where만 사용, 클라이언트 정렬
  const q = query(
    collection(db, 'chatRooms'),
    where('participants', 'array-contains', userId),
  );
  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as ChatRoom))
      .sort((a, b) => {
        const aTime = a.lastMessageAt?.toMillis?.() || 0;
        const bTime = b.lastMessageAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
    callback(rooms);
  });
};

export const subscribeToMessages = (
  roomId: string,
  callback: (messages: Message[]) => void,
) => {
  // messages 서브컬렉션은 단일 필드 정렬이라 인덱스 불필요
  const q = query(collection(db, 'chatRooms', roomId, 'messages'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Message))
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return aTime - bTime;
      });
    callback(messages);
  });
};
