import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { UnoCard } from './UnoCard';
import { Card } from '../../../types';

interface Position {
  x: number;
  y: number;
}

interface Props {
  card: Card;
  startPos: Position;
  endPos: Position;
  onAnimationComplete: () => void;
}

export const FlyingCard = ({ card, startPos, endPos, onAnimationComplete }: Props) => {
  const translateX = useRef(new Animated.Value(startPos.x)).current;
  const translateY = useRef(new Animated.Value(startPos.y)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: endPos.x,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(translateY, {
        toValue: endPos.y,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete();
    });
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${Math.random() * 60 - 30}deg`],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX },
            { translateY },
            { scale },
            { rotate: spin },
          ],
        },
      ]}
    >
      {}
      <UnoCard card={card} disabled />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
});