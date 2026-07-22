import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import TherapistNavigator from './TherapistNavigator';
import AdminNavigator from './AdminNavigator';
import Loading from '../components/common/Loading';
import { useAuthStore } from '../store/authStore';
import { subscribeToAuthState, getCurrentUser } from '../services/authService';
import { COLORS } from '../utils/constants';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.danger,
  },
};

export default function AppNavigator() {
  const { user, isLoading, isAuthenticated, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getCurrentUser(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || !user) {
    return (
      <NavigationContainer theme={navTheme}>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user.role === 'patient' && <PatientNavigator />}
      {user.role === 'therapist' && <TherapistNavigator />}
      {user.role === 'admin' && <AdminNavigator />}
    </NavigationContainer>
  );
}
