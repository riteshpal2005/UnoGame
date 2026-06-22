import { createContext, useContext, ReactNode } from "react";
import { useColorScheme, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setThemeOptionRedux } from "../store/settingsSlice";

export type ThemeOption = 'light' | 'dark' | 'pitch-black' | 'system';

interface ThemeContextType {
  themeOption: ThemeOption,
  setThemeOption: (option: ThemeOption) => void;
  activeThemeClass: string;
  bottomSheetBackgroundColor: string;
  bottomSheetIndicatorColor: string;
  bottomSheetBorderColor: string;
  colors: {
    brandPrimary: string;
    brandPrimaryContent: string;
    statusDanger: string;
    statusSuccess: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const themeOption = useSelector((state: RootState) => state.settings.themeOption) || 'dark';
  const systemColorScheme = useColorScheme();

  const setThemeOption = (option: ThemeOption) => {
    dispatch(setThemeOptionRedux(option));
  };

  const activeThemeClass = (() => {
    const effectiveTheme = themeOption === 'system' ? (systemColorScheme || 'dark') : themeOption;
    if (effectiveTheme === 'dark') return 'theme-dark';
    if (effectiveTheme === 'pitch-black') return 'theme-pitch-black';
    return ''; 
  })();

  const bottomSheetBackgroundColor = activeThemeClass === 'theme-pitch-black' ? '#000000' : activeThemeClass === 'theme-dark' ? '#09090b' : '#f4f4f5';
  const bottomSheetIndicatorColor = activeThemeClass === '' ? '#e4e4e7' : '#52525b';
  const bottomSheetBorderColor = activeThemeClass === 'theme-pitch-black' ? '#18181b' : activeThemeClass === 'theme-dark' ? '#27272a' : '#e4e4e7';

  const colors = {
    brandPrimary: activeThemeClass === '' ? '#2563eb' : '#3b82f6',
    brandPrimaryContent: '#ffffff',
    statusDanger: '#ef4444',
    statusSuccess: '#10b981',
  };

  return (
    <ThemeContext.Provider value={{ themeOption, setThemeOption, activeThemeClass, bottomSheetBackgroundColor, bottomSheetIndicatorColor, bottomSheetBorderColor, colors }}>
      <View className={`${activeThemeClass} bg-background flex-1`}>
        <StatusBar 
          style={activeThemeClass === '' ? 'dark' : 'light'} 
          backgroundColor="transparent" 
          translucent={true} 
        />
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}