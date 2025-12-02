import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { useNavigation } from '@react-navigation/native';

export default function TopBarLayout({ children, showTopBar = true }) {
  const [patientName, setPatientName] = useState('My');
  const [userInitials, setUserInitials] = useState('U');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const fetchData = async () => {
    try {
      const user = (await supabase.auth.getSession()).data.session?.user;
      if (!user) return;

      // Get user's name for initials
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('user_id', user.id)
        .single();

      if (userData && userData.name) {
        const initials = getInitials(userData.name);
        setUserInitials(initials);
      }

      // Get patient's name for header
      const { data: userPatientData } = await supabase
        .from('users')
        .select('patient_id')
        .eq('user_id', user.id)
        .single();

      if (userPatientData) {
        const { data: patientData } = await supabase
          .from('patients')
          .select('name')
          .eq('id', userPatientData.patient_id)
          .single();

        if (patientData) {
          setPatientName(patientData.name);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
            </>
          </View>
          
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {userInitials}
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
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
});