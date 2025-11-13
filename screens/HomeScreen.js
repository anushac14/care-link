import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../config/supabase';
import JournalEntryCard, { tagColors } from '../components/JournalEntryCard'; 
import { Ionicons } from '@expo/vector-icons'; 

const CustomHeader = ({ patientName, onSignOut }) => (
  <View style={headerStyles.customHeaderContainer}>
    <View style={headerStyles.headerContent}>
      <Text style={headerStyles.headerTitle}>{patientName}'s Journal</Text> 
      <Ionicons name="chevron-down" size={16} color="#333" style={{ marginLeft: 4 }} />
    </View>
    
    <TouchableOpacity onPress={onSignOut} style={headerStyles.signOutButton}>
        <Ionicons name="log-out-outline" size={24} color="#333" /> 
    </TouchableOpacity>
  </View>
);

export default function HomeScreen({ navigation }) {
    const [journalEntries, setJournalEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientName, setPatientName] = useState('My');

    const fetchJournalData = async () => {
        setLoading(true);
        const user = (await supabase.auth.getSession()).data.session?.user;
        if (!user) {
            setLoading(false);
            return; 
        }

        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('patient_id')
                .eq('user_id', user.id)
                .single();

            if (userError || !userData) throw userError || new Error("User not linked to patient.");

            const patientId = userData.patient_id;

            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('name')
                .eq('id', patientId)
                .single();

            if (patientError) throw patientError;
            setPatientName(patientData.name);

            const { data: entries, error: entriesError } = await supabase
            .from('entries')
            .select(`
                id, 
                date, 
                details, 
                tags, 
                author_id,
                image_url
            `)
            .eq('patient_id', patientId)
            .order('date', { ascending: false });

            if (entriesError) throw entriesError;
            setJournalEntries(entries);

        } catch (e) {
            console.error("Home Screen Fetch Error:", e);
            Alert.alert("Data Error", "Could not load journal entries.");
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


    useEffect(() => {
    fetchJournalData();
    
    const channel = supabase
        .channel('entries_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, (payload) => {
            console.log('Change received via Realtime!', payload);
            fetchJournalData(); 
        })
        .subscribe();
        
    const focusListener = navigation.addListener('focus', () => {
        console.log('Screen focused, running fresh data fetch.');
        fetchJournalData();
    });

    return () => {
        supabase.removeChannel(channel);
        focusListener(); 
    };
}, [navigation]);


    const renderEntry = ({ item }) => <JournalEntryCard entry={item} />;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={{ marginTop: 10 }}>Loading {patientName}'s Journal...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomHeader patientName={patientName} onSignOut={handleSignOut} />
            
            <FlatList
                data={journalEntries}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEntry}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No entries yet.</Text>
                        <Text style={styles.emptySubText}>Tap the '+' to add the first entry.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}


const headerStyles = StyleSheet.create({
    customHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    signOutButton: {
        padding: 5,
    },
});

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        fontWeight: 'bold',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 30,
        backgroundColor: '#007bff',
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabText: {
        fontSize: 30,
        color: 'white',
        lineHeight: 30,
    },
});