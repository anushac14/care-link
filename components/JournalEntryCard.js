import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const tagColors = {
    Mood: '#42B826',
    Sleep: '#957CF4',
    Medication: '#1050DC',
    Activity: '#85BEFF',
    Meal: '#F3932C',
    Behavior: '#DE3627',
    Appointment: '#EEB62B'
};

export default function JournalEntryCard({ entry }) {
    const timeAgo = dayjs(entry.date).fromNow();

    const getInitials = (name) => {
        if (!name) return "??";
        const parts = name.trim().split(" ");
        return parts.length === 1
            ? parts[0][0].toUpperCase()
            : (parts[0][0] + parts[1][0]).toUpperCase();
    };

    return (
        <View style={styles.card}>

            {/* ------------- HEADER (Avatar + Name + Time) ------------- */}
            <View style={styles.headerRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {getInitials(entry.author_name)}
                    </Text>
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{entry.author_name}</Text>
                </View>

                <Text style={styles.time}>
                    {timeAgo}
                </Text>
            </View>

            {/* ------------- ENTRY IMAGE (if exists) ------------- */}
            {entry.image_url && (
                <Image
                    source={{ uri: entry.image_url }}
                    style={styles.entryImage}
                    resizeMode="cover"
                    onError={(e) =>
                        console.error("Image Load Error:", e.nativeEvent.error)
                    }
                />
            )}

            {/* ------------- ENTRY TEXT ------------- */}
            <Text style={[styles.details, styles.bodyIndent]}>
                {entry.details}
            </Text>

            {/* ------------- TAGS ------------- */}
            <View style={[styles.tagsContainer, styles.bodyIndent]}>
                {entry.tags?.map((tag) => (
                    <View
                        key={tag}
                        style={[
                            styles.tag,
                            { backgroundColor: tagColors[tag] || tagColors.General },
                        ]}
                    >
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>
                ))}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        paddingHorizontal: 12,
        paddingVertical: 16,
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
        marginBottom: 6,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 21,
        backgroundColor: "#38496B",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#fff",
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
    time: {
        fontSize: 13,
        color: "#888",
        paddingRight: 8,
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
        paddingLeft: 40,
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
        paddingVertical:6,
        borderRadius: 18,
        marginRight: 7,
        marginBottom: 7,
    },
    tagText: {
        fontSize: 13,
        color: "#fff",
        fontWeight: "500",
    },
});
