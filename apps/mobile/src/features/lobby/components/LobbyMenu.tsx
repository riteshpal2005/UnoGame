import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LobbyMenuProps {
  onOpenSettings: () => void;
  onOpenBotModal: () => void;
  onMultiplayerClick: () => void;
  onDebugCardTest: () => void;
}

const MockCard = ({ color, number, rotate, top, left, right, bottom, isAction = false, isWild = false }: any) => {
  return (
    <View 
      style={{ 
        position: 'absolute', 
        top, left, right, bottom, 
        transform: [{ rotate }],
        zIndex: -1 
      }}
      className={`w-16 h-24 rounded-lg border-4 border-white items-center justify-center shadow-2xl ${color}`}
    >
      {!isWild ? (
        <>
          <View className="absolute top-0.5 left-1"><Text className="text-white text-xs font-bold">{number}</Text></View>
          <View className="absolute bottom-0.5 right-1"><Text className="text-white text-xs font-bold" style={{ transform: [{ rotate: '180deg' }] }}>{number}</Text></View>
          <View className="w-12 h-16 rounded-[24px] bg-white items-center justify-center transform -rotate-12 border border-white">
            <View className={`w-11 h-15 rounded-[22px] items-center justify-center ${color}`}>
              <Text className="text-white text-3xl font-black shadow-sm" style={{ textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 }}>{number}</Text>
            </View>
          </View>
        </>
      ) : (
        <View className="w-full h-full bg-black rounded-sm flex-wrap flex-row overflow-hidden border border-white p-0.5">
           <View className="w-1/2 h-1/2 bg-red-500" />
           <View className="w-1/2 h-1/2 bg-blue-500" />
           <View className="w-1/2 h-1/2 bg-yellow-500" />
           <View className="w-1/2 h-1/2 bg-green-500" />
        </View>
      )}
    </View>
  );
}

export function LobbyMenu({ 
  onOpenSettings,
  onOpenBotModal, 
  onMultiplayerClick, 
  onDebugCardTest 
}: LobbyMenuProps) {
  return (
    <View className="flex-1 w-full relative h-[800px]">
      
      {/* Top Bar */}
      <View className="w-full flex-row justify-between items-center z-10 pt-4">
        {/* Player Badge */}
        <View className="flex-row items-center bg-[#0B0D23]/60 rounded-full pr-4 pl-1 py-1 border border-white/10">
          <View className="w-10 h-10 rounded-full bg-[#A855F7] items-center justify-center mr-2">
            <MaterialCommunityIcons name="account" size={24} color="white" />
          </View>
          <View>
            <Text className="text-white font-bold text-sm">Player</Text>
            <Text className="text-[#A855F7] text-xs">Level 1</Text>
          </View>
        </View>

        {/* Settings Icon */}
        <TouchableOpacity onPress={onOpenSettings} className="w-10 h-10 rounded-full bg-[#0B0D23]/60 items-center justify-center border border-white/10">
          <MaterialCommunityIcons name="cog" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      {/* Decorative Floating Cards */}
      <MockCard color="bg-[#EF4444]" number="1" rotate="-15deg" top={100} left={-10} />
      <MockCard color="bg-[#3B82F6]" number="↺" rotate="-15deg" top={250} left={-20} isAction />
      <MockCard color="bg-[#10B981]" number="7" rotate="-15deg" top={480} left={-15} />
      <MockCard isWild rotate="30deg" top={110} right={0} />
      <MockCard color="bg-[#F59E0B]" number="+2" rotate="10deg" top={260} right={10} isAction />

      {/* Logo Area */}
      <View className="w-full items-center justify-center mt-12 mb-16 z-10">
        <View className="w-64 h-40 bg-[#D91E18] rounded-[60px] items-center justify-center shadow-[0_10px_20px_rgba(217,30,24,0.4)] border-[3px] border-[#8D100C] transform -rotate-12">
          <View className="flex-row items-center justify-center transform rotate-12">
             <Text className="text-yellow-400 text-6xl font-black tracking-tighter" style={{ textShadowColor: '#000', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 }}>U</Text>
             <Text className="text-yellow-400 text-6xl font-black tracking-tighter" style={{ textShadowColor: '#000', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 }}>N</Text>
             <Text className="text-yellow-400 text-6xl font-black tracking-tighter" style={{ textShadowColor: '#000', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 }}>O</Text>
             <Text className="text-yellow-400 text-6xl font-black tracking-tighter" style={{ textShadowColor: '#000', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 }}>!</Text>
          </View>
        </View>
      </View>

      {/* Buttons Container */}
      <View className="w-full gap-3 px-4 z-10">
        <TouchableOpacity 
          className="w-full flex-row items-center bg-[#DE2F37] p-4 rounded-2xl shadow-lg border-b-[4px] border-[#991B1B]"
          onPress={onOpenBotModal}
          activeOpacity={0.8}
        >
          <View className="w-12 h-12 rounded-full bg-white items-center justify-center mr-4">
            <MaterialCommunityIcons name="robot-outline" size={32} color="#DE2F37" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-black text-xl uppercase tracking-wide shadow-sm">Play Offline / Bots</Text>
            <Text className="text-white/80 text-xs mt-0.5">Play against AI bots</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full flex-row items-center bg-[#0D62C6] p-4 rounded-2xl shadow-lg border-b-[4px] border-[#1E3A8A]"
          onPress={onMultiplayerClick}
          activeOpacity={0.8}
        >
          <View className="w-12 h-12 rounded-full bg-white items-center justify-center mr-4">
            <MaterialCommunityIcons name="web" size={32} color="#0D62C6" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-black text-xl uppercase tracking-wide shadow-sm">Multiplayer</Text>
            <Text className="text-white/80 text-xs mt-0.5">Join or create a game online</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full flex-row items-center bg-[#5D3EA4] p-4 rounded-2xl shadow-lg border-b-[4px] border-[#4C1D95]"
          onPress={onOpenSettings}
          activeOpacity={0.8}
        >
          <View className="w-12 h-12 rounded-full bg-white items-center justify-center mr-4">
            <MaterialCommunityIcons name="cog-outline" size={32} color="#5D3EA4" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-black text-xl uppercase tracking-wide shadow-sm">Settings</Text>
            <Text className="text-white/80 text-xs mt-0.5">Sound, Haptics & more</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full flex-row items-center bg-[#242A38] p-4 rounded-2xl shadow-lg border-b-[4px] border-[#0F172A] mt-2"
          onPress={onDebugCardTest}
          activeOpacity={0.8}
        >
          <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center mr-4">
            <MaterialCommunityIcons name="bug" size={32} color="#94A3B8" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-black text-xl uppercase tracking-wide shadow-sm">Debug</Text>
            <Text className="text-[#94A3B8] text-xs mt-0.5">Developer tools & UI tests</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
      </View>
      
    </View>
  );
}
