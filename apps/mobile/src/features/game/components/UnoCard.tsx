import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../../types';
import { THEME, CARD_COLORS } from '../../../constants/colors';

interface UnoCardProps {
  card: Card;
  onPress?: () => void;
  scale?: number;
  disabled?: boolean;
}

export const UnoCard: React.FC<UnoCardProps> = ({ 
  card, onPress, scale = 1, disabled = false 
}) => {

  const W = 80 * scale;
  const H = 120 * scale;
  
  const OVAL_W = W * 0.65; 
  const OVAL_H = H * 0.43; 

  const FONT_XL = 34 * scale;
  const FONT_LG = 24 * scale;
  
  const FONT_SM = 19 * scale;  
  const FONT_XS = 9 * scale;
  
  const ICON_LG = 32 * scale;
  const ICON_SM = 16 * scale;
  
  const RADIUS = 8 * scale;
  const BORDER = 2 * scale;
  
  const CORNER_OFFSET = 6 * scale;

  const mainIconSize = 36; 

  const getCardColor = () => {
    if (card.color === 'black') return CARD_COLORS.black;
    return CARD_COLORS[card.color] || THEME.card;
  };

  const color = card.color === 'black' ? 'black' : getCardColor();
  const contrast = card.color === 'black' ? 'white' : color;

  const renderSymbol = () => {
    if (card.type === 'number') {
      return (
        <Text style={[styles.textBase, { fontSize: FONT_XL, color: card.color === 'black' ? 'white' : CARD_COLORS[card.color] }]}>
          {card.value}
        </Text>
      );
    }

    const iconColor = card.color === 'black' ? 'black' : CARD_COLORS[card.color];


    if (card.type === 'wild_shuffle') {
      return (
        <View style={{alignItems: 'center'}}>
          <MaterialCommunityIcons name="shuffle-variant" size={24 * scale} color="black" style={styles.iconShadow} />
        </View>
      );
    }

    if (card.type === 'wild_custom') {
       if (card.customText === "Shuffle Hands") {
          return (
            <View style={{alignItems: 'center'}}>
              <MaterialCommunityIcons name="shuffle-variant" size={24 * scale} color="black" style={styles.iconShadow} />
            </View>
          );
       }
       return (
         <View style={{alignItems: 'center', paddingHorizontal: 2}}>
           <Text 
             style={[styles.customTextBody, { fontSize: FONT_XS }]} 
             numberOfLines={3} 
             adjustsFontSizeToFit
           >
             {card.customText?.toUpperCase()}
           </Text>
         </View>
       );
    }

    switch (card.type) {
      case 'skip':
        return <MaterialCommunityIcons name="block-helper" size={ICON_LG} color={iconColor} style={styles.iconShadow} />;
      case 'reverse':
        return <MaterialCommunityIcons name="sync" size={ICON_LG} color={iconColor} style={styles.iconShadow} />;
      case 'draw2':
        return <Text style={[styles.textBase, { fontSize: FONT_LG,color: iconColor }]}>+2</Text>;
      case 'wild4':
        return <Text style={[styles.textBase, { fontSize: FONT_LG,color: 'black' }]}>+4</Text>;
      case 'wild':
        return (
          <View style={[styles.wildCircleContainer, styles.viewShadow, { width: 46 * scale, height: mainIconSize, borderRadius: mainIconSize / 2 }]}>
            <View style={styles.wildRow}>
              <View style={[styles.wildQuadrant, { backgroundColor: CARD_COLORS.red }]} />
              <View style={[styles.wildQuadrant, { backgroundColor: CARD_COLORS.blue }]} />
            </View>
            <View style={styles.wildRow}>
              <View style={[styles.wildQuadrant, { backgroundColor: CARD_COLORS.yellow }]} />
              <View style={[styles.wildQuadrant, { backgroundColor: CARD_COLORS.green }]} />
            </View>
          </View>
        );
      default: return null;
    }
  };

  const cardColor = CARD_COLORS[card.color];

  const SmallSymbol = ({ card }: { card: Card }) => {
   const smallIconSize = 18;
   
   if (card.type === 'number') return <Text style={[styles.textBase, { fontSize: FONT_SM, color: 'white' }]}>{card.value}</Text>;
   if (card.type === 'draw2') return <Text style={[styles.textBase, { fontSize: FONT_SM, color: 'white' }]}>+2</Text>;
   if (card.type === 'wild4') return <Text style={[styles.textBase, { fontSize: FONT_SM, color: 'white' }]}>+4</Text>;
   if (card.type === 'wild') return <Text style={[styles.textBase, { fontSize: FONT_SM, color: 'white' }]}>W</Text>;
   
   if (card.type === 'skip') return <MaterialCommunityIcons name="block-helper" size={ICON_SM} color="white" />;
   if (card.type === 'reverse') return <MaterialCommunityIcons name="sync" size={ICON_SM} color="white" />;
   
   if (card.type === 'wild_shuffle') {
      return <MaterialCommunityIcons name="shuffle" size={smallIconSize} color="white" />;
   }

   if (card.type === 'wild_custom') {
      return <MaterialCommunityIcons name="pencil" size={smallIconSize} color="white" />;
   }
   
   return <Text style={[styles.textBase, { fontSize: FONT_SM, color: 'white' }]}>{(card.type as string)[0].toUpperCase()}</Text>;
};
  
  return (
    <TouchableOpacity 
      activeOpacity={0.9} onPress={onPress} disabled={disabled}
      style={[styles.cardContainer, { 
          backgroundColor: getCardColor(), width: W, height: H, borderRadius: RADIUS, borderWidth: BORDER, marginHorizontal: 2 * scale
      }]}
    >
      <View style={[styles.oval, { width: OVAL_W, height: OVAL_H }]}>
        <View style={{ transform: [{ rotate: '25deg' }], alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          {renderSymbol()}
        </View>
      </View>
      
      <View style={{ position: 'absolute', top: CORNER_OFFSET, left: CORNER_OFFSET }}>
        <SmallSymbol card={card} />
      </View>
      <View style={{ position: 'absolute', bottom: CORNER_OFFSET, right: CORNER_OFFSET, transform: [{ rotate: '180deg' }] }}>
        <SmallSymbol card={card} />
      </View>
    </TouchableOpacity>
  );
};



const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'white', elevation: 5, margin: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  oval: {
    backgroundColor: 'white', 
    borderRadius: 50, transform: [{ rotate: '-25deg' }],
    justifyContent: 'center', alignItems: 'center', elevation: 2,
    overflow: 'hidden' 
  },
  customTextBody: { fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' },
  
  iconShadow: { textShadowColor: 'rgba(0,0,0,0.1)', textShadowRadius: 1, textShadowOffset: {width: 1, height: 1} },
  viewShadow: { elevation: 3, shadowColor: '#000', shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.3, shadowRadius: 1 },
  textBase: {
    fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.1)', textShadowRadius: 1, textAlign: 'center'
  },

  wildCircleContainer: { overflow: 'hidden', borderWidth: 0.5, borderColor: '#ccc', backgroundColor: 'white' },
  wildRow: { flex: 1, flexDirection: 'row' },
  wildQuadrant: { flex: 1 },

  cornerTopLeft: { position: 'absolute', top: 5, left: 5 },
  cornerBottomRight: { position: 'absolute', bottom: 5, right: 5, transform: [{ rotate: '180deg' }] },
  smallText: { fontSize: 14, fontWeight: 'bold', color: 'white' }
});