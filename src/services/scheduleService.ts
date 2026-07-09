import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Schedule, Exercise, ScheduleStatus } from '../types';

const COLLECTION = 'schedules';

const sortByDateDesc = (a: Schedule, b: Schedule) => {
  return b.date.toMillis() - a.date.toMillis();
};

export const createSchedule = async (
  patientId: string,
  therapistId: string,
  title: string,
  description: string,
  date: Date,
  exercises: Exercise[],
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    patientId,
    therapistId,
    title,
    description,
    date: Timestamp.fromDate(date),
    status: 'pending' as ScheduleStatus,
    exercises,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateSchedule = async (
  scheduleId: string,
  data: Partial<Omit<Schedule, 'id'>>,
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, scheduleId), data);
};

export const updateScheduleStatus = async (
  scheduleId: string,
  status: ScheduleStatus,
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, scheduleId), { status });
};

export const deleteSchedule = async (scheduleId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, scheduleId));
};

export const getPatientSchedules = async (patientId: string): Promise<Schedule[]> => {
  const q = query(collection(db, COLLECTION), where('patientId', '==', patientId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Schedule))
    .sort(sortByDateDesc);
};

export const getTherapistSchedules = async (therapistId: string): Promise<Schedule[]> => {
  const q = query(collection(db, COLLECTION), where('therapistId', '==', therapistId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Schedule))
    .sort(sortByDateDesc);
};

export const subscribeToSchedules = (
  userId: string,
  role: 'patient' | 'therapist',
  callback: (schedules: Schedule[]) => void,
) => {
  const fieldName = role === 'patient' ? 'patientId' : 'therapistId';
  const q = query(collection(db, COLLECTION), where(fieldName, '==', userId));
  return onSnapshot(q, (snapshot) => {
    const schedules = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Schedule))
      .sort(sortByDateDesc);
    callback(schedules);
  });
};
