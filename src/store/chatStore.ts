import { create } from 'zustand';
import { ChatRoom, Message } from '../types';

interface ChatState {
  chatRooms: ChatRoom[];
  currentMessages: Message[];
  isLoading: boolean;
  setChatRooms: (rooms: ChatRoom[]) => void;
  setCurrentMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chatRooms: [],
  currentMessages: [],
  isLoading: false,
  setChatRooms: (chatRooms) => set({ chatRooms }),
  setCurrentMessages: (currentMessages) => set({ currentMessages }),
  setLoading: (isLoading) => set({ isLoading }),
}));
