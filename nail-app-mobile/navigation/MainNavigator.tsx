import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// Screens
import CameraScreen from '../screens/CameraScreen';
import DesignScreen from '../screens/DesignScreen';
import FeedScreen from '../screens/FeedScreen';
import ProcessingScreen from '../screens/ProcessingScreen';
import ResultsScreen from '../screens/ResultsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CompareScreen from '../screens/CompareScreen';
import UpgradeScreen from '../screens/UpgradeScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
import type { MainStackParamList } from './types';

const Stack = createStackNavigator<MainStackParamList>();
const Tab = createMaterialTopTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Design"
      screenOptions={{
        lazy: false,
        swipeEnabled: true,
        animationEnabled: false,
      }}
      tabBar={() => null}
    >
      <Tab.Screen name="Design" component={DesignScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

      {/* Flow Screens */}
      <Stack.Screen name="Processing" component={ProcessingScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />

      {/* Additional Screens */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="CompareScreen" component={CompareScreen} />
      <Stack.Screen name="Upgrade" component={UpgradeScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </Stack.Navigator>
  );
}
