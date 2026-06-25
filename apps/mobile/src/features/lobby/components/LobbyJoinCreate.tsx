import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CreateRoomTab } from './CreateRoomTab';
import { JoinRoomTab } from './JoinRoomTab';

type TabState = 'create' | 'join';

interface LobbyJoinCreateProps {
  nickname: string;
  setNickname: (name: string) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  activeTab: TabState;
  setActiveTab: (tab: TabState) => void;
  onCreate: () => void;
  onJoin: () => void;
  onBack: () => void;
  onPaste: () => void;
}

export function LobbyJoinCreate({
  nickname,
  setNickname,
  roomCode,
  setRoomCode,
  activeTab,
  setActiveTab,
  onCreate,
  onJoin,
  onBack,
  onPaste
}: LobbyJoinCreateProps) {
  return (
    <View className="w-full">
        <TouchableOpacity onPress={onBack} className="flex-row items-center mb-5 gap-1">
            <MaterialCommunityIcons name="arrow-left" size={20} className="text-text-secondary" />
            <Text className="text-text-secondary text-base">Back</Text>
        </TouchableOpacity>

        <View className="w-full bg-surface rounded-3xl p-4 mb-5 border border-border items-center">
            <Text className="text-xs font-bold text-text-secondary mb-2 ml-1 tracking-wider self-start">YOUR NICKNAME</Text>
            <TextInput 
                className="w-full bg-input py-4 px-5 rounded-2xl text-text-primary text-base border border-border"
                placeholder="Maverick" 
                placeholderTextColor="rgba(148, 163, 184, 0.5)" 
                value={nickname} 
                onChangeText={setNickname} 
            />
        </View>

        <View className="bg-surface rounded-3xl border border-border overflow-hidden">
            <View className="flex-row bg-input p-1">
                <TouchableOpacity 
                    className={`flex-1 py-3 items-center rounded-[20px] ${activeTab === 'create' ? 'bg-surface shadow-sm' : ''}`} 
                    onPress={() => setActiveTab('create')}
                >
                    <Text className={`font-semibold ${activeTab === 'create' ? 'text-primary font-bold' : 'text-text-secondary'}`}>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className={`flex-1 py-3 items-center rounded-[20px] ${activeTab === 'join' ? 'bg-surface shadow-sm' : ''}`} 
                    onPress={() => setActiveTab('join')}
                >
                    <Text className={`font-semibold ${activeTab === 'join' ? 'text-primary font-bold' : 'text-text-secondary'}`}>Join</Text>
                </TouchableOpacity>
            </View>

            <View className="p-8 items-center">
                {activeTab === 'create' ? (
                    <CreateRoomTab nickname={nickname} onCreate={onCreate} />
                ) : (
                    <JoinRoomTab 
                        nickname={nickname}
                        roomCode={roomCode}
                        setRoomCode={setRoomCode}
                        onJoin={onJoin}
                        onPaste={onPaste}
                    />
                )}
            </View>
        </View>
    </View>
  );
}

