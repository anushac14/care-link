import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs'; 
import { supabase } from '../config/supabase';

const INITIAL_DATE = dayjs().format('YYYY-MM-DD'); 
const PATIENT_NAME_PLACEHOLDER = "Brian"; 

const Tag = ({ text, color }) => (
    <View style={[calendarStyles.tag, { backgroundColor: color || '#eee' }]}>
        <Text style={calendarStyles.tagText}>{text}</Text>
    </View>
);

export default function CalendarScreen({ navigation }) {
    const [viewDate, setViewDate] = useState(dayjs(INITIAL_DATE));
    const [selectedDate, setSelectedDate] = useState(INITIAL_DATE);
    
    const [dayEntries, setDayEntries] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [patientId, setPatientId] = useState(null);

    useEffect(() => {
        const loadPatient = async () => {
            const user = (await supabase.auth.getSession()).data.session?.user;
            if (!user) {
                navigation.navigate('Auth'); 
                return;
            }
            try {
                const { data: userData } = await supabase
                    .from('users')
                    .select('patient_id')
                    .eq('user_id', user.id)
                    .single();
                
                if (userData) {
                    setPatientId(userData.patient_id);
                }
            } catch (e) {
                console.error("Calendar Screen Load Error:", e);
                Alert.alert("Error", "Could not link to patient data.");
            }
        };
        loadPatient();
    }, [navigation]);

    useEffect(() => {
        if (!patientId || !selectedDate) return;
        
        const fetchEntriesForDate = async () => {
            setLoading(true);
            
            const selectedDayjs = dayjs(selectedDate);
            
            const localStart = selectedDayjs.startOf('day'); 
            const localEnd = selectedDayjs.endOf('day');

            const startBoundary = localStart.toISOString(); 
            const endBoundary = localEnd.toISOString();     

            console.log(`Fetching entries for: ${selectedDate}`);
            console.log(`Querying between: ${startBoundary} and ${endBoundary}`);

            try {
                const { data: entries, error } = await supabase
                    .from('entries')
                    .select(`
                        id, details, date, tags, image_url, 
                        author:users (name)
                    `)
                    .eq('patient_id', patientId)
                    .gte('date', startBoundary) 
                    .lte('date', endBoundary)
                    .order('date', { ascending: false });

                if (error) throw error;
                
                setDayEntries(entries);
            } catch (e) {
                console.error("Calendar Fetch Error:", e);
                setDayEntries([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchEntriesForDate();
    }, [selectedDate, patientId]); 

    const startOfMonth = viewDate.startOf('month');
    const endOfMonth = viewDate.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');
    const endOfWeek = endOfMonth.endOf('week');
    
    let days = [];
    let day = startOfWeek;
    while (day.isBefore(endOfWeek)) {
        days.push(day);
        day = day.add(1, 'day');
    }
    
    const handleDayPress = (date) => {
        if (dayjs(date).isValid()) {
            setSelectedDate(date.format('YYYY-MM-DD'));
        }
    };

    const changeMonth = (direction) => {
        setViewDate(viewDate.add(direction === 'forward' ? 1 : -1, 'month'));
    };

    const renderEntry = (entry) => {
        const authorName = entry.author?.name || 'Caregiver';
        const initials = authorName.match(/\b\w/g).join('').substring(0, 2).toUpperCase();
        
        return (
            <View key={entry.id} style={calendarStyles.entryCard}>
                <View style={calendarStyles.entryHeader}>
                    <View style={calendarStyles.entryAvatar}>
                        <Text style={calendarStyles.avatarText}>{initials}</Text>
                    </View>
                    <View style={calendarStyles.entryMeta}>
                        <Text style={calendarStyles.entryAuthor}>{authorName}</Text>
                        <Text style={calendarStyles.entryTime}>
                            {dayjs(entry.date).format('h:mm a')}
                        </Text>
                    </View>
                </View>
                <Text style={calendarStyles.entryDetails}>{entry.details}</Text>
                {entry.tags && entry.tags.map(tag => (
                    <Tag key={tag} text={tag} />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={calendarStyles.safeArea}>
            <ScrollView style={calendarStyles.container}>
                {/* Header */}
                <View style={calendarStyles.appHeader}>
                    <Text style={calendarStyles.patientName}>{PATIENT_NAME_PLACEHOLDER}'s Journal</Text>
                    <View style={calendarStyles.avatar}>
                        <Text style={calendarStyles.avatarText}>JS</Text> 
                    </View>
                </View>

                {/* Month Navigation */}
                <View style={calendarStyles.monthNavigator}>
                    <TouchableOpacity onPress={() => changeMonth('back')} style={calendarStyles.navButton}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={calendarStyles.currentMonth}>{viewDate.format('MMMM YYYY')}</Text>
                    <TouchableOpacity onPress={() => changeMonth('forward')} style={calendarStyles.navButton}>
                        <Ionicons name="chevron-forward" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                
                {/* Calendar Grid Headers */}
                <View style={calendarStyles.calendarHeaders}>
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <Text key={day} style={calendarStyles.dayHeader}>{day}</Text>
                    ))}
                </View>

                {/* Calendar Grid Dates */}
                <View style={calendarStyles.calendarGrid}>
                    {days.map((day, index) => {
                        const dateString = day.format('YYYY-MM-DD');
                        const isSelected = dateString === selectedDate;
                        const isCurrentMonth = day.isSame(viewDate, 'month');

                        return (
                            <TouchableOpacity 
                                key={index}
                                style={[
                                    calendarStyles.dateCell, 
                                    isSelected && calendarStyles.selectedCell,
                                    !isCurrentMonth && calendarStyles.disabledCell,
                                ]}
                                onPress={() => handleDayPress(day)}
                                disabled={!isCurrentMonth}
                            >
                                <Text style={[
                                    calendarStyles.dateText, 
                                    isSelected && calendarStyles.selectedText,
                                    !isCurrentMonth && calendarStyles.disabledText,
                                ]}>
                                    {day.date()}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                
                {/* Entry List Header */}
                <Text style={calendarStyles.dayHeaderTitle}>
                    {dayjs(selectedDate).format('dddd, MMMM D')}
                </Text>

                {/* Dynamic Entry List */}
                {loading && <ActivityIndicator size="small" color="#007bff" style={{ marginVertical: 20 }} />}
                
                {!loading && dayEntries && dayEntries.length === 0 && (
                    <Text style={calendarStyles.emptyState}>No entries found for this day.</Text>
                )}
                
                {!loading && dayEntries && dayEntries.length > 0 && dayEntries.map(renderEntry)}
                
                <View style={{ height: 100 }} /> 
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles ---

const calendarStyles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { paddingHorizontal: 15, flex: 1 },
    
    // App Header Styles
    appHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    patientName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    
    // Month Navigator Styles
    monthNavigator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    navButton: { padding: 5 },
    currentMonth: {
        fontSize: 18,
        fontWeight: '600',
    },
    
    // Calendar Grid Styles
    calendarHeaders: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
    },
    dayHeader: {
        width: '14.2%',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: 10,
    },
    dateCell: {
        width: '14.2%', 
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
    },
    dateText: {
        fontSize: 14,
        color: '#333',
    },
    selectedCell: {
        backgroundColor: '#007bff',
        borderRadius: 20,
    },
    selectedText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    disabledCell: {
        opacity: 0.5,
    },
    disabledText: {
        color: '#999',
    },
    
    // Entry List Styles
    dayHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 15,
        paddingTop: 5,
    },
    entryCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    entryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    entryAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#6b21a8', 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    entryMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-between',
    },
    entryAuthor: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    entryTime: {
        fontSize: 12,
        color: '#666',
    },
    entryDetails: {
        fontSize: 16,
        marginBottom: 8,
    },
    tag: {
        backgroundColor: '#ffdddd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
        alignSelf: 'flex-start',
    },
    tagText: {
        fontSize: 12,
        color: '#cc0000',
        fontWeight: '500',
    },
    emptyState: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    }
});