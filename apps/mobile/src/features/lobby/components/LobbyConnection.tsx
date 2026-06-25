import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LobbyConnectionProps {
  ipAddress: string;
  setIpAddress: (ip: string) => void;
  isLoading: boolean;
  onConnect: () => void;
  onBack: () => void;
}

export function LobbyConnection({
  ipAddress,
  setIpAddress,
  isLoading,
  onConnect,
  onBack
}: LobbyConnectionProps) {
  return (
    <View className="w-full">
        <TouchableOpacity onPress={onBack} className="flex-row items-center mb-5 gap-1">
            <MaterialCommunityIcons name="arrow-left" size={20} className="text-text-secondary" />
            <Text className="text-text-secondary text-base">Back to Menu</Text>
        </TouchableOpacity>

        <View className="w-full bg-surface rounded-[24px] p-6 items-center border border-border">
            <View className="w-20 h-20 rounded-full bg-text-primary justify-center items-center shadow-lg">
                <MaterialCommunityIcons name="server-network" size={40} className="text-background" />
            </View>
            <Text className="text-2xl font-bold text-text-primary mt-4">Connect to Server</Text>
            <Text className="text-sm text-text-secondary mt-1 mb-6">Enter IP from 'node server.js' terminal</Text>
            
            <View className="w-full mb-5">
                <Text className="text-xs font-bold text-text-secondary mb-2 ml-1 tracking-wider">IP ADDRESS</Text>
                <TextInput 
                    className="w-full bg-input py-4 px-5 rounded-2xl text-text-primary text-base border border-border"
                    value={ipAddress} 
                    onChangeText={setIpAddress} 
                    keyboardType="numeric" 
                    placeholder="192.168.x.x"
                    placeholderTextColor="rgba(148, 163, 184, 0.5)"
                />
            </View>

            <TouchableOpacity 
                className="w-full bg-primary py-4 rounded-[16px] items-center shadow-lg shadow-primary/30" 
                onPress={onConnect}
            >
                {isLoading ? <ActivityIndicator color="white"/> : <Text className="text-white text-base font-bold tracking-wide">Connect</Text>}
            </TouchableOpacity>
        </View>
    </View>
  );
}
