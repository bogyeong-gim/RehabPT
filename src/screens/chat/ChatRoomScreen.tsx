import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { COLORS } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { sendMessage, subscribeToMessages, markMessagesAsRead } from '../../services/chatService';
import { formatTime } from '../../utils/helpers';
import { Message } from '../../types';

export default function ChatRoomScreen({ route }: any) {
  const { roomId, otherName, otherId } = route.params;
  const user = useAuthStore((s) => s.user);
  const { currentMessages, setCurrentMessages } = useChatStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(roomId, setCurrentMessages);
    if (user) {
      markMessagesAsRead(roomId, user.id);
    }
    return () => {
      unsubscribe();
      setCurrentMessages([]);
    };
  }, [roomId]);

  useEffect(() => {
    if (user) {
      markMessagesAsRead(roomId, user.id);
    }
  }, [currentMessages.length]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    const messageText = text.trim();
    setText('');
    setSending(true);
    try {
      await sendMessage(roomId, user.id, otherId, messageText);
    } catch (e) {
      setText(messageText);
      Alert.alert('전송 실패', '메시지를 전송하지 못했습니다. 다시 시도해주세요.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        {!isMe && <Text style={styles.senderName}>{otherName}</Text>}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe && styles.myMessageText]}>
            {item.text}
          </Text>
        </View>
        <Text style={[styles.timeText, isMe && styles.myTimeText]}>
          {item.createdAt ? formatTime(item.createdAt) : ''}
          {isMe && item.read ? ' 읽음' : ''}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={currentMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="메시지를 입력하세요..."
          mode="outlined"
          style={styles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleSend}
              disabled={sending || !text.trim()}
              color={text.trim() ? COLORS.primary : COLORS.textLight}
            />
          }
          onSubmitEditing={handleSend}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  messageList: { padding: 16, paddingBottom: 8 },
  messageContainer: { marginBottom: 12, maxWidth: '80%' },
  myMessage: { alignSelf: 'flex-end' },
  otherMessage: { alignSelf: 'flex-start' },
  senderName: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2, marginLeft: 4 },
  bubble: { padding: 12, borderRadius: 16 },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  messageText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  myMessageText: { color: COLORS.white },
  timeText: { fontSize: 11, color: COLORS.textLight, marginTop: 2, marginLeft: 4 },
  myTimeText: { textAlign: 'right', marginRight: 4 },
  inputContainer: {
    padding: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: { backgroundColor: COLORS.white },
});
