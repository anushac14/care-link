import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const tagColors = {
    Mood: '#a3e635',       // Lime
    Sleep: '#38bdf8',      // Sky
    Medication: '#facc15', // Amber
    Activity: '#4ade80',   // Emerald
    Meal: '#fb923c',       // Orange
    Behavior: '#f87171',   // Red
    Appointment: '#a78bfa',// Violet
    General: '#94a3b8',    // Slate
};


export default function JournalEntryCard({ entry }) {
    const timeAgo = dayjs(entry.date).fromNow();

    return (
        <View style={styles.card}>
            {entry.image_url && (
                <Image 
                    source={{ uri: entry.image_url }} 
                    style={styles.entryImage} 
                    resizeMode="cover"
                    onError={(e) => console.error("Image Card Load Error:", e.nativeEvent.error)}
                />
            )}
            
            <Text style={styles.details}>{entry.details}</Text>

            <View style={styles.tagsContainer}>
                {entry.tags && entry.tags.map((tag) => (
                    <View 
                        key={tag} 
                        style={[styles.tag, { backgroundColor: tagColors[tag] || tagColors['General'] }]}
                    >
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>
                ))}
            </View>
            
            <Text style={styles.timestamp}>Posted {timeAgo}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        marginBottom: 10,
        elevation: 2, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    entryImage: {
        width: '100%', 
        height: 200, 
        borderRadius: 8,
        marginBottom: 12,
    },
    details: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        lineHeight: 22,
    },
    tagsContainer: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        marginBottom: 8 
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: { 
        fontSize: 12, 
        color: '#333',
        fontWeight: '500',
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    }
});