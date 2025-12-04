import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HelpAndSupportScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  
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
          <Text style={styles.headerTitle}>Help and Support</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Help</Text>
            <View style={styles.settingGroup}>
              <View style={styles.settingsList}>
                <TouchableOpacity style={styles.settingItem}>
                  <Text style={styles.settingLabel}>
                    How-To Guide
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <View style={styles.settingGroup}>
              <TouchableOpacity 
                style={styles.emailButton}
              >
                <Text style={styles.emailButtonText}>Send us an email</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.versionText}>App Version: 1.0.0</Text>
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#38496B',
    marginBottom: 12,
  },
  settingGroup: {
    marginBottom: 0,
  },
  settingsList: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#38496B',
    fontWeight: '600',
  },
  emailButton: {
    backgroundColor: '#e7e7e7ff',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 16,
    color: '#38496B',
    fontWeight: '600',
  },
  sectionDivider: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
});