import { Timestamp } from 'firebase/firestore';

export type UserRole = 'patient' | 'therapist' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  createdAt: Timestamp;
  therapistId?: string;
  patients?: string[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration?: number; // 초 단위
}

export type ScheduleStatus = 'pending' | 'completed' | 'missed';

export interface Schedule {
  id: string;
  patientId: string;
  therapistId: string;
  title: string;
  description: string;
  date: Timestamp;
  status: ScheduleStatus;
  exercises: Exercise[];
  createdAt: Timestamp;
}

export interface Feedback {
  id: string;
  scheduleId: string;
  patientId: string;
  therapistId: string;
  painLevel: number; // 1-10
  difficulty: number; // 1-5
  memo: string;
  completedExercises: string[];
  therapistComment?: string;
  createdAt: Timestamp;
}

export interface ReviewAnswer {
  question: string;
  rating: number; // 1-5
  tags: string[];
}

export interface Review {
  id: string;
  patientId: string;
  therapistId: string;
  answers: ReviewAnswer[];
  overallRating: number; // 평균 별점
  createdAt: Timestamp;
}

export interface TreatmentLog {
  id: string;
  therapistId: string;
  therapistName: string;
  patientId: string;
  patientName: string;
  sessionNumber: number; // 회차
  sessionDate: Timestamp; // 치료 진행 날짜
  content: string;
  likedBy: string[];
  createdAt: Timestamp;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: Timestamp;
  unreadCount: Record<string, number>;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'feedback';
  createdAt: Timestamp;
  read: boolean;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  videoUrl: string;
  uploadedBy: string;
  createdAt: Timestamp;
  isPlaceholder: boolean;
}
