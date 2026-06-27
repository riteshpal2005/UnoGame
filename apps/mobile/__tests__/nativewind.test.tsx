import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { test, expect } from '@jest/globals';

test('renders View with className prop', async () => {
  const { getByTestId } = await render(
    <View testID="test-view" className="bg-blue-500 p-4">
      <Text className="text-white">Hello</Text>
    </View>,
  );
  const view = getByTestId('test-view');
  expect(view).toBeTruthy();
});
