import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../features/game/store';

export default function SettingsScreen() {
  const { customRules, setCustomRules } = useGameStore();

  const toggleRule = (ruleName: string) => {
    if (customRules.includes(ruleName)) {
      setCustomRules(customRules.filter((r: string) => r !== ruleName));
    } else {
      setCustomRules([...customRules, ruleName]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom', 'left', 'right']}>
      <View className="flex-1 p-6">
        <Text className="text-sm font-bold text-text-secondary tracking-widest mb-4 ml-2">CUSTOM GAME RULES</Text>
        
        <View className="w-full bg-surface rounded-3xl border border-border overflow-hidden">
          
          <View className="flex-row items-center justify-between p-5 border-b border-border">
            <View className="flex-1 pr-4">
              <Text className="text-text-primary text-lg font-bold">Stacking</Text>
              <Text className="text-text-secondary text-sm">Allow stacking +2 on +2 and +4 on +4</Text>
            </View>
            <Switch 
              value={customRules.includes('stacking')} 
              onValueChange={() => toggleRule('stacking')}
              trackColor={{ false: '#334155', true: '#10B981' }}
              thumbColor="#F8FAFC"
            />
          </View>

          <View className="flex-row items-center justify-between p-5 border-b border-border">
            <View className="flex-1 pr-4">
              <Text className="text-text-primary text-lg font-bold">7-0 Rule</Text>
              <Text className="text-text-secondary text-sm">7 swaps hands, 0 passes hands globally</Text>
            </View>
            <Switch 
              value={customRules.includes('sevenO')} 
              onValueChange={() => toggleRule('sevenO')}
              trackColor={{ false: '#334155', true: '#10B981' }}
              thumbColor="#F8FAFC"
            />
          </View>

          <View className="flex-row items-center justify-between p-5">
            <View className="flex-1 pr-4">
              <Text className="text-text-primary text-lg font-bold">Draw to Match</Text>
              <Text className="text-text-secondary text-sm">Keep drawing until a playable card is found</Text>
            </View>
            <Switch 
              value={customRules.includes('drawToMatch')} 
              onValueChange={() => toggleRule('drawToMatch')}
              trackColor={{ false: '#334155', true: '#10B981' }}
              thumbColor="#F8FAFC"
            />
          </View>

        </View>

        <Text className="text-center text-text-secondary mt-6 text-xs italic">
          These rules will be applied to any room you host.
        </Text>
      </View>
    </SafeAreaView>
  );
}
