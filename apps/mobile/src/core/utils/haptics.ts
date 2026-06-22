import * as Haptics from 'expo-haptics';
import { store } from '../store/store';

export const triggerHaptic = {
  light: () => {
    if (store.getState().settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});
    }
  },
  success: () => {
    if (store.getState().settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>{});
    }
  },
  error: () => {
    if (store.getState().settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(()=>{});
    }
  }
};
