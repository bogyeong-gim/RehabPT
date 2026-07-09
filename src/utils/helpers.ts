import { Timestamp } from 'firebase/firestore';

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

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return '#FFC107';
    case 'completed': return '#28A745';
    case 'missed': return '#DC3545';
    default: return '#6C757D';
  }
};
