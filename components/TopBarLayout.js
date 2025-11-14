// components/TopBarLayout.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { useNavigation } from '@react-navigation/native';

export default function TopBarLayout({ children, showTopBar = true }) {
  const [patientName, setPatientName] = useState('My');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPatientName();
  }, []);

  const fetchPatientName = async () => {
    try {
      const user = (await supabase.auth.getSession()).data.session?.user;
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('patient_id')
        .eq('user_id', user.id)
        .single();

      if (userData) {
        const { data: patientData } = await supabase
          .from('patients')
          .select('name')
          .eq('id', userData.patient_id)
          .single();

        if (patientData) {
          setPatientName(patientData.name);
        }
      }
    } catch (error) {
      console.error('Error fetching patient name:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  if (!showTopBar) {
    return children;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBarContainer}>
          <View style={styles.headerContent}>
            <>
              <Text style={styles.headerTitle}>{patientName}'s Journal</Text>
              <Ionicons name="chevron-down" size={16} color="#38496B" style={{ marginLeft: 4 }} />
            </>
          </View>
          
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {patientName ? patientName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
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
    backgroundColor: '#fff',
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
  profileButton: {
    padding: 5,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#38496B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});