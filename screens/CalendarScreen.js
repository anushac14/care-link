import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs'; 
import { supabase } from '../config/supabase';
import TopBarLayout from '../components/TopBarLayout';

// Import the same tagColors from JournalEntryCard
const tagColors = {
    Mood: '#D9E7B9',
    Sleep: '#E2D2F3',
    Medication: '#D2DFFF',
    Activity: '#D2EBF3',
    Meal: '#FBD9A6',
    Behavior: '#FFCBCC',
    Appointment: '#FEEBB8'
};

const INITIAL_DATE = dayjs().format('YYYY-MM-DD');

export default function CalendarScreen({ navigation }) {
    const [viewDate, setViewDate] = useState(dayjs(INITIAL_DATE));
    const [selectedDate, setSelectedDate] = useState(INITIAL_DATE);
    
    const [dayEntries, setDayEntries] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [patientId, setPatientId] = useState(null);
    const [patientName, setPatientName] = useState('');

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
                    
                    const { data: patientData, error: patientError } = await supabase
                        .from('patients')
                        .select('name')
                        .eq('id', userData.patient_id)
                        .single();
                    
                    if (patientError) throw patientError;
                    
                    if (patientData) {
                        setPatientName(patientData.name);
                    }
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

    const getInitials = (name) => {
        if (!name) return "??";
        const parts = name.trim().split(" ");
        return parts.length === 1
            ? parts[0][0].toUpperCase()
            : (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const renderEntry = (entry) => {
        const authorName = entry.author?.name || 'Caregiver';
        
        return (
            <View key={entry.id} style={calendarStyles.card}>
                {/* HEADER (Avatar + Name + Time) */}
                <View style={calendarStyles.headerRow}>
                    <View style={calendarStyles.avatar}>
                        <Text style={calendarStyles.avatarText}>
                            {getInitials(authorName)}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={calendarStyles.name}>{authorName}</Text>
                    </View>
                    <Text style={calendarStyles.time}>
                        {dayjs(entry.date).format('h:mm a')} {/* Actual clock time */}
                    </Text>
                </View>

                {/* ENTRY IMAGE (if exists) */}
                {entry.image_url && (
                    <Image
                        source={{ uri: entry.image_url }}
                        style={calendarStyles.entryImage}
                        resizeMode="cover"
                        onError={(e) =>
                            console.error("Image Load Error:", e.nativeEvent.error)
                        }
                    />
                )}

                {/* ENTRY TEXT */}
                <Text style={[calendarStyles.details, calendarStyles.bodyIndent]}>
                    {entry.details}
                </Text>

                {/* TAGS */}
                <View style={[calendarStyles.tagsContainer, calendarStyles.bodyIndent]}>
                    {entry.tags?.map((tag) => (
                        <View
                            key={tag}
                            style={[
                                calendarStyles.tag,
                                { backgroundColor: tagColors[tag] || '#eee' },
                            ]}
                        >
                            <Text style={calendarStyles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <TopBarLayout>
            <ScrollView style={calendarStyles.container}>
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
        </TopBarLayout>
    );
}

// --- Styles (updated to match JournalEntryCard) ---

const calendarStyles = StyleSheet.create({
    container: { 
        paddingHorizontal: 15, 
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    
    // Month Navigator Styles
    monthNavigator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        marginHorizontal: -15,
        paddingHorizontal: 15,
    },
    navButton: { padding: 5 },
    currentMonth: {
        fontSize: 18,
        fontWeight: '600',
        color: '#38496B',
    },
    
    // Calendar Grid Styles
    calendarHeaders: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        backgroundColor: '#fff',
        marginHorizontal: -15,
        paddingHorizontal: 15,
        paddingBottom: 10,
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
        backgroundColor: '#fff',
        marginHorizontal: -15,
        paddingHorizontal: 15,
        marginBottom: 10,
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
    
    // Entry List Header
    dayHeaderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#38496B',
        letterSpacing: 0.5,
        marginBottom: 16,
        marginTop: 10,
    },
    
    // Entry Card Styles (matching JournalEntryCard)
    card: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginBottom: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    
    /* HEADER */
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 21,
        backgroundColor: "#d9d9d9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    time: {
        fontSize: 13,
        color: "#888",
    },
    
    /* IMAGE */
    entryImage: {
        width: "100%",
        height: 180,
        borderRadius: 10,
        marginBottom: 12,
        marginTop: 4,
    },
    
    bodyIndent: {
        paddingLeft: 42,
    },
    
    /* TEXT */
    details: {
        fontSize: 15,
        color: '#333',
        lineHeight: 20,
        marginBottom: 10,
    },
    
    /* TAGS */
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 6,
    },
    tag: {
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 18,
        marginRight: 7,
        marginBottom: 7,
    },
    tagText: {
        fontSize: 12.5,
        color: "#333",
        fontWeight: "500",
    },
    
    emptyState: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
        fontSize: 16,
    }
});