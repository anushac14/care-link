import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the avatar initials
import JournalEntryCard from '../components/JournalEntryCard';
import mockEntries from '../data/mockEntries';
import { format } from 'date-fns';

const CustomHeader = () => (
  <View style={headerStyles.customHeaderContainer}>
    <View style={headerStyles.headerContent}>
      <Text style={headerStyles.headerTitle}>[Patient Name]'s Journal</Text>
      <Ionicons name="chevron-down" size={16} color="#333" style={{ marginLeft: 4 }} />
    </View>
    <View style={headerStyles.avatar}>
      <Text style={headerStyles.avatarText}>JK</Text>
    </View>
  </View>
);

const headerStyles = StyleSheet.create({
  customHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0, 
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ccc', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

const groupEntriesByDate = (entries) => {
  const grouped = {};
  entries.forEach(entry => {
    const dateKey = format(new Date(entry.date), 'MMMM d'); 
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(entry);
  });
  
  return Object.keys(grouped).map(date => ({
    type: 'dateHeader',
    date: date,
    id: `header-${date}`,
  })).flatMap(header => [
    header, 
    ...grouped[header.date].sort((a, b) => new Date(b.date) - new Date(a.date))
  ]);
};


const DateHeader = ({ date }) => {
  const todayFormatted = format(new Date(), 'MMMM d');
  const displayDate = date === todayFormatted ? `Today\n${date}` : date; 

  return (
    <View style={dateHeaderStyles.container}>
      {date === todayFormatted && (
        <Text style={dateHeaderStyles.todayText}>Today</Text>
      )}
      <Text style={dateHeaderStyles.dateText}>{date}</Text>
    </View>
  );
};

const dateHeaderStyles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  todayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: -5, 
  },
  dateText: {
    fontSize: 20, 
    color: '#666',
    fontWeight: 'normal',
  }
});


export default function HomeScreen({ navigation }) {
  const [entries, setEntries] = useState(mockEntries);
  const groupedData = groupEntriesByDate(entries);

  const renderItem = ({ item }) => {
    if (item.type === 'dateHeader') {
      return <DateHeader date={item.date} />;
    }
    return <JournalEntryCard entry={item} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader />
      <FlatList
        data={groupedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110, 
  }
});