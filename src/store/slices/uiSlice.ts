import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState } from '@/types';

// Get initial theme from localStorage or default to 'light'
const getInitialTheme = (): 'light' | 'dark' | 'system' => {
  if (typeof window === 'undefined') return 'light';
  
  try {
    const saved = localStorage.getItem('theme');
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved as 'light' | 'dark' | 'system';
    }
  } catch (error) {
    console.warn('Failed to load theme from localStorage:', error);
  }
  
  return 'light';
};

// Get initial language from localStorage or default to 'en'
const getInitialLanguage = (): 'en' | 'es' => {
  if (typeof window === 'undefined') return 'en';
  
  try {
    const saved = localStorage.getItem('language');
    if (saved && ['en', 'es'].includes(saved)) {
      return saved as 'en' | 'es';
    }
  } catch (error) {
    console.warn('Failed to load language from localStorage:', error);
  }
  
  return 'en';
};

// Initial state
const initialState: UIState = {
  sidebarOpen: false,
  theme: getInitialTheme(),
  language: getInitialLanguage(),
  notifications: {
    show: false,
    unreadCount: 0,
  },
  modals: {
    confirmDelete: false,
    bidSubmission: false,
    documentPreview: false,
  },
  loading: {
    tenders: false,
    bids: false,
    submissions: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar management
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // Theme management
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
      
      // Persist to localStorage
      try {
        localStorage.setItem('theme', action.payload);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    },

    // Language management
    setLanguage: (state, action: PayloadAction<'en' | 'es'>) => {
      state.language = action.payload;
      
      // Persist to localStorage
      try {
        localStorage.setItem('language', action.payload);
      } catch (error) {
        console.warn('Failed to save language to localStorage:', error);
      }
    },

    // Notification management
    toggleNotifications: (state) => {
      state.notifications.show = !state.notifications.show;
    },

    setNotificationsOpen: (state, action: PayloadAction<boolean>) => {
      state.notifications.show = action.payload;
    },

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.notifications.unreadCount = action.payload;
    },

    incrementUnreadCount: (state) => {
      state.notifications.unreadCount += 1;
    },

    decrementUnreadCount: (state) => {
      state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
    },

    clearUnreadCount: (state) => {
      state.notifications.unreadCount = 0;
    },

    // Modal management
    setModal: (
      state,
      action: PayloadAction<{
        modal: keyof UIState['modals'];
        open: boolean;
      }>
    ) => {
      state.modals[action.payload.modal] = action.payload.open;
    },

    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },

    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },

    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },

    // Loading states
    setLoading: (
      state,
      action: PayloadAction<{
        section: keyof UIState['loading'];
        loading: boolean;
      }>
    ) => {
      state.loading[action.payload.section] = action.payload.loading;
    },

    setTendersLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.tenders = action.payload;
    },

    setBidsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.bids = action.payload;
    },

    setSubmissionsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.submissions = action.payload;
    },

    // Bulk updates
    resetUI: (state) => {
      state.sidebarOpen = false;
      state.notifications.show = false;
      state.modals = {
        confirmDelete: false,
        bidSubmission: false,
        documentPreview: false,
      };
      state.loading = {
        tenders: false,
        bids: false,
        submissions: false,
      };
    },

    // Responsive breakpoint handling
    handleBreakpointChange: (
      state,
      action: PayloadAction<'mobile' | 'tablet' | 'desktop'>
    ) => {
      const breakpoint = action.payload;
      
      // Auto-close sidebar on mobile when switching to mobile view
      if (breakpoint === 'mobile') {
        state.sidebarOpen = false;
      }
      
      // Auto-close notifications dropdown on mobile
      if (breakpoint === 'mobile' && state.notifications.show) {
        state.notifications.show = false;
      }
    },
  },
});

export const {
  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  
  // Theme
  setTheme,
  
  // Language
  setLanguage,
  
  // Notifications
  toggleNotifications,
  setNotificationsOpen,
  setUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  clearUnreadCount,
  
  // Modals
  setModal,
  openModal,
  closeModal,
  closeAllModals,
  
  // Loading
  setLoading,
  setTendersLoading,
  setBidsLoading,
  setSubmissionsLoading,
  
  // Bulk updates
  resetUI,
  handleBreakpointChange,
} = uiSlice.actions;

// Selectors
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectLanguage = (state: { ui: UIState }) => state.ui.language;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectLoading = (state: { ui: UIState }) => state.ui.loading;
export const selectUnreadCount = (state: { ui: UIState }) => state.ui.notifications.unreadCount;

export default uiSlice.reducer;