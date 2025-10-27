import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

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

export default function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Design"
      screenOptions={{
        headerShown: false,
        // Use default stack animation settings compatible with current RN Navigation
        // to avoid runtime issues on some devices.
        // animationEnabled removed (deprecated in newer APIs)
        gestureEnabled: true,
      }}
    >
      {/* Main Screens with custom tab bar */}
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Design" component={DesignScreen} />
      <Stack.Screen name="Feed" component={FeedScreen} />
      
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
