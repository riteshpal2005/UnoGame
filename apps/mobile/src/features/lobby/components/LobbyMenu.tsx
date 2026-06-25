import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LobbyMenuProps {
  onOpenSettings: () => void;
  onOpenBotModal: () => void;
  onMultiplayerClick: () => void;
  onDebugCardTest: () => void;
}

export function LobbyMenu({ 
  onOpenSettings,
  onOpenBotModal, 
  onMultiplayerClick, 
  onDebugCardTest 
}: LobbyMenuProps) {
  return (
    <View className="w-full items-center gap-3">
      <View className="w-full items-end mb-2">
        <TouchableOpacity onPress={onOpenSettings} className="p-2">
          <MaterialCommunityIcons name="cog" size={28} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-3 mb-10 mt-4">
        <View className="w-20 h-32 bg-primary rounded-2xl justify-center items-center border-[3px] border-text-primary shadow-xl shadow-primary/40 -rotate-6">
          <Text className="text-text-primary text-[44px] font-black" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>U</Text>
        </View>
        <View className="w-20 h-32 bg-secondary rounded-2xl justify-center items-center border-[3px] border-text-primary shadow-xl shadow-secondary/40 -translate-y-4">
          <Text className="text-text-primary text-[44px] font-black" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>N</Text>
        </View>
        <View className="w-20 h-32 bg-accent rounded-2xl justify-center items-center border-[3px] border-text-primary shadow-xl shadow-accent/40 rotate-6">
          <Text className="text-text-primary text-[44px] font-black" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>O</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        className="w-full flex-row items-center justify-between bg-surface p-5 rounded-[20px] border border-border mt-2"
        onPress={onOpenBotModal}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center gap-4">
           <View className="w-14 h-14 rounded-full items-center justify-center bg-text-primary shadow-md">
                <MaterialCommunityIcons name="robot" size={28} className="text-background" />
           </View>
           <View>
             <Text className="text-lg font-bold text-text-primary">Single Player</Text>
             <Text className="text-sm text-text-secondary">Practice against Bots</Text>
           </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} className="text-text-secondary" />
      </TouchableOpacity>

      <TouchableOpacity 
        className="w-full flex-row items-center justify-between bg-surface p-5 rounded-[20px] border border-border mt-2"
        onPress={onMultiplayerClick}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center gap-4">
           <View className="w-14 h-14 rounded-full items-center justify-center bg-text-primary shadow-md">
                <MaterialCommunityIcons name="gamepad-variant" size={28} className="text-background" />
           </View>
           <View>
             <Text className="text-lg font-bold text-text-primary">Multiplayer</Text>
             <Text className="text-sm text-text-secondary">Connect to LAN Server</Text>
           </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} className="text-text-secondary" />
      </TouchableOpacity>

      <TouchableOpacity 
        className="flex-row items-center gap-2 p-4 mt-5 opacity-80"
        onPress={onDebugCardTest}
      >
        <MaterialCommunityIcons name="test-tube" size={16} color="#F8FAFC" />
        <Text className="text-sm font-semibold text-text-primary">Playground</Text>
      </TouchableOpacity>
    </View>
  );
}


