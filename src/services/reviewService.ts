import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Review, ReviewAnswer } from '../types';

const COLLECTION = 'reviews';

const sortByCreatedDesc = (a: Review, b: Review) => {
  const aTime = a.createdAt?.toMillis?.() || 0;
  const bTime = b.createdAt?.toMillis?.() || 0;
  return bTime - aTime;
};

export const createReview = async (
  patientId: string,
  therapistId: string,
  answers: ReviewAnswer[],
  overallRating: number,
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    patientId,
    therapistId,
    answers,
    overallRating,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getPatientReviews = async (patientId: string): Promise<Review[]> => {
  const q = query(collection(db, COLLECTION), where('patientId', '==', patientId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Review))
    .sort(sortByCreatedDesc);
};

export const getTherapistReviews = async (therapistId: string): Promise<Review[]> => {
  const q = query(collection(db, COLLECTION), where('therapistId', '==', therapistId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Review))
    .sort(sortByCreatedDesc);
};
