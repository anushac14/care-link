import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export const tagColors = { 
  Mood: '#d7f9d7', // Light Green
  Meal: '#ffe9cc', // Light Orange
  Activity: '#dbeeff', // Light Blue
  Behavior: '#ffd6d6', // Light Red
  Sleep: '#e8dfff', // Light Purple
  Medication: '#dde7ff', // Light Steel Blue
  Appointment: '#fff5d9', // Light Yellow
  General: '#e5e5e5', // Light Gray
};

export default function JournalEntryCard({ entry }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.author}>{entry.author}</Text>
        <Text style={styles.timestamp}>{entry.timeAgo}</Text>
      </View>

      <Text style={styles.text}>{entry.details}</Text>

      {entry.image && (
        <Image source={{ uri: entry.image }} style={styles.image} />
      )}

      <View style={styles.tagsContainer}>
        {entry.tags.map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: tagColors[tag] || '#ccc' }]}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 3,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  author: { fontWeight: 'bold', color: '#333' },
  timestamp: { color: '#999', fontSize: 12 },
  text: { marginVertical: 8, color: '#444' },
  image: { width: '100%', height: 180, borderRadius: 10, marginTop: 6 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: { fontSize: 12, color: '#333' },
});