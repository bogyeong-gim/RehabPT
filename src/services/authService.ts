import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { User, UserRole } from '../types';

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

export const getCurrentUser = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
};

export const subscribeToAuthState = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
