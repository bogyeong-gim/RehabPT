import { Platform } from 'react-native';

/**
 * 새늘(RehabPT) 디자인 시스템 — 헬스케어 팔레트
 * 카밍 틸 + 세이지 + 뉴트럴. 낮은 채도로 의료적 신뢰감과 편안함을 전달한다.
 * COLORS 키는 하위호환을 위해 유지하되 값만 새 팔레트로 매핑했다.
 */
export const COLORS = {
  // 브랜드 (액션·강조)
  primary: '#2E9E8F', // 카밍 틸
  primaryDark: '#1F6E63', // 딥 틸 (pressed/hover)
  accent: '#7FB5A6', // 세이지 (미세 포인트)

  // 뉴트럴 & 표면
  secondary: '#5F6B68', // 뮤트 슬레이트
  background: '#F6F8F7', // 앱 기본 배경
  surface: '#FFFFFF', // 카드/표면
  light: '#EAF3F1', // 민트 카드/칩 배경
  mint: '#EAF3F1',
  mintDeep: '#D8ECE7',
  ink: '#15302B', // 다크 히어로 배경
  dark: '#1F3833',
  white: '#FFFFFF',
  border: '#E2E8E5', // 헤어라인

  // 텍스트
  textPrimary: '#1E2A27',
  textSecondary: '#5F6B68',
  textLight: '#9AA6A2',

  // 시맨틱 (팔레트에 맞춰 채도를 낮춘 톤)
  success: '#3AA76D',
  warning: '#D99A4E',
  danger: '#D2664F',
  info: '#4F8FB0',

  // 스탯 카드 등 옅은 틴트
  tintTeal: '#E5F1EF',
  tintGreen: '#E7F2EA',
  tintAmber: '#F6ECDC',
  tintBlue: '#E6EFF4',
  tintRose: '#F5E7E3',
} as const;

/** 8px 기반 스페이싱 스케일 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** 라운딩 */
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** 타이포 위계 */
export const TYPO = {
  display: { fontSize: 30, fontWeight: '700' as const, lineHeight: 38 },
  h1: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySm: { fontSize: 13, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
} as const;

/** 틸 톤의 부드러운 그림자 (웹은 boxShadow, 네이티브는 shadow 계열 + elevation) */
const shadow = (elevation: number, opacity: number, radius: number, offsetY: number) =>
  Platform.select({
    web: { boxShadow: `0 ${offsetY}px ${radius}px rgba(31,110,99,${opacity})` },
    default: {
      shadowColor: '#1F6E63',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
      elevation,
    },
  }) as object;

export const SHADOWS = {
  sm: shadow(2, 0.08, 6, 2),
  md: shadow(4, 0.1, 14, 6),
  lg: shadow(8, 0.14, 24, 12),
} as const;

export const EXERCISE_CATEGORIES = [
  '어깨',
  '무릎',
  '허리',
  '목',
  '손목',
  '발목',
  '골반',
  '전신',
];

export const PAIN_LEVELS = [
  { value: 1, label: '거의 없음', color: '#3AA76D' },
  { value: 2, label: '약간', color: '#5FB07A' },
  { value: 3, label: '가벼움', color: '#86B778' },
  { value: 4, label: '보통 이하', color: '#B0B972' },
  { value: 5, label: '보통', color: '#D9B25A' },
  { value: 6, label: '보통 이상', color: '#DFA050' },
  { value: 7, label: '다소 심함', color: '#DC8A4C' },
  { value: 8, label: '심함', color: '#D77049' },
  { value: 9, label: '매우 심함', color: '#D25A4C' },
  { value: 10, label: '극심함', color: '#C64C54' },
];

// 리뷰 별점 라벨 (1~5)
export const RATING_LABELS = ['별로였어요', '아쉬웠어요', '괜찮았어요', '좋았어요', '최고였어요'];

// 치료 리뷰 질문 + 빠른 선택 태그
export const REVIEW_QUESTIONS = [
  {
    key: 'guide',
    question: '첫 상담과 안내 경험은 어떠셨나요?',
    tags: ['일정 안내가 명확했어요', '친절하게 설명해주셨어요', '대기 시간이 적당했어요', '시설이 깨끗했어요'],
  },
  {
    key: 'treatment',
    question: '치료 진행은 어떠셨나요?',
    tags: ['운동 지도가 꼼꼼했어요', '통증을 잘 살펴주셨어요', '난이도가 적절했어요', '설명이 이해하기 쉬웠어요'],
  },
  {
    key: 'overall',
    question: '전반적으로 만족하셨나요?',
    tags: ['효과를 느꼈어요', '다시 받고 싶어요', '추천하고 싶어요', '꾸준히 하게 돼요'],
  },
];

export const DIFFICULTY_LEVELS = [
  { value: 1, label: '매우 쉬움' },
  { value: 2, label: '쉬움' },
  { value: 3, label: '보통' },
  { value: 4, label: '어려움' },
  { value: 5, label: '매우 어려움' },
];
