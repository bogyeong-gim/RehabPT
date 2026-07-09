import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA46xc2GdxbqrEbHfeciKWnHaz3QUz9eSk",
  authDomain: "saeneul-e6a42.firebaseapp.com",
  projectId: "saeneul-e6a42",
  storageBucket: "saeneul-e6a42.firebasestorage.app",
  messagingSenderId: "907825459312",
  appId: "1:907825459312:web:11f4145c0ab3c85d9084b5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const accounts = [
  { email: 'patient@test.com', password: 'test1234', name: '김환자', phone: '010-1111-1111', role: 'patient' },
  { email: 'therapist@test.com', password: 'test1234', name: '박치료사', phone: '010-2222-2222', role: 'therapist' },
  { email: 'admin@test.com', password: 'test1234', name: '이관리자', phone: '010-3333-3333', role: 'admin' },
];

async function seed() {
  for (const acc of accounts) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, acc.email, acc.password);
      const uid = cred.user.uid;

      const userData: any = {
        email: acc.email,
        name: acc.name,
        role: acc.role,
        phone: acc.phone,
        createdAt: Timestamp.now(),
      };

      if (acc.role === 'patient') {
        userData.therapistId = '';
      }
      if (acc.role === 'therapist') {
        userData.patients = [];
      }

      await setDoc(doc(db, 'users', uid), userData);
      console.log(`[OK] ${acc.role}: ${acc.email} (${acc.name})`);
    } catch (e: any) {
      console.log(`[SKIP] ${acc.email}: ${e.message}`);
    }
  }
  console.log('\n--- 완료 ---');
  process.exit(0);
}

seed();
