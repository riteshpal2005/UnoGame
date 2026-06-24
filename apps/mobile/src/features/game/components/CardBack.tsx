import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CardBackProps {
  scale?: number;
}

export const CardBack: React.FC<CardBackProps> = ({ scale = 1 }) => {
  return (
    <View style={[styles.card, { width: 40 * scale, height: 60 * scale }]}>
      <View style={styles.oval}>
        <Text style={[styles.text, { fontSize: 10 * scale }]}>UNO</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
  },
  oval: {
    width: '85%',
    height: '60%',
    backgroundColor: '#e11d48',
    borderRadius: 20,
    transform: [{ rotate: '-25deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '900',
    color: '#fbbf24',
    fontStyle: 'italic',
  }
});