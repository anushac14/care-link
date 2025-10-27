import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { tagColors } from '../components/JournalEntryCard';

const TAGS = ['Mood', 'Sleep', 'Medication', 'Activity', 'Meal', 'Behavior', 'Appointment', 'General'];

export default function NewEntryScreen({ navigation }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [details, setDetails] = useState('');
  const [image, setImage] = useState(null);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const saveEntry = () => {
    navigation.goBack();
  };

  const Header = () => (
    <View style={headerStyles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={headerStyles.headerButtonText}>Cancel</Text>
      </TouchableOpacity>
      <Text style={headerStyles.headerTitle}>New Entry</Text>
      <TouchableOpacity onPress={saveEntry}>
        <Text style={[headerStyles.headerButtonText, headerStyles.saveText]}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

        <Text style={styles.sectionTitle}>Add Photo</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.plusSign}>+</Text>
          )}
        </TouchableOpacity>

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