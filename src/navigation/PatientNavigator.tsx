import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import ScheduleScreen from '../screens/patient/ScheduleScreen';
import ExerciseFeedbackScreen from '../screens/patient/ExerciseFeedbackScreen';
import ReviewScreen from '../screens/patient/ReviewScreen';
import VideoListScreen from '../screens/patient/VideoListScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import VideoPlayerScreen from '../screens/video/VideoPlayerScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PatientHome" component={PatientHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ title: '스케줄 상세' }} />
      <Stack.Screen name="Feedback" component={ExerciseFeedbackScreen} options={{ title: '운동 피드백' }} />
      <Stack.Screen name="Review" component={ReviewScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ScheduleStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ScheduleMain" component={ScheduleScreen} options={{ title: '스케줄' }} />
      <Stack.Screen name="Feedback" component={ExerciseFeedbackScreen} options={{ title: '운동 피드백' }} />
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
      <Stack.Screen name="VideoList" component={VideoListScreen} options={{ title: '운동 영상' }} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ title: '영상 재생' }} />
    </Stack.Navigator>
  );
}

export default function PatientNavigator() {
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
        name="ScheduleTab"
        component={ScheduleStack}
        options={{ tabBarLabel: '스케줄', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{ tabBarLabel: '메시지', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="VideoTab"
        component={VideoStack}
        options={{ tabBarLabel: '운동 영상', tabBarIcon: () => null }}
      />
    </Tab.Navigator>
  );
}
