import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BotModalProps {
  visible: boolean;
  onClose: () => void;
  onStartBotGame: (count: number) => void;
}

export function BotModal({ visible, onClose, onStartBotGame }: BotModalProps) {
  const [selectedBots, setSelectedBots] = useState(1);

  const handleStart = () => {
    // Pass selectedBots + 1 (including the user) to match previous logic where 2 meant 1 bot + 1 player
    onStartBotGame(selectedBots + 1);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-[#0F172A]/90 justify-center items-center">
        <View className="w-[85%] bg-[#0B0D23] rounded-3xl p-6 items-center border-[2px] border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          
          <TouchableOpacity 
            onPress={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full items-center justify-center border border-white/20 z-10"
          >
            <MaterialCommunityIcons name="close" size={20} color="white" />
          </TouchableOpacity>

          <View className="w-20 h-20 rounded-full border border-white/10 bg-[#A855F7]/10 items-center justify-center mb-4">
             <MaterialCommunityIcons name="robot-outline" size={48} color="#A855F7" />
          </View>

          <Text className="text-white text-2xl font-black mb-1">PLAY OFFLINE</Text>
          <Text className="text-[#A855F7] text-sm mb-6">Choose number of bots</Text>

          <View className="flex-row gap-3 mb-8 w-full justify-center">
             {[1, 2, 3].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => setSelectedBots(num)}
                  activeOpacity={0.8}
                  className={`w-20 h-24 rounded-2xl items-center justify-center border-2 ${selectedBots === num ? 'border-[#A855F7] bg-[#A855F7]/20 shadow-lg shadow-[#A855F7]' : 'border-white/10 bg-white/5'}`}
                >
                   <Text className={`text-3xl font-black ${selectedBots === num ? 'text-white' : 'text-white/60'}`}>{num}</Text>
                   <Text className={`text-xs font-bold mt-1 ${selectedBots === num ? 'text-[#A855F7]' : 'text-white/40'}`}>
                     {num === 1 ? 'BOT' : 'BOTS'}
                   </Text>
                </TouchableOpacity>
             ))}
          </View>

          <TouchableOpacity 
            onPress={handleStart}
            activeOpacity={0.8}
            className="w-full bg-[#10B981] flex-row items-center justify-center p-4 rounded-xl border-b-[4px] border-[#047857]"
          >
            <MaterialCommunityIcons name="play" size={24} color="white" />
            <Text className="text-white font-black text-lg ml-2">START GAME</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}
