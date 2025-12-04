import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, TextInput, Clipboard } from 'react-native';
import { supabase } from '../config/supabase';
import TopBarLayout from '../components/TopBarLayout';
import { Ionicons } from '@expo/vector-icons';
import CustomText from '../components/CustomText';

export default function TeamScreen() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);

    const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) throw new Error("User not authenticated.");
    
    try {
        // Get user's data and patient name
        const { data: userData, error: userError } = await supabase
        .from('users')
        .select('patient_id')
        .eq('user_id', user.id)
        .single();

        if (userError || !userData) {
          console.error(userError);
          Alert.alert("Error", "Could not load user patient id");
          return;
        }

        const patientId = userData.patient_id;

        // Fetch patient data
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('name, group_code')
          .eq('id', patientId)
          .single();

        if (!patientError && patientData) {
          setPatientName(patientData.name);
          setGroupCode(patientData.group_code || 'No code set');
        }

        const { data, error } = await supabase
        .from('users')
        .select('user_id, name, role')
        .eq('patient_id', patientId);

        if (error) throw error;
        setTeamMembers(data);
    } catch (e) {
      console.error('Error fetching team members:', e);
      Alert.alert("Error", "Could not load team members");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!groupCode || groupCode === 'No code set') return;
    
    try {
      Clipboard.setString(groupCode); // No await needed
      setShowCopied(true);
      
      // Hide the "Copied!" message after 2 seconds
      setTimeout(() => {
        setShowCopied(false);
      }, 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy code to clipboard");
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberContainer}>
      <View style={styles.avatar}>
        <CustomText size={1.3} style={styles.avatarText}>
          {getInitials(item.name)}
        </CustomText>
      </View>
      <View style={styles.memberInfo}>
        <CustomText size="h4" style={styles.memberName}>{item.name}</CustomText>
        <CustomText size="body" style={styles.memberRole}>{item.role}</CustomText>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38496B" />
      </View>
    );
  }

  return (
    <TopBarLayout>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <CustomText size="h2" style={styles.header}>Care Team</CustomText>
            <CustomText size="body" style={styles.subHeader}>
              {teamMembers.length} Member{teamMembers.length !== 1 ? 's' : ''}
            </CustomText>
          </View>
          
          {/* Group Code with positioning wrapper */}
          <View style={styles.groupCodeWrapper}>
            <TouchableOpacity 
              style={styles.groupCodeContainer}
              onPress={copyToClipboard}
              disabled={!groupCode || groupCode === 'No code set'}
            >
              <View style={styles.groupCodeContent}>
                <CustomText size="body" style={styles.groupCodeLabel}>
                  Group Code:
                </CustomText>
                <View style={styles.codeRow}>
                  <CustomText size="h3" style={styles.groupCodeText}>
                    {groupCode}
                  </CustomText>
                  <Ionicons 
                    name="copy-outline" 
                    size={18} 
                    color="#38496B" 
                    style={styles.copyIcon}
                  />
                </View>
              </View>
            </TouchableOpacity>
            
            {/* "Copied!" message positioned relative to the wrapper */}
            {showCopied && (
              <View style={styles.copiedContainer}>
                <CustomText size="small" style={styles.copiedText}>
                  Copied!
                </CustomText>
              </View>
            )}
          </View>
        </View>
        
        <FlatList
          data={teamMembers}
          keyExtractor={(item) => item.user_id}
          renderItem={renderMember}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </TopBarLayout>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff',
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  header: {
    fontWeight: 'bold',
    color: '#38496B',
    marginBottom: 4,
  },
  subHeader: {
    color: '#38496B',
  },
  listContent: { 
    paddingBottom: 20,
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#38496B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: { 
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  memberRole: { 
    color: '#666',
  },
  groupCodeWrapper: {
    position: 'relative',
    marginLeft: 16,
    marginTop: 4,
  },
  groupCodeContent: {
    alignItems: 'center',
  },
  groupCodeLabel: {
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCodeText: {
    color: '#38496B',
    fontWeight: 'bold',
    marginRight: 8,
  },
  copyIcon: {
    opacity: 0.7,
  },
  copiedContainer: {
    position: 'absolute',
    top: '100%', 
    left: 0,
    right: 0,
    alignItems: 'center',
    marginTop: 5,
  },
  copiedText: {
    color: '#42B826',
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});