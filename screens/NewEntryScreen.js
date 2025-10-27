import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Platform, Alert, LogBox } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import 'react-native-get-random-values';
import { tagColors } from '../components/JournalEntryCard';
import { supabase } from '../config/supabase';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const TAGS = ['Mood', 'Sleep', 'Medication', 'Activity', 'Meal', 'Behavior', 'Appointment', 'General'];

async function uploadImage(imageUri, userId) {
  if (!imageUri) return null;

  const fileExt = imageUri.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const filePath = `entries/${fileName}`;

  try {
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('journal-images')
      .upload(filePath, fileData, {
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('journal-images').getPublicUrl(filePath);
    return data.publicUrl;

  } catch (e) {
    console.error("Supabase Upload Error:", e);
    Alert.alert("Upload Failed", `Could not upload image: ${e.message}`);
    throw e;
  }
}


export default function NewEntryScreen({ navigation }) {
    const [selectedTags, setSelectedTags] = useState([]);
    const [details, setDetails] = useState('');
    const [image, setImage] = useState(null);
    const [patientData, setPatientData] = useState({ patientId: null, name: null });
    const [loading, setLoading] = useState(true);

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
                Alert.alert("Error", "Could not load patient details. Cannot save entry.");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        }
        getPatientInfo();
    }, [navigation]);


    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const pickImage = async () => {
    let { status: currentStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    if (currentStatus !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (newStatus !== 'granted') {
            Alert.alert(
                "Permission Required", 
                "Please grant access to your photo library in your device settings to select an image."
            );
            return;
        }
        currentStatus = newStatus;
    }

    if (currentStatus === 'granted') {
        console.log("DEBUG: Permissions granted. Attempting to launch image library via setTimeout.");
        
        setTimeout(async () => {
            try {
                const result = await ImagePicker.launchImageLibraryAsync({ 
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.7, 
                });

                if (!result.canceled && result.assets && result.assets.length > 0) {
                    const selectedUri = result.assets[0].uri;
                    setImage(selectedUri);
                    console.log("DEBUG: Image URI Set:", selectedUri);
                } else if (result.canceled) {
                    console.log("DEBUG: Image selection canceled.");
                } else {
                    console.error("DEBUG: Image picker returned no assets.");
                }
            } catch (error) {
                console.error("ImagePicker failed to launch:", error);
                Alert.alert("Error", "The image picker failed to open.");
            }
        }, 0); 
    }
};

    const saveEntry = async () => {
        if (!patientData.patientId) return Alert.alert("Error", "Cannot save without patient ID.");
        if (details.trim() === '' && !image) return Alert.alert("Warning", "Entry cannot be empty.");

        setLoading(true);

        try {
            const user = (await supabase.auth.getSession()).data.session?.user;
            if (!user) throw new Error("User not authenticated.");

            let imageUrl = null;
            if (image) {
                imageUrl = await uploadImage(image, user.id); 
            }
            
            const entryData = {
                patient_id: patientData.patientId,
                author_id: user.id,
                details: details.trim(),
                tags: selectedTags,
                image_url: imageUrl, 
            };
            
            const { error } = await supabase
                .from('entries')
                .insert([entryData]);

            if (error) throw error;
            
            Alert.alert('Success', 'Journal entry saved successfully!');
            navigation.goBack();

        } catch (e) {
            console.error("Final Save Error:", e);
            if (e.message && e.message.includes('User not authenticated')) {
                 Alert.alert('Error', 'Session expired. Please sign in again.');
            } else if (!e.message.includes('Upload Failed')) {
                 Alert.alert('Error', `Failed to save entry: ${e.message}`);
            }
        } finally {
            setLoading(false);
        }
    };


    const Header = () => (
        <View style={headerStyles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={headerStyles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={headerStyles.headerTitle}>New Entry</Text>
            <TouchableOpacity onPress={saveEntry} disabled={loading}>
                <Text style={[headerStyles.headerButtonText, headerStyles.saveText, loading && { opacity: 0.5 }]}>
                    {loading ? 'Saving...' : 'Save'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !patientData.name) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <Header />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.patientInfo}>
                    Posting to: **{patientData.name || 'Unknown Patient'}**'s Journal
                </Text>

                <Text style={styles.sectionTitle}>Select Tags</Text>
                <View style={styles.tagsContainer}>
                    {TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        const tagStyle = {
                            backgroundColor: isSelected ? tagColors[tag] : '#eee',
                            borderColor: isSelected ? tagColors[tag] : '#eee',
                            borderWidth: 1,
                        };

                        return (
                            <TouchableOpacity
                                key={tag}
                                style={[styles.tag, tagStyle]}
                                onPress={() => toggleTag(tag)}
                            >
                                <Text style={styles.tagText}>{tag}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.sectionTitle}>Add Details</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Add more details here..."
                    value={details}
                    onChangeText={setDetails}
                    multiline
                />

                <Text style={styles.sectionTitle}>Add Photo (Optional)</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={loading}>
                    {image ? (
                        <Image 
                            source={{ uri: image }} 
                            style={styles.image} 
                            // Add an error handler for rendering issues
                            onError={(e) => console.error("DEBUG: Image Rendering Error:", e.nativeEvent.error)}
                        />
                    ) : (
                        <Text style={styles.plusSign}>+</Text>
                    )}
                </TouchableOpacity>
                {image && <Text style={{fontSize: 10, color: '#666', marginTop: 5}}>URI: {image.substring(0, 70)}...</Text>}
                
                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const headerStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 44,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontWeight: '600',
        fontSize: 17,
    },
    headerButtonText: {
        fontSize: 17,
        color: '#007bff',
    },
    saveText: {
        fontWeight: 'bold',
    },
});


const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' },
    patientInfo: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginVertical: 10,
        fontWeight: '500',
    },
    sectionTitle: { fontWeight: 'bold', marginVertical: 12, fontSize: 16 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: { fontSize: 13, color: '#333' },
    textInput: {
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 10,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    imagePicker: {
        width: 100,
        height: 100,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
    },
    plusSign: {
        fontSize: 30,
        color: '#ccc',
    },
    image: { width: '100%', height: '100%', borderRadius: 10 },
});