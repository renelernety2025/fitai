import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../lib/auth-context';

// Auth + Onboarding
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';

// Main tabs
import { DashboardScreen } from '../screens/DashboardScreen';
import { PlansScreen } from '../screens/PlansScreen';
import { VyzivaScreen } from '../screens/VyzivaScreen';
import { LekceScreen } from '../screens/LekceScreen';
import { ProgressScreen } from '../screens/ProgressScreen';

// Stack screens
import { ProfileScreen } from '../screens/ProfileScreen';
import { VideosScreen } from '../screens/VideosScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { SlovnikScreen } from '../screens/SlovnikScreen';
import { DomaScreen } from '../screens/DomaScreen';
import { AICoachScreen } from '../screens/AICoachScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { LessonDetailScreen } from '../screens/LessonDetailScreen';
import { ExerciseDetailScreen } from '../screens/ExerciseDetailScreen';
import { PlanDetailScreen } from '../screens/PlanDetailScreen';
import { VideoDetailScreen } from '../screens/VideoDetailScreen';
import { CameraWorkoutScreen } from '../screens/CameraWorkoutScreen';
import { HabityScreen } from '../screens/HabityScreen';
import { UspechyScreen } from '../screens/UspechyScreen';
import { ProgressPhotosScreen } from '../screens/ProgressPhotosScreen';
import { JidelnicekScreen } from '../screens/JidelnicekScreen';
import { CameraWorkoutProScreen } from '../screens/CameraWorkoutProScreen';
import { AIChatScreen } from '../screens/AIChatScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { LeaguesScreen } from '../screens/LeaguesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const v2Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: '#000',
    card: '#000',
    text: '#FFF',
    border: 'rgba(255,255,255,0.1)',
    primary: '#FFF',
  },
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.5,
        color: focused ? '#FFF' : 'rgba(255,255,255,0.4)',
      }}
    >
      {label.toUpperCase()}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 6,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Dnes" focused={focused} /> }}
      />
      <Tab.Screen
        name="Plans"
        component={PlansScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Trénink" focused={focused} /> }}
      />
      <Tab.Screen
        name="Vyziva"
        component={VyzivaScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Výživa" focused={focused} /> }}
      />
      <Tab.Screen
        name="Habity"
        component={HabityScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Habity" focused={focused} /> }}
      />
      <Tab.Screen
        name="Lekce"
        component={LekceScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Lekce" focused={focused} /> }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Pokrok" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator color="rgba(255,255,255,0.4)" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={v2Theme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Videos" component={VideosScreen} />
            <Stack.Screen name="Exercises" component={ExercisesScreen} />
            <Stack.Screen name="Slovnik" component={SlovnikScreen} />
            <Stack.Screen name="Doma" component={DomaScreen} />
            <Stack.Screen name="AICoach" component={AICoachScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
            <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
            <Stack.Screen name="PlanDetail" component={PlanDetailScreen} />
            <Stack.Screen name="VideoDetail" component={VideoDetailScreen} />
            <Stack.Screen name="CameraWorkout" component={CameraWorkoutScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="Uspechy" component={UspechyScreen} />
            <Stack.Screen name="ProgressPhotos" component={ProgressPhotosScreen} />
            <Stack.Screen name="Jidelnicek" component={JidelnicekScreen} />
            <Stack.Screen name="CameraWorkoutPro" component={CameraWorkoutProScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="AIChat" component={AIChatScreen} />
            <Stack.Screen name="Journal" component={JournalScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="Leagues" component={LeaguesScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
