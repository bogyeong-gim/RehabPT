import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { TreatmentLog } from '../types';

const COLLECTION = 'logs';

export const createLog = async (
  therapistId: string,
  therapistName: string,
  patientId: string,
  patientName: string,
  sessionNumber: number,
  sessionDate: Date,
  content: string,
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    therapistId,
    therapistName,
    patientId,
    patientName,
    sessionNumber,
    sessionDate: Timestamp.fromDate(sessionDate),
    content,
    likedBy: [],
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const toggleLike = async (
  logId: string,
  userId: string,
  liked: boolean,
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, logId), {
    likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
  });
};

export const deleteLog = async (logId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, logId));
};

const sortByCreatedDesc = (a: TreatmentLog, b: TreatmentLog) => {
  const aTime = a.createdAt?.toMillis?.() || 0;
  const bTime = b.createdAt?.toMillis?.() || 0;
  return bTime - aTime;
};

export const subscribeToLogs = (
  userId: string,
  role: 'patient' | 'therapist',
  callback: (logs: TreatmentLog[]) => void,
) => {
  const fieldName = role === 'patient' ? 'patientId' : 'therapistId';
  const q = query(collection(db, COLLECTION), where(fieldName, '==', userId));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as TreatmentLog))
      .sort(sortByCreatedDesc);
    callback(logs);
  });
};
