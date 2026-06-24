import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CardColor } from '../../../types';
import { THEME, CARD_COLORS } from '../../../constants/colors';

interface Props {
  visible: boolean;
  onSelectColor: (color: CardColor) => void;
}

export const ColorPickerModal = ({ visible, onSelectColor }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Choose Color</Text>
          
          <View style={styles.grid}>
            {}
            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: CARD_COLORS.red }]} 
              onPress={() => onSelectColor('red')}
            >
              <Text style={styles.btnText}>RED</Text>
            </TouchableOpacity>

            {}
            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: CARD_COLORS.blue }]} 
              onPress={() => onSelectColor('blue')}
            >
              <Text style={styles.btnText}>BLUE</Text>
            </TouchableOpacity>

            {}
            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: CARD_COLORS.green }]} 
              onPress={() => onSelectColor('green')}
            >
              <Text style={styles.btnText}>GREEN</Text>
            </TouchableOpacity>

            {}
            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: CARD_COLORS.yellow }]} 
              onPress={() => onSelectColor('yellow')}
            >
              <Text style={[styles.btnText, { color: 'black' }]}>YELLOW</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: 300,
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
  },
  btn: {
    width: 110,
    height: 110,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  btnText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
});