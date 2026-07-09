import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Video } from '../types';

const COLLECTION = 'videos';

const sortByCreatedDesc = (a: Video, b: Video) => {
  const aTime = a.createdAt?.toMillis?.() || 0;
  const bTime = b.createdAt?.toMillis?.() || 0;
  return bTime - aTime;
};

export const createVideo = async (
  title: string,
  description: string,
  category: string,
  uploadedBy: string,
  videoUrl: string = '',
  thumbnailUrl: string = '',
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    title,
    description,
    category,
    uploadedBy,
    videoUrl,
    thumbnailUrl,
    createdAt: Timestamp.now(),
    isPlaceholder: !videoUrl,
  });
  return docRef.id;
};

export const updateVideo = async (
  videoId: string,
  data: Partial<Omit<Video, 'id'>>,
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, videoId), data);
};

export const deleteVideo = async (videoId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, videoId));
};

export const getVideosByCategory = async (category: string): Promise<Video[]> => {
  const q = query(collection(db, COLLECTION), where('category', '==', category));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Video))
    .sort(sortByCreatedDesc);
};

export const getAllVideos = async (): Promise<Video[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Video))
    .sort(sortByCreatedDesc);
};
