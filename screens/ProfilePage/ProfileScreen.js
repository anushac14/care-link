import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';

export default function ProfileScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const user = (await supabase.auth.getSession()).data.session?.user;
      if (!user) {
        navigation.navigate('Auth');
        return;
      }

      // Get user's email from auth
      setUserEmail(user.email || '');

      // Get user's name from users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('name')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (userData) {
        setUserName(userData.name || '');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    
    const focusListener = navigation.addListener('focus', () => {
      fetchUserData();
    });

    return () => {
      focusListener();
    };
  }, [navigation]);

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
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <View style={styles.profileRow}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(userName)}</Text>
                  </View>
                </View>
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>{userName}</Text>
                  <Text style={styles.profileEmail}>{userEmail}</Text>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditProfile', { 
                      name: userName, 
                      email: userEmail 
                    })}
                  >
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <View style={styles.settingGroup}>
              <View style={styles.settingsList}>
                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={() => navigation.navigate('Notification')}
                >
                  <Text style={styles.settingLabel}>
                    Notifications
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={() => navigation.navigate('Accessibility')}
                >
                  <Text style={styles.settingLabel}>
                    Accessibility
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account & Privacy</Text>
            <View style={styles.settingsList}>
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => navigation.navigate('HelpAndSupport')}
              >
                <Text style={styles.settingLabel}>
                  Help and support
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => navigation.navigate('PrivacyAndData')}
              >
                <Text style={styles.settingLabel}>
                  Privacy and data
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => navigation.navigate('ChangePassword')}
              >
                <Text style={styles.settingLabel}>
                  Change password
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
              <Text style={styles.logoutText}>
                Log out
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
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
  profileSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  sectionDivider: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  profileInfo: {
    borderRadius: 8,
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: "#d9d9d9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#38496B',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#38496B',
    marginBottom: 12,
  },
  editButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#38496B',
    borderRadius: 6,
    paddingHorizontal: 50,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    color: '#38496B',
    fontWeight: '500',
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
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '700',
  },
});