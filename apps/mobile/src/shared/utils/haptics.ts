import * as Haptics from "expo-haptics";
import { useGameStore } from "../../features/game/store";

export const triggerHaptic = {
  light: () => {
    const enabled = useGameStore.getState().hapticsEnabled;
    if (enabled !== false) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  },
  success: () => {
    const enabled = useGameStore.getState().hapticsEnabled;
    if (enabled !== false) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
  },
  error: () => {
    const enabled = useGameStore.getState().hapticsEnabled;
    if (enabled !== false) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );
    }
  },
};
