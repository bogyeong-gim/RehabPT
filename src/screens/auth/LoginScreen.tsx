import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Avatar } from 'react-native-paper';
import { COLORS, SPACING, RADIUS, TYPO } from '../../utils/constants';
import { loginUser, sendPasswordReset } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const setUser = useAuthStore((s) => s.setUser);

  const handleReset = async () => {
    setError('');
    setNotice('');
    if (!email) {
      setError('비밀번호를 재설정할 이메일을 입력해주세요.');
      return;
    }
    try {
      await sendPasswordReset(email);
      setNotice('비밀번호 재설정 메일을 보냈습니다. 메일함을 확인해주세요.');
    } catch {
      setNotice('재설정 메일 요청을 접수했습니다. 가입된 이메일이면 메일이 도착합니다.');
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser(email.trim(), password);
      setUser(user);
    } catch (e: any) {
      const code = e?.code || '';
      const message =
        code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : code === 'auth/invalid-email'
            ? '이메일 형식이 올바르지 않습니다.'
            : code === 'auth/too-many-requests'
              ? '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
              : code === 'auth/network-request-failed'
                ? '네트워크 연결을 확인해주세요.'
                : e?.message === '사용자 정보를 찾을 수 없습니다.'
                  ? '계정 정보를 찾을 수 없습니다. 관리자에게 문의해주세요.'
                  : '로그인에 실패했습니다. 다시 시도해주세요.';
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
      <View style={styles.inner}>
        <View style={styles.brand}>
          <Avatar.Icon
            size={72}
            icon="leaf"
            color={COLORS.primary}
            style={styles.brandIcon}
          />
          <Text style={styles.title}>새늘</Text>
          <Text style={styles.subtitle}>재활운동 관리</Text>
        </View>

        {!!error && (
          <View style={styles.errorBanner}>
            <Avatar.Icon size={22} icon="alert-circle-outline" color={COLORS.danger} style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {!!notice && (
          <View style={styles.noticeBanner}>
            <Avatar.Icon size={22} icon="email-check-outline" color={COLORS.primary} style={styles.errorIcon} />
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        )}

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

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={COLORS.primary}
        >
          로그인
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
          style={styles.linkButton}
          textColor={COLORS.textSecondary}
        >
          계정이 없으신가요?  회원가입
        </Button>
        <Button
          mode="text"
          onPress={handleReset}
          textColor={COLORS.textLight}
          compact
        >
          비밀번호를 잊으셨나요?
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  brandIcon: {
    backgroundColor: COLORS.mint,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPO.display,
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    ...TYPO.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm + 2,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  noticeText: { ...TYPO.bodySm, color: COLORS.primaryDark, flex: 1, fontWeight: '500' },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  button: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  buttonContent: {
    paddingVertical: SPACING.xs + 2,
  },
  linkButton: {
    marginTop: SPACING.md,
  },
});
