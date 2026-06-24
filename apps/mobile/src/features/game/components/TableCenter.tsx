import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME, CARD_COLORS } from '../../../constants/colors';
import { UnoCard } from './UnoCard';
import { CardColor, CardType } from '../../../types';

interface TableCenterProps {
  currentColor: CardColor;
  topCard: { id: string; type: CardType; color: CardColor; value?: number; isWild?: boolean; isWildDrawFour?: boolean };
  onLayoutDiscardPile: (x: number, y: number) => void;
  children?: React.ReactNode; 
}

export function TableCenter({ currentColor, topCard, onLayoutDiscardPile, children }: TableCenterProps) {
  const getColorHex = (c: CardColor) => {
      return CARD_COLORS[c as keyof typeof CARD_COLORS] || THEME.card;
  };

  return (
    <View style={styles.tableArea}>
        <View style={[styles.colorIndicator, { borderColor: getColorHex(currentColor) }]}>
            <Text style={[styles.colorText, { color: getColorHex(currentColor) }]}>
                {currentColor ? currentColor.toUpperCase() : 'ANY'}
            </Text>
        </View>

        <View
            style={styles.discardPileWrapper}
            onLayout={(event) => {
                const { x, y, width } = event.nativeEvent.layout;
                onLayoutDiscardPile(x + width / 2 - 30, y + 160);
            }}
        >
            <UnoCard card={topCard as any} scale={1.3} disabled />
        </View>

        {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tableArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  colorIndicator: {
    position: 'absolute',
    top: 10,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  colorText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  discardPileWrapper: {
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
});
