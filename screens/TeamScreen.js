import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../config/supabase';
import TopBarLayout from '../components/TopBarLayout'; // Import TopBarLayout

export default function TeamScreen() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState('My');

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

        // Fetch patient name for the top bar
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('name')
          .eq('id', patientId)
          .single();

        if (!patientError && patientData) {
          setPatientName(patientData.name);
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

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e) {
      console.error("Sign Out Error:", e.message);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handleInvite = () => {
    // Logic for inviting new members (send email, show modal, etc.)
    console.log('Invite button pressed');
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRole}>{item.role}</Text>
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
    <TopBarLayout patientName={patientName} onSignOut={handleSignOut}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.header}>Care Team</Text>
            <Text style={styles.subHeader}>{teamMembers.length} Members</Text>
          </View>
          <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
            <Text style={styles.inviteText}>+  Invite</Text>
          </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: { 
    fontSize: 15, 
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  memberRole: { 
    fontSize: 15, 
    color: '#666',
  },
  inviteButton: {
    backgroundColor: '#38496B',
    paddingHorizontal: 18, 
    paddingVertical: 11,  
    borderRadius: 8, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginLeft: 16,
    marginTop: 4,
  },
  inviteText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 18,
  },
});