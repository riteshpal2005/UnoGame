import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { UnoCard } from '../features/game/components/UnoCard';
import { THEME } from '../constants/colors';
import { Card } from '../types';

export default function TestScreen() {

  const topCard: Card = { id: 'x', type: 'wild', color: 'black' };

  const handCards: Card[] = [
    { id: '1', color: 'red', type: 'number', value: 7 },
    { id: '2', color: 'yellow', type: 'skip' },
    { id: '3', color: 'green', type: 'draw2' },
    { id: '4', color: 'black', type: 'wild4' },
    { id: '5', color: 'blue', type: 'number', value: 0 },
    { id: '6', color: 'black', type: 'wild_custom', customText: 'Swap' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>UI Scaling Test</Text>

      { }
      <View style={styles.section}>
        <Text style={styles.label}>1. Table Card (Scale 0.8)</Text>
        <View style={styles.centerBox}>
          <UnoCard card={topCard} scale={0.8} disabled />
        </View>
      </View>

      { }
      <View style={styles.section}>
        <Text style={styles.label}>2. Hand Cards (Scale 0.6)</Text>
        <Text style={styles.subLabel}>Cards should be tiny but text readable</Text>

        <View style={styles.handRow}>
          {handCards.map((card) => (
            <UnoCard key={card.id} card={card} scale={0.6} disabled />
          ))}
        </View>
      </View>

      { }
      <View style={styles.section}>
        <Text style={styles.label}>3. Micro Test (Scale 0.5)</Text>
        <View style={styles.handRow}>
          <UnoCard card={{ id: 'x', type: 'wild', color: 'black' }} scale={0.5} disabled />
          <UnoCard card={{ id: 'y', type: 'number', value: 1, color: 'red' }} scale={0.5} disabled />
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    marginTop: 40,
  },
  section: {
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 16,
  },
  label: {
    fontSize: 18,
    color: THEME.text,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subLabel: {
    fontSize: 12,
    color: THEME.textDim,
    marginBottom: 15,
  },
  centerBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  handRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
  }
});