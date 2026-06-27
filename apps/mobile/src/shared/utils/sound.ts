import { Audio } from "expo-av";
import { useGameStore } from "../../features/game/store";

const SOUNDS: Record<string, string> = {
  card_play: "https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav",
  card_draw: "https://assets.mixkit.co/active_storage/sfx/2007/2007-84.wav",
  uno_call: "https://assets.mixkit.co/active_storage/sfx/2016/2016-84.wav",
  victory: "https://assets.mixkit.co/active_storage/sfx/2018/2018-84.wav",
};

export const playSound = async (soundKey: string) => {
  const enabled = useGameStore.getState().soundEnabled;
  if (enabled === false) return;

  try {
    const url = SOUNDS[soundKey];
    if (!url) return;
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (error) {
    console.warn("Sound playback failed:", error);
  }
};
