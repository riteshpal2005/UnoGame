import { test, expect } from '@jest/globals';
import { Card, CardType } from '../src/types';

test('accepts wild_custom as a valid CardType', () => {
  const wildCustomCard: Card = {
    id: 'test-1',
    color: 'black',
    type: 'wild_custom' as CardType, // type augmentation allows this value
    customText: 'Custom Wild',
  };
  expect(wildCustomCard.type).toBe('wild_custom');
});
