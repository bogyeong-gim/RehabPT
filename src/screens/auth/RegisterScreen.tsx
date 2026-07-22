import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Title, SegmentedButtons, Avatar } from 'react-native-paper';
import { COLORS, SPACING, RADIUS, TYPO } from '../../utils/constants';
import { registerUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [error, setError] = useState('');
  const setUser = useAuthStore((s) => s.setUser);

  const handleRegister = async () => {
    setError('');
    if (!email || !password || !name || !phone) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(email.trim(), password, name, phone, role);
      setUser(user);
    } catch (e: any) {
      const code = e?.code || '';
      const message =
        code === 'auth/email-already-in-use'
          ? '이미 사용 중인 이메일입니다.'
          : code === 'auth/invalid-email'
            ? '유효하지 않은 이메일 형식입니다.'
            : code === 'auth/weak-password'
              ? '비밀번호가 너무 약합니다. 6자 이상으로 설정해주세요.'
              : code === 'auth/network-request-failed'
                ? '네트워크 연결을 확인해주세요.'
                : '회원가입에 실패했습니다. 다시 시도해주세요.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title style={styles.title}>회원가입</Title>

        {!!error && (
          <View style={styles.errorBanner}>
            <Avatar.Icon size={22} icon="alert-circle-outline" color={COLORS.danger} style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>역할 선택</Text>
        <SegmentedButtons
          value={role}
          onValueChange={(v) => setRole(v as UserRole)}
          buttons={[
            { value: 'patient', label: '환자' },
            { value: 'therapist', label: '운동치료사' },
          ]}
          style={styles.segmented}
        />

        <TextInput
          label="이름"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />

        <TextInput
          label="이메일"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />

        <TextInput
          label="전화번호"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />

        <TextInput
          label="비밀번호"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={secureText}
          right={
            <TextInput.Icon
              icon={secureText ? 'eye-off' : 'eye'}
              onPress={() => setSecureText(!secureText)}
            />
          }
          style={styles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />

        <TextInput
          label="비밀번호 확인"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor={COLORS.primary}
        >
          회원가입
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.linkButton}
          textColor={COLORS.primary}
        >
          이미 계정이 있으신가요? 로그인
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.primary,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.tintRose,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm + 2,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  errorIcon: { backgroundColor: 'transparent' },
  errorText: { ...TYPO.bodySm, color: COLORS.danger, flex: 1, fontWeight: '500' },
  input: {
    marginBottom: 14,
    backgroundColor: COLORS.white,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  linkButton: {
    marginTop: 16,
  },
});
