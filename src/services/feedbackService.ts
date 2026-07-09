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

export const getFeedbackBySchedule = async (scheduleId: string): Promise<Feedback | null> => {
  const q = query(collection(db, COLLECTION), where('scheduleId', '==', scheduleId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const feedbackDoc = snapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
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
