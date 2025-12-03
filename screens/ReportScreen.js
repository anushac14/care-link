import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, LogBox, Platform } from 'react-native';
import { supabase } from '../config/supabase';
import TopBarLayout from '../components/TopBarLayout';
import CustomText from '../components/CustomText';
import Constants from "expo-constants";
const GEMINI_API_KEY = Constants.expoConfig.extra.GEMINI_API_KEY;

const callApiWithBackoff = async (apiCall, maxRetries = 3) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await apiCall();
        } catch (error) {
            if (attempt === maxRetries - 1) throw error;
            
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

export default function ReportScreen({ navigation }) {
    const [patientData, setPatientData] = useState({ patientId: null, name: null });
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [startDate, setStartDate] = useState(''); // YYYY-MM-DD
    const [endDate, setEndDate] = useState('');   // YYYY-MM-DD
    const [summary, setSummary] = useState(null);

    // --- Data Fetching (Patient ID) ---
    useEffect(() => {
        async function getPatientInfo() {
            setLoading(true);
            const user = (await supabase.auth.getSession()).data.session?.user;
            if (!user) {
                Alert.alert("Error", "User not logged in.");
                navigation.goBack();
                return;
            }

            try {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('patient_id')
                    .eq('user_id', user.id)
                    .single();

                if (userError || !userData) throw userError || new Error("User not linked.");

                const { data: patientData, error: patientError } = await supabase
                    .from('patients')
                    .select('name')
                    .eq('id', userData.patient_id)
                    .single();

                if (patientError) throw patientError;
                
                setPatientData({ patientId: userData.patient_id, name: patientData.name });

            } catch (e) {
                console.error("Error fetching patient details:", e);
                Alert.alert("Error", "Could not load patient details. Cannot generate report.");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        }
        getPatientInfo();
    }, [navigation]);

    const generateSummary = useCallback(async () => {
        if (!patientData.patientId) {
            return Alert.alert("Error", "Patient data is missing.");
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            return Alert.alert("Input Error", "Please use YYYY-MM-DD format for both dates.");
        }
        if (new Date(startDate) > new Date(endDate)) {
            return Alert.alert("Input Error", "Start Date cannot be after End Date.");
        }

        setReportLoading(true);
        setSummary(null); 

        try {
           
            const nextDay = new Date(endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const endDateISO = nextDay.toISOString().substring(0, 10);

            const { data: entries, error: fetchError } = await supabase
                .from('entries')
                .select('date, details, tags') 
                .eq('patient_id', patientData.patientId)
                .gte('date', startDate)
                .lt('date', endDateISO)
                .order('date', { ascending: true });

            if (fetchError) throw fetchError;
            
            if (!entries || entries.length === 0) {
                Alert.alert("No Data", `No journal entries found between ${startDate} and ${endDate}.`);
                setReportLoading(false);
                return;
            }

            const entriesText = entries.map(e => 
                `[${new Date(e.date).toLocaleDateString()}] Tags: ${(e.tags || []).join(', ')} - Details: ${e.details || 'No details'}`
            ).join('\n---\n');

            const apiKey = GEMINI_API_KEY;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

            const systemPrompt = "Act as a compassionate care analyst. You are summarizing journal entries for a dementia patient. Provide a professional, supportive, and concise summary focusing on key trends, behavioral patterns, recurring needs (e.g., sleep, activity), and overall mood observed in the entries. Use bullet points for key findings.";

            const userQuery = `Summarize the following journal entries for patient "${patientData.name}" over the period ${startDate} to ${endDate}. Focus on trends and actionable observations for the caregiver:\n\n-- JOURNAL ENTRIES --\n${entriesText}`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                tools: [{ "google_search": {} }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
            };

            const apiCall = async () => {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorBody)}`);
                }
                return response.json();
            };

            const result = await callApiWithBackoff(apiCall);
            
            // 4. Extract Summary and Sources
            const candidate = result.candidates?.[0];
            let generatedText = "Summary generation failed or returned no text.";
            let sources = [];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                generatedText = candidate.content.parts[0].text;
                
                const groundingMetadata = candidate.groundingMetadata;
                if (groundingMetadata && groundingMetadata.groundingAttributions) {
                    sources = groundingMetadata.groundingAttributions
                        .map(attribution => ({
                            uri: attribution.web?.uri,
                            title: attribution.web?.title,
                        }))
                        .filter(source => source.uri && source.title);
                }
            }
            
            setSummary({ text: generatedText, sources });

        } catch (e) {
            console.error("Report Generation Error:", e);
            Alert.alert('Error', `Failed to generate report: ${e.message}`);
            setSummary({ text: 'Error generating summary. Please check the dates and try again.', sources: [] });
        } finally {
            setReportLoading(false);
        }
    }, [patientData.patientId, patientData.name, startDate, endDate]);

    if (loading && !patientData.name) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <TopBarLayout>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <CustomText size="caption" style={styles.patientInfo}>
                    Generating Report for: {patientData.name || 'Unknown Patient'}
                </CustomText>

                <CustomText size="h4" style={styles.sectionTitle}>
                    Select Date Period (YYYY-MM-DD)
                </CustomText>
                
                <View style={styles.dateRow}>
                    <View style={styles.dateInputContainer}>
                        <CustomText size="body" style={styles.dateLabel}>
                            Start Date
                        </CustomText>
                        <TextInput
                            style={[styles.textInput, { fontSize: 16 }]}
                            placeholder="e.g. 2024-01-01"
                            value={startDate}
                            onChangeText={setStartDate}
                            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                        />
                    </View>
                    <View style={styles.dateInputContainer}>
                        <CustomText size="body" style={styles.dateLabel}>
                            End Date
                        </CustomText>
                        <TextInput
                            style={[styles.textInput, { fontSize: 16 }]}
                            placeholder="e.g. 2024-01-31"
                            value={endDate}
                            onChangeText={setEndDate}
                            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.generateButton, reportLoading && { opacity: 0.6 }]} 
                    onPress={generateSummary}
                    disabled={reportLoading}
                >
                    <CustomText size="h4" style={styles.generateButtonText}>
                        {reportLoading ? 'Generating...' : 'Generate Summary'}
                    </CustomText>
                </TouchableOpacity>

                {/* --- Summary Output Area --- */}
                {reportLoading && (
                    <View style={styles.summaryContainer}>
                        <ActivityIndicator size="small" color="#007bff" />
                        <CustomText size="caption" style={styles.loadingText}>
                            Analyzing entries with Gemini...
                        </CustomText>
                    </View>
                )}

                {summary && !reportLoading && (
                    <View style={styles.summaryContainer}>
                        <CustomText size="h3" style={styles.summaryTitle}>
                            Report Summary ({startDate} to {endDate})
                        </CustomText>
                        <CustomText size="body" style={styles.summaryText}>
                            {summary.text}
                        </CustomText>

                        {summary.sources && summary.sources.length > 0 && (
                            <View style={styles.sourcesContainer}>
                                <CustomText size="small" style={styles.sourcesTitle}>
                                    Grounded Sources (via Google Search):
                                </CustomText>
                                {summary.sources.map((source, index) => (
                                    <CustomText key={index} size="tiny" style={styles.sourceItem}>
                                        • {source.title || source.uri}
                                    </CustomText>
                                ))}
                            </View>
                        )}
                    </View>
                )}
                
                <View style={{ height: 50 }} />
            </ScrollView>
        </TopBarLayout>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' },
    patientInfo: {
        color: '#666',
        textAlign: 'center',
        marginVertical: 10,
        fontWeight: '500',
    },
    sectionTitle: { 
        fontWeight: 'bold', 
        marginVertical: 12,
    },
    dateRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 15,
        gap: 10,
    },
    dateInputContainer: { 
        flex: 1, 
    },
    dateLabel: {
        color: '#333',
        marginBottom: 4,
        fontWeight: '500',
    },
    textInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    generateButton: {
        backgroundColor: '#38496B',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    generateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    // Summary Styles
    summaryContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    summaryTitle: {
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    summaryText: {
        lineHeight: 24,
        color: '#444',
        marginBottom: 15,
    },
    loadingText: {
        marginTop: 8,
        color: '#666',
    },
    sourcesContainer: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    sourcesTitle: {
        fontWeight: '600',
        color: '#666',
        marginBottom: 5,
    },
    sourceItem: {
        color: '#38496B',
        lineHeight: 18,
    }
});