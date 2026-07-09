import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { COLORS } from '../../utils/constants';
import { loginUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser(email.trim(), password);
      setUser(user);
    } catch (error: any) {
      const message =
        error.code === 'auth/invalid-credential'
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : error.code === 'auth/too-many-requests'
            ? '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
            : '로그인에 실패했습니다.';
      Alert.alert('로그인 실패', message);
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
        <Title style={styles.title}>새늘</Title>
        <Text style={styles.subtitle}>재활운동 관리</Text>

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
          buttonColor={COLORS.primary}
        >
          로그인
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
          style={styles.linkButton}
          textColor={COLORS.primary}
        >
          계정이 없으신가요? 회원가입
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
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
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
