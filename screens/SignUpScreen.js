import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { nanoid } from 'nanoid/non-secure';

const generateGroupCode = () => nanoid(6).toUpperCase();

const initialFormState = {
  name: '',
  username: '', 
  password: '',
  patientName: '',
  groupCode: '',
};

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState(initialFormState);
  const [flow, setFlow] = useState('MAIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '' });

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetState = () => {
    setFlow('MAIN');
    setError('');
    setForm(initialFormState);
  };

  const showInfoModal = (title, description) => {
    setModalContent({ title, description });
    setInfoModalVisible(true);
  };

  const handleSignIn = async () => {
    if (!form.username || !form.password) {
      return setError('Please enter your email and password.');
    }
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.username,
        password: form.password,
      });

      if (error) throw error;

    } catch (e) {
      setError(e.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!form.username || !form.password || !form.name || !form.patientName) {
      return setError('Please fill in all required fields.');
    }
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.username,
        password: form.password,
      });
      if (authError) throw authError;
      const userId = authData.user.id;
      
      const generatedCode = generateGroupCode();
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({ name: form.patientName, group_code: generatedCode })
        .select('id')
        .single();
      if (patientError) throw patientError;
      const patientId = patient.id;

      const { error: userError } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          name: form.name,
          patient_id: patientId,
          role: 'Admin',
        });
      if (userError) throw userError;

      showInfoModal(
        'Group Created Successfully!',
        `Share this code with caregivers: ${generatedCode}\n\nThey'll use this code to join your care team.`
      );

    } catch (e) {
      setError(e.message || 'Failed to create group. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!form.username || !form.password || !form.name || !form.groupCode) {
      return setError('Please fill in all required fields.');
    }
    setError('');
    setLoading(true);

    try {
      const { data: patient, error: lookupError } = await supabase
        .from('patients')
        .select('id')
        .eq('group_code', form.groupCode.toUpperCase())
        .single();
        
      if (lookupError || !patient) throw new Error('Invalid Group Code.');
      const patientId = patient.id;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.username,
        password: form.password,
      });
      if (authError) throw authError;
      const userId = authData.user.id;

      const { error: userError } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          name: form.name,
          patient_id: patientId,
          role: 'Caregiver',
        });
      if (userError) throw userError;

      showInfoModal(
        'Welcome to the Team!',
        'You have successfully joined the care team. You can now access the patient journal and collaborate with other caregivers.'
      );

    } catch (e) {
      setError(e.message || 'Failed to join group. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderAuthForm = (onSubmit) => (
    <View style={styles.formContainer}>
      {flow !== 'SIGNIN' && (
        <>
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Jane Doe"
            value={form.name}
            onChangeText={(text) => updateForm('name', text)}
          />
        </>
      )}
      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={styles.textInput}
        placeholder="email@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.username}
        onChangeText={(text) => updateForm('username', text)}
      />
      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        style={styles.textInput}
        placeholder="••••••"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => updateForm('password', text)}
      />
      
      {/* Dynamic fields based on flow */}
      {flow === 'CREATE_GROUP' && (
        <>
          <Text style={styles.inputLabel}>Patient's Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., John Smith"
            value={form.patientName}
            onChangeText={(text) => updateForm('patientName', text)}
          />
        </>
      )}
      {flow === 'JOIN_GROUP' && (
        <>
          <Text style={styles.inputLabel}>Group Code</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter 6-digit code"
            maxLength={6}
            autoCapitalize="characters"
            value={form.groupCode}
            onChangeText={(text) => updateForm('groupCode', text)}
          />
        </>
      )}
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      
      <TouchableOpacity 
        style={[styles.primaryButton, loading && styles.buttonDisabled]} 
        onPress={onSubmit} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {flow === 'CREATE_GROUP' ? 'Create Group & Sign Up' : 
             flow === 'JOIN_GROUP' ? 'Join Group & Sign Up' : 'Sign In'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  let content;
  
  if (flow === 'MAIN') {
    content = (
      <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarLarge}>
            <Ionicons name="heart-circle" size={40} color="#fff" />
          </View>
          <Text style={styles.welcomeText}>Care Link</Text>
          <Text style={styles.subHeaderText}>Choose how you'd like to get started</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard} 
            onPress={() => setFlow('SIGNIN')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="log-in" size={24} color="#38496B" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Sign In</Text>
              <Text style={styles.optionDescription}>Already have an account? Sign in here</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CREATE NEW TEAM</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.optionCard} 
            onPress={() => setFlow('CREATE_GROUP')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="person-add" size={24} color="#38496B" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Create New Group</Text>
              <Text style={styles.optionDescription}>Set up a new care team as administrator</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard} 
            onPress={() => setFlow('JOIN_GROUP')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="key" size={24} color="#38496B" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Join Existing Group</Text>
              <Text style={styles.optionDescription}>Use a code to join a care team</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    );
  } else {
    content = (
      <View style={styles.formScreenContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={resetState}>
            <Ionicons name="arrow-back" size={24} color="#38496B" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>
            {flow === 'CREATE_GROUP' ? 'Create New Group' : 
             flow === 'JOIN_GROUP' ? 'Join Care Team' : 'Sign In'}
          </Text>
          <Text style={styles.subHeaderText}>
            {flow === 'CREATE_GROUP' ? 'Set up the patient profile and your admin account' : 
             flow === 'JOIN_GROUP' ? 'Enter the team code to join the care circle' : 
             'Welcome back! Enter your credentials'}
          </Text>
        </View>
        
        {renderAuthForm(
          flow === 'CREATE_GROUP' ? handleCreateGroup : 
          flow === 'JOIN_GROUP' ? handleJoinGroup : handleSignIn
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {content}
        
        {/* Info Modal */}
        <Modal
          visible={infoModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setInfoModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modalContent.title}</Text>
                <TouchableOpacity 
                  onPress={() => setInfoModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDescription}>
                {modalContent.description}
              </Text>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setInfoModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  container: { 
    flexGrow: 1, 
  },
  mainContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  formScreenContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#38496B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeaderText: { 
    fontSize: 16, 
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  dividerText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginHorizontal: 15,
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start',
    marginBottom: 30,
    paddingHorizontal: 5,
    paddingVertical: 8,
  },
  backButtonText: { 
    marginLeft: 8, 
    fontSize: 16, 
    color: '#38496B',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
  },
  inputLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1a1a1a', 
    marginBottom: 8,
    marginTop: 20,
  },
  textInput: {
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#1a1a1a',
  },
  linkText: {
    color: '#38496B',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcc',
    marginTop: 20,
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#38496B',
    padding: 18,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#38496B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});