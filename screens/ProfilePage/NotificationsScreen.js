import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import CustomText from '../../components/CustomText';

export default function NotificationsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [moodNotifications, setMoodNotifications] = useState(true);
  const [sleepNotifications, setSleepNotifications] = useState(true);
  const [medicationNotifications, setMedicationNotifications] = useState(true);
  const [activityNotifications, setActivityNotifications] = useState(true);
  const [mealNotifications, setMealNotifications] = useState(true);
  const [behaviorNotifications, setBehaviorNotifications] = useState(true);
  const [appointmentNotifications, setAppointmentNotifications] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38496B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#38496B" />
          </TouchableOpacity>
          <CustomText size="h3" style={styles.headerTitle}>Notifications</CustomText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
            <CustomText size="caption" style={styles.sectionTitle}>
              Notify me only for specific entries
            </CustomText>
            
            <View style={styles.notificationList}>
            {/* Mood toggle */}
            <View style={styles.notificationItem}>
                <CustomText size="h4" style={styles.notificationLabel}>Mood</CustomText>
                <Switch
                value={moodNotifications}
                onValueChange={setMoodNotifications}
                trackColor={{ false: '#767577', true: '#38496B' }}
                />
            </View>
            
            {/* Sleep toggle */}
            <View style={styles.notificationItem}>
                <CustomText size="h4" style={styles.notificationLabel}>Sleep</CustomText>
                <Switch
                value={sleepNotifications}
                onValueChange={setSleepNotifications}
                trackColor={{ false: '#767577', true: '#38496B' }}
                />
            </View>
            
            {/* Medication toggle */}
            <View style={styles.notificationItem}>
                <CustomText size="h4" style={styles.notificationLabel}>Medication</CustomText>
                <Switch
                value={medicationNotifications}
                onValueChange={setMedicationNotifications}
                trackColor={{ false: '#767577', true: '#38496B' }}
                />
            </View>
            
            {/* Activity toggle */}
            <View style={styles.notificationItem}>
                <CustomText size="h4" style={styles.notificationLabel}>Activity</CustomText>
                <Switch
                value={activityNotifications}
                onValueChange={setActivityNotifications}
                trackColor={{ false: '#767577', true: '#38496B' }}
                />
            </View>
            
            {/* Meal toggle */}
            <View style={styles.notificationItem}>
                <CustomText size="h4" style={styles.notificationLabel}>Meal</CustomText>
                <Switch
                value={mealNotifications}
                onValueChange={setMealNotifications}
                trackColor={{ false: '#767577', true: '#38496B' }}
                />
            </View>
            
            {/* Behavior toggle */}
            <View style={styles.notificationItem}>
                <CustomText size="h4" style={styles.notificationLabel}>Behavior</CustomText>
                <Switch
                value={behaviorNotifications}
                onValueChange={setBehaviorNotifications}
                trackColor={{ false: '#767577', true: '#38496B' }}
                />
            </View>
            
            {/* Appointment toggle */}
            <View style={styles.notificationItem}>
                <CustomText size="h4" style={styles.notificationLabel}>Appointment</CustomText>
                <Switch
                value={appointmentNotifications}
                onValueChange={setAppointmentNotifications}
                trackColor={{ false: '#767577', true: '#38496B' }}
                />
            </View>
            </View>
        </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontWeight: '600',
    color: '#38496B',
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    color: '#38496B',
    marginBottom: 20,
  },
  notificationList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationLabel: {
    color: '#38496B',
    fontWeight: '500',
  },
});