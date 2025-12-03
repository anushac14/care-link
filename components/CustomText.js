// components/CustomText.js - USE THIS VERSION
import React from 'react';
import { Text } from 'react-native';
import { useFontSize } from '../contexts/FontSizeContext';

const CustomText = ({ 
  style, 
  size = 1.0,
  children, 
  ...props 
}) => {
  const { getFontSize } = useFontSize();
  
  const sizeMultipliers = {
    'h1': 1.8,
    'h2': 1.5,
    'h3': 1.3,
    'h4': 1.1,
    'body': 1.0,
    'caption': 0.85,
    'small': 0.75,
    'tiny': 0.65,
  };
  
  const multiplier = typeof size === 'string' 
    ? (sizeMultipliers[size] || 1.0)
    : size;

  return (
    <Text
      style={[
        { fontSize: getFontSize(multiplier) },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default CustomText;