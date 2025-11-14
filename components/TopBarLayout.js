// components/TopBarLayout.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TopBarLayout({ children, patientName = 'My', onSignOut, showTopBar = true }) {
  if (!showTopBar) {
    return children;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBarContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{patientName}'s Journal</Text>
            <Ionicons name="chevron-down" size={16} color="#38496B" style={{ marginLeft: 4 }} />
          </View>
          
          <TouchableOpacity onPress={onSignOut} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={24} color="#38496B" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Match your top bar background
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  topBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#38496B',
  },
  signOutButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
});