import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
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

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetState = () => {
    setFlow('MAIN');
    setError('');
    setForm(initialFormState);
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

      alert(`Group created successfully! Share this code: ${generatedCode}`);

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

      alert('Successfully joined the care team!');

    } catch (e) {
      setError(e.message || 'Failed to join group. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const renderAuthForm = (onSubmit) => (
    <>
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
      <Text style={styles.inputLabel}>Email (Username)</Text>
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
        placeholder="******"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => updateForm('password', text)}
      />
      {flow === 'CREATE_GROUP' && (
        <>
          <Text style={styles.inputLabel}>Patient's Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., My Father, John Smith"
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
            placeholder="Enter the 6-digit code"
            maxLength={6}
            autoCapitalize="characters"
            value={form.groupCode}
            onChangeText={(text) => updateForm('groupCode', text)}
          />
        </>
      )}
      {error ? <Text style={styles.errorText}>🚨 {error}</Text> : null}
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={onSubmit} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {flow === 'CREATE_GROUP' ? 'Create Group & Sign Up' : flow === 'JOIN_GROUP' ? 'Join Group & Sign Up' : 'Sign In'}
          </Text>
        )}
      </TouchableOpacity>
    </>
  );

  let content;
  
  if (flow === 'MAIN') {
    content = (
      <>
        <Text style={styles.welcomeText}>Welcome to Care Link Journal</Text>
        <Text style={styles.subHeaderText}>Choose your entry point:</Text>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => setFlow('SIGNIN')}
        >
          <Ionicons name="log-in" size={24} color="#007bff" />
          <Text style={styles.secondaryButtonText}>Sign In with Email/Password</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.subHeaderText}>First time joining this patient's team?</Text>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setFlow('CREATE_GROUP')}
        >
          <Ionicons name="people-circle-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>1. Create New Group (Admin)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setFlow('JOIN_GROUP')}
        >
          <Ionicons name="key-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>2. Join Existing Group with Code</Text>
        </TouchableOpacity>
      </>
    );
  } else if (flow === 'CREATE_GROUP') {
    content = (
      <>
        <Text style={styles.title}>Admin Sign Up</Text>
        <Text style={styles.subHeaderText}>Set up the patient profile and your admin account.</Text>
        {renderAuthForm(handleCreateGroup)}
      </>
    );
  } else if (flow === 'JOIN_GROUP') {
    content = (
      <>
        <Text style={styles.title}>Caregiver Sign Up</Text>
        <Text style={styles.subHeaderText}>Enter the team code to join the patient's care circle.</Text>
        {renderAuthForm(handleJoinGroup)}
      </>
    );
  } else if (flow === 'SIGNIN') {
    content = (
        <>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subHeaderText}>Welcome back! Enter your credentials.</Text>
        {renderAuthForm(handleSignIn)}
        </>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {(flow !== 'MAIN') && (
          <TouchableOpacity style={styles.backButton} onPress={resetState}>
            <Ionicons name="arrow-back" size={24} color="#333" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  container: { flexGrow: 1, padding: 20, paddingTop: 50 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButtonText: { marginLeft: 5, fontSize: 16, color: '#333' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  welcomeText: { fontSize: 32, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  subHeaderText: { fontSize: 16, color: '#666', marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 15 },
  textInput: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginTop: 5,
  },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 30 },
  primaryButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007bff',
    marginTop: 20,
  },
  secondaryButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34c759', 
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  }
});