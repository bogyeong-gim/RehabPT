import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TherapistHomeScreen from '../screens/therapist/TherapistHomeScreen';
import PatientListScreen from '../screens/therapist/PatientListScreen';
import ScheduleManageScreen from '../screens/therapist/ScheduleManageScreen';
import WeeklyScheduleScreen from '../screens/therapist/WeeklyScheduleScreen';
import FeedbackReviewScreen from '../screens/therapist/FeedbackReviewScreen';
import VideoManageScreen from '../screens/therapist/VideoManageScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TherapistHome" component={TherapistHomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function PatientStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PatientList" component={PatientListScreen} options={{ title: '환자 목록' }} />
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

function FeedbackStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FeedbackReview" component={FeedbackReviewScreen} options={{ title: '피드백 확인' }} />
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

function VideoStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="VideoManage" component={VideoManageScreen} options={{ title: '영상 관리' }} />
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
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: '홈', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="PatientListTab"
        component={PatientStack}
        options={{ tabBarLabel: '환자', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="ScheduleManageTab"
        component={ScheduleStack}
        options={{ tabBarLabel: '스케줄', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="FeedbackReviewTab"
        component={FeedbackStack}
        options={{ tabBarLabel: '피드백', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{ tabBarLabel: '메시지', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="VideoManageTab"
        component={VideoStack}
        options={{ tabBarLabel: '영상', tabBarIcon: () => null }}
      />
    </Tab.Navigator>
  );
}
