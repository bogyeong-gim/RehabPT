import { Alert, Platform } from 'react-native';
import { Timestamp } from 'firebase/firestore';

/**
 * 크로스 플랫폼 확인 다이얼로그.
 * react-native-web에서는 Alert.alert의 버튼/onPress가 동작하지 않으므로
 * 웹에서는 window.confirm으로, 네이티브에서는 Alert.alert으로 처리한다.
 * 사용자가 확인을 누르면 onConfirm이 실행된다.
 */
export const confirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string = '확인',
  destructive: boolean = false,
): void => {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: '취소', style: 'cancel' },
    {
      text: confirmText,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
};

/**
 * 크로스 플랫폼 알림 다이얼로그.
 * 웹에서는 window.alert 이후, 네이티브에서는 확인 버튼의 onPress로 onClose를 실행한다.
 * 정보성 알림을 띄운 뒤 화면 전환 등 후속 동작이 필요할 때 사용한다.
 */
export const notifyDialog = (
  title: string,
  message: string,
  onClose?: () => void,
): void => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    onClose?.();
    return;
  }
  Alert.alert(title, message, [{ text: '확인', onPress: onClose }]);
};

export const formatDate = (timestamp: Timestamp): string => {
  const date = timestamp.toDate();
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

export const formatTime = (timestamp: Timestamp): string => {
  const date = timestamp.toDate();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${period} ${displayHours}:${minutes}`;
};

export const formatDateTime = (timestamp: Timestamp): string => {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
};

export const getRelativeTime = (timestamp: Timestamp): string => {
  const now = new Date();
  const date = timestamp.toDate();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return formatDate(timestamp);
};

export const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'patient': return '환자';
    case 'therapist': return '운동치료사';
    case 'admin': return '관리자';
    default: return '';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending': return '예정';
    case 'completed': return '완료';
    case 'missed': return '미수행';
    default: return '';
  }
};

/** 해당 날짜가 속한 주의 월요일 00:00 을 반환 */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0(일)~6(토)
  const diff = day === 0 ? -6 : 1 - day; // 월요일 기준
  d.setDate(d.getDate() + diff);
  return d;
};

/** 주 시작일로부터 7일(월~일) 배열 */
export const getWeekDays = (weekStart: Date): Date[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

export const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

/** 24시간 정수를 "오전 9시" / "오후 1시" 형태로 */
export const formatHour = (hour: number): string => {
  const period = hour < 12 ? '오전' : '오후';
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${period} ${h}시`;
};

/** 두 날짜가 같은 '연-월-일' 인지 */
export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return '#D99A4E';
    case 'completed': return '#3AA76D';
    case 'missed': return '#D2664F';
    default: return '#5F6B68';
  }
};
