import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react';

import HomeScreen  from './pages/HomeScreen.js';
import RegisterUser from './pages/RegisterUser.js';
import UpdateUser from './pages/UpdateUser.js';
import ViewUser from './pages/ViewUser.js';
import ViewAllUser from './pages/ViewAllUser.js';
import DeleteUser from './pages/DeleteUser.js';
import LoginPage from './pages/LoginPage.js';
import SpotifyLogin from './pages/SpotifyLogin.js';
import MoodHome from './pages/MoodHome.js';

const Stack = createStackNavigator();

function MainStackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='HomeScreen'
          component={HomeScreen}
          options={{ 
            title: 'Home Screen',
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: 'black',
           }}
        />
        <Stack.Screen
          name='View'
          component={ViewUser}
          options={{ 
            title: 'View User',
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: 'black',
           }}
        />
        <Stack.Screen
          name='ViewAll'
          component={ViewAllUser}
          options={{ 
            title: 'View All Users',
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: 'black',
           }}
        />
        <Stack.Screen
          name='Update'
          component={UpdateUser}
          options={{ 
            title: 'Update User',
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: 'black',
           }}
        />
        <Stack.Screen
          name='Register'
          component={RegisterUser}
          options={{ 
            title: 'Register User',
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: 'black',
           }}
        />
        <Stack.Screen
          name='Delete'
          component={DeleteUser}
          options={{ 
            title: 'Delete User',
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: 'black',
           }}
        />
        <Stack.Screen
          name='Login'
          component={LoginPage}
          options={{ 
            title: 'Login Page',
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: 'black',
           }}
        />
        <Stack.Screen
          name='SpotifyLogin'
          component={SpotifyLogin}
          options={{ 
            title: 'Login Spotify',
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: 'black',
           }}
        />
        <Stack.Screen
          name='MoodHome'
          component={MoodHome}
          options={{ 
            title: '~ Mood Music ~',
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: 'black',
           }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default MainStackNavigator;
