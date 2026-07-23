import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { User, UserRole } from '../types';

/** 이메일로 사용자 조회 (회원 등록용) */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const q = query(collection(db, 'users'), where('email', '==', email.trim()));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as User;
};

/** 환자를 담당 치료사로 배정 */
export const assignPatientToTherapist = async (
  patientId: string,
  therapistId: string,
): Promise<void> => {
  await updateDoc(doc(db, 'users', patientId), { therapistId });
};

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  role: UserRole,
): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const userData: Omit<User, 'id'> = {
    email,
    name,
    role,
    phone,
    createdAt: Timestamp.now(),
    ...(role === 'patient' ? { therapistId: '' } : {}),
    ...(role === 'therapist' ? { patients: [] } : {}),
  };

  await setDoc(doc(db, 'users', credential.user.uid), userData);
  return { id: credential.user.uid, ...userData };
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

  if (!userDoc.exists()) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }

  return { id: userDoc.id, ...userDoc.data() } as User;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email.trim());
};

/** 본인 프로필(이름·전화) 수정 */
export const updateProfile = async (
  userId: string,
  data: { name?: string; phone?: string },
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), data);
};

export const getCurrentUser = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
};

export const subscribeToAuthState = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
