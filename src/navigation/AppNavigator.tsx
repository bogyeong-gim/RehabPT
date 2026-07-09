import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import TherapistNavigator from './TherapistNavigator';
import AdminNavigator from './AdminNavigator';
import Loading from '../components/common/Loading';
import { useAuthStore } from '../store/authStore';
import { subscribeToAuthState, getCurrentUser } from '../services/authService';

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
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {user.role === 'patient' && <PatientNavigator />}
      {user.role === 'therapist' && <TherapistNavigator />}
      {user.role === 'admin' && <AdminNavigator />}
    </NavigationContainer>
  );
}
