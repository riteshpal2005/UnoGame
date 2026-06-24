import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { UnoCard } from './UnoCard';
import { Card } from '../../../types';

interface PlayerHandProps {
  cards: Card[];
  isMyTurn: boolean;
  onCardPress: (cardId: string) => void;
  selectedCardIds: string[];
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ 
  cards, isMyTurn, onCardPress, selectedCardIds 
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.map((card, index) => {
          const isSelected = selectedCardIds.includes(card.id);
          
          return (
            <View 
              key={card.id} 
              style={[
                styles.cardWrapper, 
                { marginLeft: index === 0 ? 0 : -30 }, 
                isSelected && { transform: [{ translateY: -20 }] } 
              ]}
            >
              <UnoCard 
                card={card} 
                scale={1} 
                onPress={() => isMyTurn && onCardPress(card.id)}
                disabled={!isMyTurn}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 160, marginBottom: 20 },
  scrollContent: { paddingHorizontal: 20, alignItems: 'center' },
  cardWrapper: { 
    padding: 5,
    elevation: 5,
  },
});