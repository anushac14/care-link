import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>
              Notify me only for specific entries
            </Text>
            
            <View style={styles.notificationList}>
              {/* Mood toggle */}
              <View style={styles.notificationItem}>
                <Text style={styles.notificationLabel}>Mood</Text>
                <Switch
                  value={moodNotifications}
                  onValueChange={setMoodNotifications}
                  trackColor={{ false: '#767577', true: '#38496B' }}
                />
              </View>
              
              {/* Sleep toggle */}
              <View style={styles.notificationItem}>
                <Text style={styles.notificationLabel}>Sleep</Text>
                <Switch
                  value={sleepNotifications}
                  onValueChange={setSleepNotifications}
                  trackColor={{ false: '#767577', true: '#38496B' }}
                />
              </View>
              
              {/* Medication toggle */}
              <View style={styles.notificationItem}>
                <Text style={styles.notificationLabel}>Medication</Text>
                <Switch
                  value={medicationNotifications}
                  onValueChange={setMedicationNotifications}
                  trackColor={{ false: '#767577', true: '#38496B' }}
                />
              </View>
              
              {/* Activity toggle */}
              <View style={styles.notificationItem}>
                <Text style={styles.notificationLabel}>Activity</Text>
                <Switch
                  value={activityNotifications}
                  onValueChange={setActivityNotifications}
                  trackColor={{ false: '#767577', true: '#38496B' }}
                />
              </View>
              
              {/* Meal toggle */}
              <View style={styles.notificationItem}>
                <Text style={styles.notificationLabel}>Meal</Text>
                <Switch
                  value={mealNotifications}
                  onValueChange={setMealNotifications}
                  trackColor={{ false: '#767577', true: '#38496B' }}
                />
              </View>
              
              {/* Behavior toggle */}
              <View style={styles.notificationItem}>
                <Text style={styles.notificationLabel}>Behavior</Text>
                <Switch
                  value={behaviorNotifications}
                  onValueChange={setBehaviorNotifications}
                  trackColor={{ false: '#767577', true: '#38496B' }}
                />
              </View>
              
              {/* Appointment toggle */}
              <View style={styles.notificationItem}>
                <Text style={styles.notificationLabel}>Appointment</Text>
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
    fontSize: 17,
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
    fontSize: 16,
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
    fontSize: 16,
    color: '#38496B',
    fontWeight: '500',
  },
});