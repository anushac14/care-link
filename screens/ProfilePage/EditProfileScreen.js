import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';

export default function EditProfileScreen({ navigation, route }) {
  const fullName = route.params?.name || '';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const [formData, setFormData] = useState({
    firstName: firstName,
    lastName: lastName,
    email: route.params?.email || 'johnsmith@gmail.com',
  });
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const hasNameChanged = 
      formData.firstName !== firstName || 
      formData.lastName !== lastName;
    const hasEmailChanged = formData.email !== route.params?.email;
    
    setHasUnsavedChanges(hasNameChanged || hasEmailChanged);
  }, [formData]);

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName[0].toUpperCase() : '';
    const last = lastName ? lastName[0].toUpperCase() : '';
    return first + last;
  };

  const handleEditPhoto = () => {
    Alert.alert(
      'Edit Photo',
      'Photo upload functionality will be implemented later.',
      [{ text: 'OK' }]
    );
  };

  const handleSave = async () => {
  if (!formData.firstName.trim() || !formData.email.trim()) {
    Alert.alert('Error', 'Please fill in all required fields');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    Alert.alert('Error', 'Please enter a valid email address');
    return;
  }

  setLoading(true);
  try {
    const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) throw new Error('No user found');

    const emailChanged = formData.email !== route.params?.email;
    
    if (emailChanged) {
      const { error: emailError } = await supabase.auth.updateUser({ 
        email: formData.email 
      });
      
      if (emailError) {
        if (emailError.message.includes('already registered') || 
            emailError.message.includes('User already registered') ||
            emailError.message.includes('duplicate') ||
            emailError.message.includes('already exists')) {
          Alert.alert('Error', 'This email is already registered to another account');
        } else {
          Alert.alert('Error', emailError.message || 'Failed to update email');
        }
        setLoading(false);
        return;
      }
      
      Alert.alert(
        'Email Updated',
        'Your email has been updated. Please sign out and sign back in with your new email address.',
        [{ text: 'OK' }]
      );
    }

    // Only update name in users table (no email update needed)
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const { error: profileError } = await supabase
      .from('users')
      .update({ name: fullName })
      .eq('user_id', user.id);

    if (profileError) throw profileError;

    navigation.goBack();

  } catch (error) {
    console.error('Update error:', error);
    Alert.alert('Error', error.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#38496B" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Edit Profile</Text>
          
          <TouchableOpacity 
            onPress={handleSave} 
            style={styles.saveButton}
            disabled={loading || !hasUnsavedChanges}
          >
            <Text style={[
              styles.saveButtonText,
              (loading || !hasUnsavedChanges) && styles.saveButtonDisabled
            ]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(formData.firstName, formData.lastName)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.editPhotoButton}
              onPress={handleEditPhoto}
            >
              <Text style={styles.editPhotoText}>Edit Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.inputField}
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
              placeholder="First Name"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.inputField}
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
              placeholder="Last Name"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.inputField}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#38496B" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#F8F8F8',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 20,
    color: '#38496B', 
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38496B',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#666',
  },
  editPhotoButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  editPhotoText: {
    fontSize: 16,
    color: '#38496B',
    fontWeight: '500',
  },
  formContainer: {
    marginHorizontal: 20,
    marginTop: 0,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  inputLabel: {
    fontSize: 16,
    color: '#38496B',
    fontWeight: '400',
    flex: 1,
  },
  inputField: {
    fontSize: 16,
    color: '#38496B',
    textAlign: 'left',
    flex: 2,
    paddingVertical: 6,
    paddingLeft: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});