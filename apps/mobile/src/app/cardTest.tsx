import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UnoCard } from '../features/game/components/UnoCard';
import { CardBack } from '../features/game/components/CardBack';
import { CardColor, CardType } from '../types';
import { useGameStore } from '../features/game/store';
import { THEME } from '../constants/colors';
import { useRouter } from 'expo-router';

const COLORS = {
  bg: '#0f172a',
  card: '#1e293b',
  primary: '#e11d48',
  secondary: '#3b82f6',
  text: '#f8fafc',
  textDim: '#94a3b8',
  border: '#334155',
};

export default function CardTestScreen() {
  const router = useRouter();
  const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];
  const actionTypes: CardType[] = ['skip', 'reverse', 'draw2'];
  const wildTypes: CardType[] = ['wild', 'wild4', 'wild_shuffle'];

  const { customRules } = useGameStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={THEME.bg} />

      { }
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textDim} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="test-tube" size={20} color={THEME.primary} />
          <Text style={styles.title}>Card Design Lab</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        { }
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="cards-playing-outline" size={18} color={THEME.secondary} />
          <Text style={styles.sectionTitle}>Card Assets</Text>
        </View>
        <View style={styles.row}>
          <CardBack scale={0.8} />
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Standard</Text>
            <Text style={styles.infoSub}>Back Face</Text>
          </View>
        </View>

        { }
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="numeric" size={18} color={THEME.secondary} />
          <Text style={styles.sectionTitle}>Number Cards</Text>
        </View>
        <View style={styles.row}>
          {colors.map((c) => (
            <UnoCard key={c} card={{ id: 'test', color: c, type: 'number', value: 7 }} scale={0.8} />
          ))}
        </View>

        { }
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="flash" size={18} color={THEME.secondary} />
          <Text style={styles.sectionTitle}>Action Cards</Text>
        </View>

        {actionTypes.map((type) => (
          <View key={type} style={styles.subSection}>
            <Text style={styles.label}>{type.toUpperCase()}</Text>
            <View style={styles.row}>
              {colors.map((c) => (
                <UnoCard key={c + type} card={{ id: 'test', color: c, type: type }} scale={0.8} />
              ))}
            </View>
          </View>
        ))}

        { }
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="star-four-points" size={18} color={THEME.secondary} />
          <Text style={styles.sectionTitle}>Wild & Special</Text>
        </View>
        <View style={styles.row}>
          { }
          {wildTypes.map((type) => (
            <UnoCard key={type} card={{ id: 'test', color: 'black', type: type }} scale={0.8} />
          ))}

          { }
          {customRules.map((rule, index) => (
            <UnoCard
              key={`custom-${index}`}
              card={{
                id: 'test',
                color: 'black',
                type: 'wild_custom',
                customText: rule || "Custom Rule"
              }}
              scale={0.8}
            />
          ))}
          { }
          {customRules.length === 0 && (
            <UnoCard
              card={{ id: 'test', color: 'black', type: 'wild_custom', customText: "Sample Rule" }}
              scale={0.8}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.bg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 5,
  },
  backText: {
    color: THEME.textDim,
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text
  },

  content: {
    padding: 20,
    paddingBottom: 50
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 25,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: THEME.border,
    paddingBottom: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  subSection: {
    marginBottom: 20
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.textDim,
    marginBottom: 10,
    marginLeft: 5,
    letterSpacing: 1
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center'
  },

  infoCard: {
    height: 120,
    width: 85,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    backgroundColor: THEME.card,
    borderStyle: 'dashed'
  },
  infoText: {
    color: THEME.text,
    fontWeight: 'bold',
  },
  infoSub: {
    color: THEME.textDim,
    fontSize: 10
  }
});