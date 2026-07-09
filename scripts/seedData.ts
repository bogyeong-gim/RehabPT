import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore, collection, doc, setDoc, addDoc, getDocs, query, where, Timestamp,
} from 'firebase/firestore';

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

function daysAgo(n: number): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return Timestamp.fromDate(d);
}

function daysLater(n: number): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(10, 0, 0, 0);
  return Timestamp.fromDate(d);
}

function today(): Timestamp {
  const d = new Date();
  d.setHours(14, 0, 0, 0);
  return Timestamp.fromDate(d);
}

function minutesAgo(n: number): Timestamp {
  return Timestamp.fromDate(new Date(Date.now() - n * 60000));
}

async function seed() {
  // 1. 유저 ID 가져오기
  console.log('유저 정보 조회 중...');
  const usersSnap = await getDocs(collection(db, 'users'));
  const users: Record<string, { id: string; name: string; role: string }> = {};
  usersSnap.forEach((doc) => {
    const data = doc.data();
    users[data.role] = { id: doc.id, name: data.name, role: data.role };
  });

  const patient = users['patient'];
  const therapist = users['therapist'];

  if (!patient || !therapist) {
    console.log('환자/치료사 계정이 없습니다. seedTestAccounts.ts를 먼저 실행하세요.');
    process.exit(1);
  }

  console.log(`환자: ${patient.name} (${patient.id})`);
  console.log(`치료사: ${therapist.name} (${therapist.id})`);

  // 2. 환자에게 치료사 배정
  console.log('\n치료사 배정 중...');
  await setDoc(doc(db, 'users', patient.id), { therapistId: therapist.id }, { merge: true });
  await setDoc(doc(db, 'users', therapist.id), { patients: [patient.id] }, { merge: true });
  console.log('[OK] 김환자 → 박치료사 배정 완료');

  // 3. 스케줄 생성 (과거 완료 + 오늘 + 미래 예정)
  console.log('\n스케줄 생성 중...');
  const schedules = [
    {
      patientId: patient.id, therapistId: therapist.id,
      title: '어깨 재활 운동', description: '회전근개 파열 후 재활 1단계 - 관절 가동범위 회복',
      date: daysAgo(5), status: 'completed',
      exercises: [
        { name: '벽 밀기 스트레칭', sets: 3, reps: 15 },
        { name: '진자 운동', sets: 3, reps: 20 },
        { name: '수건 스트레칭', sets: 3, reps: 10 },
      ],
    },
    {
      patientId: patient.id, therapistId: therapist.id,
      title: '어깨 근력 강화', description: '회전근개 재활 2단계 - 근력 회복 운동',
      date: daysAgo(3), status: 'completed',
      exercises: [
        { name: '세라밴드 외회전', sets: 3, reps: 12 },
        { name: '세라밴드 내회전', sets: 3, reps: 12 },
        { name: '사이드 레터럴 레이즈(1kg)', sets: 3, reps: 10 },
      ],
    },
    {
      patientId: patient.id, therapistId: therapist.id,
      title: '무릎 안정화 운동', description: 'ACL 수술 후 무릎 안정성 강화',
      date: daysAgo(1), status: 'missed',
      exercises: [
        { name: '스트레이트 레그 레이즈', sets: 4, reps: 15 },
        { name: '미니 스쿼트', sets: 3, reps: 10 },
        { name: '밸런스 보드 서기', sets: 3, reps: 1, duration: 30 },
      ],
    },
    {
      patientId: patient.id, therapistId: therapist.id,
      title: '오늘의 재활 운동', description: '어깨 + 코어 통합 운동 프로그램',
      date: today(), status: 'pending',
      exercises: [
        { name: '플랭크', sets: 3, reps: 1, duration: 30 },
        { name: '버드독', sets: 3, reps: 12 },
        { name: '어깨 프레스(2kg)', sets: 3, reps: 10 },
        { name: '페이스 풀', sets: 3, reps: 15 },
      ],
    },
    {
      patientId: patient.id, therapistId: therapist.id,
      title: '하체 근력 운동', description: '무릎 주변 근력 강화 집중 프로그램',
      date: daysLater(1), status: 'pending',
      exercises: [
        { name: '레그 프레스(가벼운 무게)', sets: 4, reps: 12 },
        { name: '카프 레이즈', sets: 3, reps: 15 },
        { name: '월 시트', sets: 3, reps: 1, duration: 20 },
      ],
    },
    {
      patientId: patient.id, therapistId: therapist.id,
      title: '유연성 및 스트레칭', description: '전신 유연성 향상을 위한 스트레칭 세션',
      date: daysLater(3), status: 'pending',
      exercises: [
        { name: '햄스트링 스트레칭', sets: 3, reps: 1, duration: 30 },
        { name: '고관절 스트레칭', sets: 3, reps: 1, duration: 30 },
        { name: '흉추 회전 스트레칭', sets: 3, reps: 10 },
        { name: '종아리 스트레칭', sets: 3, reps: 1, duration: 20 },
      ],
    },
    {
      patientId: patient.id, therapistId: therapist.id,
      title: '어깨 재활 3단계', description: '기능적 움직임 회복 - 일상생활 동작 훈련',
      date: daysLater(5), status: 'pending',
      exercises: [
        { name: '오버헤드 프레스(가벼운 무게)', sets: 3, reps: 10 },
        { name: 'PNF 패턴 운동', sets: 3, reps: 12 },
        { name: '푸시업(무릎)', sets: 3, reps: 8 },
      ],
    },
  ];

  const scheduleIds: string[] = [];
  for (const s of schedules) {
    const ref = await addDoc(collection(db, 'schedules'), {
      ...s,
      createdAt: Timestamp.now(),
    });
    scheduleIds.push(ref.id);
    console.log(`[OK] 스케줄: ${s.title} (${s.status})`);
  }

  // 4. 피드백 생성 (완료된 스케줄에 대해)
  console.log('\n피드백 생성 중...');
  const feedbacks = [
    {
      scheduleId: scheduleIds[0],
      patientId: patient.id, therapistId: therapist.id,
      painLevel: 4, difficulty: 2,
      memo: '벽 밀기할 때 약간 뻐근한 느낌이 있었지만 참을 만했습니다. 진자 운동은 편하게 할 수 있었어요.',
      completedExercises: ['벽 밀기 스트레칭', '진자 운동', '수건 스트레칭'],
      therapistComment: '잘 하셨습니다! 통증이 4 정도면 양호합니다. 다음에는 반복 횟수를 조금 늘려보겠습니다. 수건 스트레칭할 때 무리하지 마세요.',
      createdAt: daysAgo(5),
    },
    {
      scheduleId: scheduleIds[1],
      patientId: patient.id, therapistId: therapist.id,
      painLevel: 6, difficulty: 4,
      memo: '세라밴드 외회전이 생각보다 힘들었습니다. 레터럴 레이즈는 1kg도 무겁게 느껴졌어요. 운동 후 약간 부기가 있었습니다.',
      completedExercises: ['세라밴드 외회전', '세라밴드 내회전'],
      therapistComment: '통증이 6까지 올라갔군요. 레터럴 레이즈는 다음에 0.5kg으로 낮추겠습니다. 부기가 있으면 아이싱 20분 해주세요. 무리하지 마시고 다음 내원 때 다시 확인하겠습니다.',
      createdAt: daysAgo(3),
    },
  ];

  for (const fb of feedbacks) {
    await addDoc(collection(db, 'feedbacks'), fb);
    console.log(`[OK] 피드백: 통증 ${fb.painLevel}/10, 난이도 ${fb.difficulty}/5`);
  }

  // 5. 채팅방 및 메시지 생성
  console.log('\n채팅 데이터 생성 중...');
  const chatRoomRef = await addDoc(collection(db, 'chatRooms'), {
    participants: [patient.id, therapist.id],
    participantNames: { [patient.id]: patient.name, [therapist.id]: therapist.name },
    lastMessage: '네 감사합니다! 내일 운동 열심히 해볼게요.',
    lastMessageAt: minutesAgo(5),
    unreadCount: { [patient.id]: 0, [therapist.id]: 1 },
  });
  console.log(`[OK] 채팅방 생성: ${patient.name} ↔ ${therapist.name}`);

  const messages = [
    { senderId: therapist.id, text: '김환자님, 어제 운동은 잘 하셨나요?', type: 'text', createdAt: minutesAgo(120), read: true },
    { senderId: patient.id, text: '네 치료사님, 어깨 운동은 잘 했는데 세라밴드가 좀 힘들었어요', type: 'text', createdAt: minutesAgo(115), read: true },
    { senderId: therapist.id, text: '피드백 확인했습니다. 통증이 좀 있으셨군요. 다음부터는 강도를 낮춰서 진행하겠습니다.', type: 'text', createdAt: minutesAgo(110), read: true },
    { senderId: patient.id, text: '감사합니다. 그리고 어제 무릎 운동은 시간이 없어서 못했어요 ㅠㅠ', type: 'text', createdAt: minutesAgo(60), read: true },
    { senderId: therapist.id, text: '괜찮습니다. 무리하시면 안 돼요. 오늘 스케줄에 어깨+코어 운동 넣어뒀으니 확인해주세요!', type: 'text', createdAt: minutesAgo(55), read: true },
    { senderId: therapist.id, text: '플랭크는 처음이시니까 30초씩 천천히 하시고, 힘들면 무릎 대고 하셔도 됩니다.', type: 'text', createdAt: minutesAgo(50), read: true },
    { senderId: patient.id, text: '네 알겠습니다! 혹시 운동할 때 호흡은 어떻게 해야 하나요?', type: 'text', createdAt: minutesAgo(30), read: true },
    { senderId: therapist.id, text: '힘줄 때 내쉬고, 이완할 때 들이마시세요. 플랭크는 자연스럽게 호흡 유지하시면 됩니다. 절대 숨 참지 마세요!', type: 'text', createdAt: minutesAgo(25), read: true },
    { senderId: patient.id, text: '네 감사합니다! 내일 운동 열심히 해볼게요.', type: 'text', createdAt: minutesAgo(5), read: false },
  ];

  for (const msg of messages) {
    await addDoc(collection(db, 'chatRooms', chatRoomRef.id, 'messages'), msg);
  }
  console.log(`[OK] 메시지 ${messages.length}개 생성`);

  // 6. 운동 영상 데이터 (플레이스홀더)
  console.log('\n운동 영상 데이터 생성 중...');
  const videos = [
    { title: '어깨 회전근개 스트레칭', description: '회전근개 파열 환자를 위한 기초 스트레칭 동작입니다. 벽을 이용한 안전한 스트레칭 방법을 알려드립니다.', category: '어깨', uploadedBy: therapist.id, videoUrl: '', thumbnailUrl: '', isPlaceholder: true },
    { title: '세라밴드 어깨 운동', description: '세라밴드를 이용한 어깨 내회전/외회전 운동법입니다. 올바른 자세와 주의사항을 확인하세요.', category: '어깨', uploadedBy: therapist.id, videoUrl: '', thumbnailUrl: '', isPlaceholder: true },
    { title: 'ACL 수술 후 무릎 재활', description: '전방십자인대 수술 후 초기 재활 운동 가이드입니다. 단계별로 안전하게 운동하는 방법을 보여드립니다.', category: '무릎', uploadedBy: therapist.id, videoUrl: '', thumbnailUrl: '', isPlaceholder: true },
    { title: '코어 안정화 운동 기초', description: '플랭크, 버드독 등 코어 안정화 운동의 기본 동작을 배워봅니다. 허리 통증 예방에 효과적입니다.', category: '허리', uploadedBy: therapist.id, videoUrl: '', thumbnailUrl: '', isPlaceholder: true },
    { title: '무릎 주변 근력 강화', description: '대퇴사두근과 햄스트링 강화 운동입니다. 무릎 안정성 향상에 도움이 됩니다.', category: '무릎', uploadedBy: therapist.id, videoUrl: '', thumbnailUrl: '', isPlaceholder: true },
    { title: '목 디스크 예방 스트레칭', description: '거북목, 일자목 교정을 위한 스트레칭입니다. 사무직 근로자에게 추천합니다.', category: '목', uploadedBy: therapist.id, videoUrl: '', thumbnailUrl: '', isPlaceholder: true },
    { title: '발목 염좌 재활 운동', description: '발목 인대 손상 후 단계별 재활 프로그램입니다. 밸런스 훈련을 포함합니다.', category: '발목', uploadedBy: therapist.id, videoUrl: '', thumbnailUrl: '', isPlaceholder: true },
    { title: '전신 스트레칭 루틴', description: '운동 전후 전신 스트레칭 루틴입니다. 재활 운동 시작 전에 꼭 수행해주세요.', category: '전신', uploadedBy: therapist.id, videoUrl: '', thumbnailUrl: '', isPlaceholder: true },
  ];

  for (const v of videos) {
    await addDoc(collection(db, 'videos'), { ...v, createdAt: Timestamp.now() });
    console.log(`[OK] 영상: ${v.title} (${v.category})`);
  }

  console.log('\n========================================');
  console.log('  모든 가상 데이터 생성 완료!');
  console.log('========================================');
  console.log(`  스케줄: ${schedules.length}개`);
  console.log(`  피드백: ${feedbacks.length}개`);
  console.log(`  채팅 메시지: ${messages.length}개`);
  console.log(`  운동 영상: ${videos.length}개`);
  console.log('========================================\n');

  process.exit(0);
}

seed().catch((e) => {
  console.error('에러:', e.message);
  process.exit(1);
});
