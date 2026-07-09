import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import UserManageScreen from '../screens/admin/UserManageScreen';

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={AdminDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="UserManage" component={UserManageScreen} options={{ title: '사용자 관리' }} />
    </Stack.Navigator>
  );
}
