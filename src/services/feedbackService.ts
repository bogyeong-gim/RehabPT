import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Feedback } from '../types';

const COLLECTION = 'feedbacks';

const sortByCreatedDesc = (a: Feedback, b: Feedback) => {
  const aTime = a.createdAt?.toMillis?.() || 0;
  const bTime = b.createdAt?.toMillis?.() || 0;
  return bTime - aTime;
};

export const createFeedback = async (
  scheduleId: string,
  patientId: string,
  therapistId: string,
  painLevel: number,
  difficulty: number,
  memo: string,
  completedExercises: string[],
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    scheduleId,
    patientId,
    therapistId,
    painLevel,
    difficulty,
    memo,
    completedExercises,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const addTherapistComment = async (
  feedbackId: string,
  comment: string,
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, feedbackId), {
    therapistComment: comment,
  });
};

export const getFeedbackBySchedule = async (
  scheduleId: string,
  patientId: string,
): Promise<Feedback | null> => {
  // 보안 규칙과 맞추기 위해 patientId(소유자)로 스코프 후 scheduleId를 클라이언트에서 매칭
  const q = query(collection(db, COLLECTION), where('patientId', '==', patientId));
  const snapshot = await getDocs(q);
  const match = snapshot.docs.find((d) => d.data().scheduleId === scheduleId);
  return match ? ({ id: match.id, ...match.data() } as Feedback) : null;
};

export const getPatientFeedbacks = async (patientId: string): Promise<Feedback[]> => {
  const q = query(collection(db, COLLECTION), where('patientId', '==', patientId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Feedback))
    .sort(sortByCreatedDesc);
};

export const getTherapistFeedbacks = async (therapistId: string): Promise<Feedback[]> => {
  const q = query(collection(db, COLLECTION), where('therapistId', '==', therapistId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Feedback))
    .sort(sortByCreatedDesc);
};
