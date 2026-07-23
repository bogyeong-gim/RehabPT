import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Avatar } from 'react-native-paper';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPO } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { updateProfile, logoutUser } from '../../services/authService';
import { getRoleLabel, confirmDialog, notifyDialog } from '../../utils/helpers';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const save = async () => {
    if (!name.trim()) {
      notifyDialog('알림', '이름을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(user.id, { name: name.trim(), phone: phone.trim() });
      setUser({ ...user, name: name.trim(), phone: phone.trim() });
      notifyDialog('완료', '프로필이 저장되었습니다.');
    } catch {
      notifyDialog('오류', '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    confirmDialog('로그아웃', '로그아웃 하시겠습니까?', async () => {
      await logoutUser();
      logout();
    }, '로그아웃', true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: SPACING.xxl }}>
      <View style={styles.hero}>
        <Avatar.Text size={72} label={user.name.charAt(0)} color={COLORS.white} style={{ backgroundColor: COLORS.primary }} />
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{getRoleLabel(user.role)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.section}>기본 정보</Text>
        <View style={styles.card}>
          <Text style={styles.readLabel}>이메일</Text>
          <Text style={styles.readValue}>{user.email}</Text>
        </View>

        <TextInput
          label="이름"
          value={name}
          onChangeText={setName}
          mode="outlined"
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
          style={styles.input}
        />
        <TextInput
          label="전화번호"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          keyboardType="phone-pad"
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={save}
          loading={saving}
          disabled={saving}
          buttonColor={COLORS.primary}
          style={styles.saveBtn}
          contentStyle={{ paddingVertical: SPACING.xs }}
        >
          저장하기
        </Button>

        <Button
          mode="outlined"
          onPress={handleLogout}
          textColor={COLORS.danger}
          style={styles.logoutBtn}
          theme={{ colors: { outline: COLORS.danger } }}
        >
          로그아웃
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: {
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    paddingTop: 56,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    gap: SPACING.sm,
  },
  name: { ...TYPO.h1, color: COLORS.white, marginTop: SPACING.sm },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 3 },
  roleText: { ...TYPO.caption, color: COLORS.white, fontWeight: '700' },
  body: { padding: SPACING.lg },
  section: { ...TYPO.bodySm, color: COLORS.textSecondary, fontWeight: '700', marginBottom: SPACING.sm },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  readLabel: { ...TYPO.caption, color: COLORS.textLight },
  readValue: { ...TYPO.body, color: COLORS.textPrimary, marginTop: 2 },
  input: { backgroundColor: COLORS.surface, marginBottom: SPACING.md },
  saveBtn: { borderRadius: RADIUS.md, marginTop: SPACING.xs },
  logoutBtn: { borderRadius: RADIUS.md, marginTop: SPACING.md },
});
