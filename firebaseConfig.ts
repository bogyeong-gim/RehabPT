import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Firebase 콘솔에서 실제 프로젝트 설정값으로 교체하세요
// https://console.firebase.google.com/ 에서 프로젝트 생성 후 설정값을 복사하세요
const firebaseConfig = {
  apiKey: "AIzaSyA46xc2GdxbqrEbHfeciKWnHaz3QUz9eSk",
  authDomain: "saeneul-e6a42.firebaseapp.com",
  projectId: "saeneul-e6a42",
  storageBucket: "saeneul-e6a42.firebasestorage.app",  messagingSenderId: "YOUR_SENDER_ID",
  appId: "1:907825459312:web:11f4145c0ab3c85d9084b5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
