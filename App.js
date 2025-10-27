import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import NewEntryScreen from './screens/NewEntryScreen';
import SignUpScreen from './screens/SignUpScreen'; 
import { supabase } from './config/supabase'; 

const CalendarScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Calendar</Text></View>;
const ReportsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Reports</Text></View>;
const TeamScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Team</Text></View>;

const CustomAddButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.addButton}
    onPress={onPress}
  >
    <View style={styles.addButtonCircle}>
      {children}
    </View>
  </TouchableOpacity>
);

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NewEntryPlaceholder"
        component={View}
        options={{
          tabBarButton: (props) => (
            <CustomAddButton {...props} onPress={() => navigation.navigate('NewEntry')}>
              <Ionicons name="add" size={36} color="white" />
            </CustomAddButton>
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootStack.Navigator>
          {session ? (
            <>
              <RootStack.Screen 
                name="Main" 
                component={MainTabs} 
                options={{ headerShown: false }} 
              />
              <RootStack.Screen 
                name="NewEntry" 
                component={NewEntryScreen} 
                options={{ presentation: 'modal', headerShown: false }} 
              />
            </>
          ) : (
            <RootStack.Screen 
              name="Auth" 
              component={SignUpScreen} 
              options={{ headerShown: false }} 
            />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    top: -20, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonCircle: {
    backgroundColor: '#007bff',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabBar: {
    height: 90,
    borderTopWidth: 0,
    elevation: 10,
    backgroundColor: '#fff',
    paddingBottom: 25, 
    paddingTop: 10,
  }
});