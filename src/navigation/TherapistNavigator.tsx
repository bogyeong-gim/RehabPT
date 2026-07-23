import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TherapistHomeScreen from '../screens/therapist/TherapistHomeScreen';
import PatientListScreen from '../screens/therapist/PatientListScreen';
import ScheduleManageScreen from '../screens/therapist/ScheduleManageScreen';
import WeeklyScheduleScreen from '../screens/therapist/WeeklyScheduleScreen';
import LogFeedScreen from '../screens/therapist/LogFeedScreen';
import FeedbackReviewScreen from '../screens/therapist/FeedbackReviewScreen';
import VideoManageScreen from '../screens/therapist/VideoManageScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import { Icon } from 'react-native-paper';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcon = (name: string) => ({ color, size }: { color: string; size: number }) =>
  <Icon source={name} color={color} size={size} />;

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TherapistHome" component={TherapistHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FeedbackReview" component={FeedbackReviewScreen} options={{ title: '피드백 확인' }} />
      <Stack.Screen name="VideoManage" component={VideoManageScreen} options={{ title: '영상 관리' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: '내 프로필' }} />
    </Stack.Navigator>
  );
}

function PatientStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PatientList" component={PatientListScreen} options={{ title: '내 회원', headerShown: false }} />
      <Stack.Screen name="ScheduleManage" component={ScheduleManageScreen} options={{ title: '스케줄 관리' }} />
    </Stack.Navigator>
  );
}

function ScheduleStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="WeeklySchedule" component={WeeklyScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ScheduleManageMain" component={ScheduleManageScreen} options={{ title: '스케줄 관리' }} />
    </Stack.Navigator>
  );
}

function LogFeedStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LogFeedMain" component={LogFeedScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: '메시지' }} />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }: any) => ({ title: route.params.otherName })}
      />
    </Stack.Navigator>
  );
}

export default function TherapistNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { paddingBottom: 6, height: 56 },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: '홈', tabBarIcon: tabIcon('home-outline') }} />
      <Tab.Screen name="ScheduleManageTab" component={ScheduleStack} options={{ tabBarLabel: '스케줄', tabBarIcon: tabIcon('calendar-month-outline') }} />
      <Tab.Screen name="LogFeedTab" component={LogFeedStack} options={{ tabBarLabel: '일지 피드', tabBarIcon: tabIcon('notebook-outline') }} />
      <Tab.Screen name="PatientListTab" component={PatientStack} options={{ tabBarLabel: '회원 관리', tabBarIcon: tabIcon('account-group-outline') }} />
      <Tab.Screen name="ChatTab" component={ChatStack} options={{ tabBarLabel: '채팅', tabBarIcon: tabIcon('chat-outline') }} />
    </Tab.Navigator>
  );
}
