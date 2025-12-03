// contexts/FontSizeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(14); 
  const [loading, setLoading] = useState(true);

  // Load saved font size on app start
  useEffect(() => {
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const savedSize = await AsyncStorage.getItem('appFontSize');
      if (savedSize) {
        setFontSize(parseInt(savedSize));
      }
    } catch (error) {
      console.error('Error loading font size:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFontSize = async (newSize) => {
    try {
      setFontSize(newSize);
      await AsyncStorage.setItem('appFontSize', newSize.toString());
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  // Helper function to calculate sizes
  const getFontSize = (multiplier = 1.0) => {
    return fontSize * multiplier;
  };

  return (
    <FontSizeContext.Provider value={{ 
      fontSize, 
      setFontSize: updateFontSize,
      getFontSize,
      loading 
    }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => useContext(FontSizeContext);