import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { useFontSize } from '../../contexts/FontSizeContext';
import CustomText from '../../components/CustomText';

export default function AccessibilityScreen({ navigation }) {
  const { fontSize, setFontSize, loading: fontSizeLoading } = useFontSize();
  const [appLoading, setAppLoading] = React.useState(true);

  useEffect(() => {
    setAppLoading(false);
  }, []);

  if (appLoading || fontSizeLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38496B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#38496B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Accessibility</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            
            {/* Text Size Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Text Size</Text>
              
              <View style={styles.textSizeVisual}>
                <Text style={styles.smallText}>Aa</Text>
                <Text style={styles.largeText}>Aa</Text>
              </View>
              
              <Slider
                style={styles.slider}
                minimumValue={11}
                maximumValue={17}
                value={fontSize}
                onValueChange={setFontSize}
                minimumTrackTintColor="#38496B"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#38496B"
                step={1}
              />
              
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Small</Text>
                <Text style={styles.sliderLabel}>Large</Text>
              </View>
            </View>

            {/* Example Text Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Example Text</Text>
              
              <View style={styles.exampleCard}>
                <View style={styles.exampleHeader}>
                    <View style={styles.avatarAndName}>
                        <View style={styles.exampleAvatar}>
                        <CustomText size={1.1} style={styles.avatarText}>
                            C
                        </CustomText>
                        </View>
                        <CustomText size="body" style={styles.userName}>
                        Caregiver Name
                        </CustomText>
                    </View>
                    <CustomText size="caption" style={styles.timeStamp}>
                        Just now
                    </CustomText>
                </View>
                
                <CustomText size="body" style={styles.exampleBody}>
                  This is an example of what a journal entry will look like in the app.
                </CustomText>
              </View>
              
              <Text style={styles.exampleDescription}>
                Adjust the slider above to change text size throughout the app.
              </Text>
            </View>

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#38496B',
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#38496B',
    marginBottom: 16,
  },
  textSizeVisual: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  smallText: {
    fontSize: 11,
    color: '#38496B',
    fontWeight: '600',
  },
  largeText: {
    fontSize: 20,
    color: '#38496B',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  exampleCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  avatarAndName: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exampleAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d9d9d9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#38496B',
    fontWeight: '600',
  },
  userName: {
    fontWeight: '600',
    color: '#38496B',
  },
  timeStamp: {
    color: '#666',
    marginLeft: 8,
  },
  exampleBody: {
    color: '#38496B',
    lineHeight: 21,
  },
  exampleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    fontStyle: 'italic',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionLabel: {
    color: '#38496B',
    fontWeight: '500',
  },
  currentSizeDisplay: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  currentSizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38496B',
  },
});