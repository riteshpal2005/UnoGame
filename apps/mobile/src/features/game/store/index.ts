import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStore } from './types';
import { createCoreSlice } from './coreSlice';
import { createPlayCardSlice } from './playCardSlice';
import { createTurnSlice } from './turnSlice';
import { createMultiplayerSlice } from './multiplayerSlice';

export const useGameStore = create<GameStore>()(
  persist(
    (set, get, api) => ({
      ...createCoreSlice(set, get, api),
      ...createPlayCardSlice(set, get, api),
      ...createTurnSlice(set, get, api),
      ...createMultiplayerSlice(set, get, api),
    } as GameStore),
    {
      name: 'uno-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ customRules: state.customRules }),
    }
  )
);
