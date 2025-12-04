import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../config/supabase';
import JournalEntryCard, { tagColors } from '../components/JournalEntryCard'; 
import TopBarLayout from '../components/TopBarLayout';
import dayjs from 'dayjs';
import { useFontSize } from '../contexts/FontSizeContext';
import CustomText from '../components/CustomText';

export default function HomeScreen({ navigation }) {
    const [journalSections, setJournalSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientName, setPatientName] = useState('');

    // Function to group entries by date
    const groupEntriesByDate = (entries) => {
        const grouped = {};
        
        entries.forEach(entry => {
            // Get date string in YYYY-MM-DD format (ignoring time)
            const dateKey = dayjs(entry.date).format('YYYY-MM-DD');
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            
            grouped[dateKey].push(entry);
        });
        
        // Convert to array of sections
        const sections = Object.keys(grouped)
            .sort((a, b) => b.localeCompare(a)) // Sort dates descending (newest first)
            .map(dateKey => {
                const entriesForDate = grouped[dateKey];
                
                // Sort entries within each date by time (newest first)
                entriesForDate.sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                
                return {
                    date: dateKey,
                    title: formatDateHeader(dateKey),
                    data: entriesForDate
                };
            });
        
        return sections;
    };

    // Format date for header display
    const formatDateHeader = (dateString) => {
        const today = dayjs().format('YYYY-MM-DD');
        const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        
        if (dateString === today) {
            return 'Today';
        } else if (dateString === yesterday) {
            return 'Yesterday';
        } else {
            return dayjs(dateString).format('MMMM D');
        }
    };

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
                image_url,
                author:author_id(name)
            `)
            .eq('patient_id', patientId)
            .order('date', { ascending: false });

            if (entriesError) throw entriesError;

            // Add author_name property to each entry
            const formattedEntries = entries.map(e => ({
                ...e,
                author_name: e.author?.name || "Unknown"
            }));

            // Group entries by date
            const sections = groupEntriesByDate(formattedEntries);
            setJournalSections(sections);

        } catch (e) {
            console.error("Home Screen Fetch Error:", e);
            Alert.alert("Data Error", "Could not load journal entries.");
        } finally {
            setLoading(false);
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

    // Render each entry
    const renderEntry = ({ item }) => <JournalEntryCard entry={item} />;

    const renderSectionHeader = ({ section }) => (
        <View style={styles.sectionHeader}>
            <CustomText size="h2" style={styles.sectionHeaderText}>
                {section.title}
            </CustomText>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <CustomText size="body" style={styles.loadingText}>
                    Loading {patientName}'s Journal...
                </CustomText>
            </View>
        );
    }

    return (
        <TopBarLayout>
            <SectionList
                sections={journalSections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEntry}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <CustomText size="h3" style={styles.emptyText}>
                            No entries yet.
                        </CustomText>
                        <CustomText size="body" style={styles.emptySubText}>
                            Tap the '+' to add the first entry.
                        </CustomText>
                    </View>
                )}
            />
        </TopBarLayout>
    );
}

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
    loadingText: {
        marginTop: 10,
        color: '#38496B',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#666',
        fontWeight: 'bold',
    },
    emptySubText: {
        color: '#999',
        marginTop: 5,
    },
    sectionHeader: {
        backgroundColor: '#f9f9f9',
        paddingVertical: 12,
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionHeaderText: {
        fontWeight: '700',
        color: '#38496B',
        letterSpacing: 0.5,
    },
});