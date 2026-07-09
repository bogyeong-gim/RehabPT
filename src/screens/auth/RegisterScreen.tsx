import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, Title, SegmentedButtons } from 'react-native-paper';
import { COLORS } from '../../utils/constants';
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
  const setUser = useAuthStore((s) => s.setUser);

  const handleRegister = async () => {
    if (!email || !password || !name || !phone) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(email.trim(), password, name, phone, role);
      setUser(user);
    } catch (error: any) {
      const message =
        error.code === 'auth/email-already-in-use'
          ? '이미 사용 중인 이메일입니다.'
          : error.code === 'auth/invalid-email'
            ? '유효하지 않은 이메일 형식입니다.'
            : '회원가입에 실패했습니다.';
      Alert.alert('회원가입 실패', message);
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
