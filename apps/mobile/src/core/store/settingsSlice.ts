import { createSlice } from "@reduxjs/toolkit";

const settingsSlice = createSlice({
  name: 'settings',
  initialState: { 
    showIcons: true,
    hapticsEnabled: true,
    defaultAccountId: null as string | null,
    themeOption: 'dark' as 'light' | 'dark' | 'pitch-black' | 'system',
    exportDirectoryUri: null as string | null
  },
  reducers: {
    toggleShowIcons: (state) => {
      state.showIcons = !state.showIcons;
    },
    toggleHaptics: (state) => {
      state.hapticsEnabled = !state.hapticsEnabled;
    },
    setDefaultAccount: (state, action) => {
      state.defaultAccountId = action.payload;
    },
    setThemeOptionRedux: (state, action) => {
      state.themeOption = action.payload;
    },
    loadSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
    setExportDirectoryUri: (state, action) => {
      state.exportDirectoryUri = action.payload;
    }
  }
});

export const { toggleShowIcons, toggleHaptics, setDefaultAccount, loadSettings, setThemeOptionRedux, setExportDirectoryUri } = settingsSlice.actions;
export default settingsSlice.reducer;
