// store/slices/uiSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  // Navigation
  currentPage: string;
  previousPage: string;

  // Layout
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Theme & Display
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  viewMode: 'grid' | 'list';

  // Search
  searchQuery: string;
  showSearchOverlay: boolean;
  recentSearches: string[];

  // Mobile Navigation
  showMobileMenu: boolean;
  showMobileSearch: boolean;
  showNotifications: boolean;
  showProfileMenu: boolean;

  // Scroll & Interaction
  isScrolled: boolean;
  scrollPosition: number;
  isScrollingDown: boolean;

  // Loading States
  loading: {
    global: boolean;
    posts: boolean;
    search: boolean;
    auth: boolean;
    upload: boolean;
  };

  // Modal States
  modals: {
    login: boolean;
    register: boolean;
    createPost: boolean;
    editPost: boolean;
    editProfile: boolean;
    confirmDelete: boolean;
    imageViewer: boolean;
    settings: boolean;
  };

  // Toast Notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    action?: {
      label: string;
      callback: string;
    };
  }>;

  // Form States
  forms: {
    createPost: {
      isDirty: boolean;
      isSubmitting: boolean;
      errors: Record<string, string>;
    };
    editProfile: {
      isDirty: boolean;
      isSubmitting: boolean;
      errors: Record<string, string>;
    };
    login: {
      isSubmitting: boolean;
      errors: Record<string, string>;
    };
  };

  // Filter & Sort States
  filters: {
    category: string;
    tags: string[];
    author: string;
    dateRange: 'all' | 'day' | 'week' | 'month' | 'year';
    sortBy: 'newest' | 'popular' | 'trending' | 'oldest';
  };

  // Preferences
  preferences: {
    autoPlayVideos: boolean;
    showNSFWContent: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    language: string;
    timezone: string;
  };

  // Device & Browser Info
  device: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    screenWidth: number;
    screenHeight: number;
  };
}

const initialState: UIState = {
  // Navigation
  currentPage: 'home',
  previousPage: '',

  // Layout
  sidebarOpen: true,
  sidebarCollapsed: false,

  // Theme & Display
  theme: 'dark',
  fontSize: 'medium',
  viewMode: 'list',

  // Search
  searchQuery: '',
  showSearchOverlay: false,
  recentSearches: [],

  // Mobile Navigation
  showMobileMenu: false,
  showMobileSearch: false,
  showNotifications: false,
  showProfileMenu: false,

  // Scroll & Interaction
  isScrolled: false,
  scrollPosition: 0,
  isScrollingDown: false,

  // Loading States
  loading: {
    global: false,
    posts: false,
    search: false,
    auth: false,
    upload: false,
  },

  // Modal States
  modals: {
    login: false,
    register: false,
    createPost: false,
    editPost: false,
    editProfile: false,
    confirmDelete: false,
    imageViewer: false,
    settings: false,
  },

  // Toast Notifications
  toasts: [],

  // Form States
  forms: {
    createPost: {
      isDirty: false,
      isSubmitting: false,
      errors: {},
    },
    editProfile: {
      isDirty: false,
      isSubmitting: false,
      errors: {},
    },
    login: {
      isSubmitting: false,
      errors: {},
    },
  },

  // Filter & Sort States
  filters: {
    category: 'all',
    tags: [],
    author: '',
    dateRange: 'all',
    sortBy: 'newest',
  },

  // Preferences
  preferences: {
    autoPlayVideos: true,
    showNSFWContent: false,
    emailNotifications: true,
    pushNotifications: true,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },

  // Device Info
  device: {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Navigation Actions
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.previousPage = state.currentPage;
      state.currentPage = action.payload;
    },

    goBack: (state) => {
      const temp = state.currentPage;
      state.currentPage = state.previousPage;
      state.previousPage = temp;
    },

    // Layout Actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    // Theme Actions
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('animeblog_theme', action.payload);
        document.documentElement.setAttribute('data-theme', action.payload);
      }
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('animeblog_theme', state.theme);
        document.documentElement.setAttribute('data-theme', state.theme);
      }
    },

    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('animeblog_fontSize', action.payload);
      }
    },

    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('animeblog_viewMode', action.payload);
      }
    },

    // Search Actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    toggleSearchOverlay: (state) => {
      state.showSearchOverlay = !state.showSearchOverlay;
    },

    setSearchOverlay: (state, action: PayloadAction<boolean>) => {
      state.showSearchOverlay = action.payload;
    },

    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query);
        state.recentSearches = state.recentSearches.slice(0, 10); // Keep only 10 recent searches

        if (typeof window !== 'undefined') {
          localStorage.setItem('animeblog_recentSearches', JSON.stringify(state.recentSearches));
        }
      }
    },

    clearRecentSearches: (state) => {
      state.recentSearches = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('animeblog_recentSearches');
      }
    },

    // Mobile Navigation Actions
    toggleMobileMenu: (state) => {
      state.showMobileMenu = !state.showMobileMenu;
    },

    setMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.showMobileMenu = action.payload;
    },

    toggleMobileSearch: (state) => {
      state.showMobileSearch = !state.showMobileSearch;
    },

    setMobileSearch: (state, action: PayloadAction<boolean>) => {
      state.showMobileSearch = action.payload;
    },

    toggleNotifications: (state) => {
      state.showNotifications = !state.showNotifications;
    },

    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.showNotifications = action.payload;
    },

    toggleProfileMenu: (state) => {
      state.showProfileMenu = !state.showProfileMenu;
    },

    setProfileMenu: (state, action: PayloadAction<boolean>) => {
      state.showProfileMenu = action.payload;
    },

    // Scroll Actions
    setScrolled: (state, action: PayloadAction<boolean>) => {
      state.isScrolled = action.payload;
    },

    setScrollPosition: (state, action: PayloadAction<number>) => {
      state.isScrollingDown = action.payload > state.scrollPosition;
      state.scrollPosition = action.payload;
    },

    // Loading Actions
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },

    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },

    // Modal Actions
    setModal: (state, action: PayloadAction<{ modal: keyof UIState['modals']; value: boolean }>) => {
      state.modals[action.payload.modal] = action.payload.value;

      // Close mobile menus when opening modals
      if (action.payload.value) {
        state.showMobileMenu = false;
        state.showNotifications = false;
        state.showProfileMenu = false;
      }
    },

    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },

    // Toast Actions
    addToast: (state, action: PayloadAction<Omit<UIState['toasts'][0], 'id'>>) => {
      const toast = {
        ...action.payload,
        id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      state.toasts.push(toast);
    },

    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },

    clearToasts: (state) => {
      state.toasts = [];
    },

    // Form Actions
    setFormState: (state, action: PayloadAction<{
      form: keyof UIState['forms'];
      field: string;
      value: any;
    }>) => {
      const { form, field, value } = action.payload;
      if (state.forms[form]) {
        (state.forms[form] as any)[field] = value;
      }
    },

    setFormErrors: (state, action: PayloadAction<{
      form: keyof UIState['forms'];
      errors: Record<string, string>;
    }>) => {
      const { form, errors } = action.payload;
      if (state.forms[form]) {
        state.forms[form].errors = errors;
      }
    },

    clearFormErrors: (state, action: PayloadAction<keyof UIState['forms']>) => {
      const form = action.payload;
      if (state.forms[form]) {
        state.forms[form].errors = {};
      }
    },

    resetForm: (state, action: PayloadAction<keyof UIState['forms']>) => {
      const form = action.payload;
      if (state.forms[form]) {
        state.forms[form] = {
          isDirty: false,
          isSubmitting: false,
          errors: {},
        };
      }
    },

    // Filter Actions
    setFilter: (state, action: PayloadAction<{
      key: keyof UIState['filters'];
      value: any;
    }>) => {
      const { key, value } = action.payload;
      (state.filters as any)[key] = value;
    },

    resetFilters: (state) => {
      state.filters = {
        category: 'all',
        tags: [],
        author: '',
        dateRange: 'all',
        sortBy: 'newest',
      };
    },

    // Preferences Actions
    setPreference: (state, action: PayloadAction<{
      key: keyof UIState['preferences'];
      value: any;
    }>) => {
      const { key, value } = action.payload;
      (state.preferences as any)[key] = value;

      if (typeof window !== 'undefined') {
        localStorage.setItem('animeblog_preferences', JSON.stringify(state.preferences));
      }
    },

    // Device Actions
    setDeviceInfo: (state, action: PayloadAction<Partial<UIState['device']>>) => {
      state.device = { ...state.device, ...action.payload };
    },

    // Utility Actions
    closeAllMenus: (state) => {
      state.showMobileMenu = false;
      state.showNotifications = false;
      state.showProfileMenu = false;
      state.showSearchOverlay = false;
    },

    resetUI: (state) => {
      state.showMobileMenu = false;
      state.showNotifications = false;
      state.showProfileMenu = false;
      state.showSearchOverlay = false;
      state.searchQuery = '';
      state.toasts = [];
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },

    // Load from localStorage
    loadFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        // Load theme
        const savedTheme = localStorage.getItem('animeblog_theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          state.theme = savedTheme;
          document.documentElement.setAttribute('data-theme', savedTheme);
        }

        // Load font size
        const savedFontSize = localStorage.getItem('animeblog_fontSize');
        if (savedFontSize === 'small' || savedFontSize === 'medium' || savedFontSize === 'large') {
          state.fontSize = savedFontSize;
        }

        // Load view mode
        const savedViewMode = localStorage.getItem('animeblog_viewMode');
        if (savedViewMode === 'grid' || savedViewMode === 'list') {
          state.viewMode = savedViewMode;
        }

        // Load recent searches
        const savedRecentSearches = localStorage.getItem('animeblog_recentSearches');
        if (savedRecentSearches) {
          try {
            state.recentSearches = JSON.parse(savedRecentSearches);
          } catch (error) {
            console.error('Failed to parse recent searches:', error);
          }
        }

        // Load preferences
        const savedPreferences = localStorage.getItem('animeblog_preferences');
        if (savedPreferences) {
          try {
            state.preferences = { ...state.preferences, ...JSON.parse(savedPreferences) };
          } catch (error) {
            console.error('Failed to parse preferences:', error);
          }
        }

        // Detect device type
        const screenWidth = window.innerWidth;
        state.device = {
          isMobile: screenWidth < 768,
          isTablet: screenWidth >= 768 && screenWidth < 1024,
          isDesktop: screenWidth >= 1024,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
        };
      }
    },
  },
});

export const {
  // Navigation
  setCurrentPage,
  goBack,

  // Layout
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,

  // Theme
  setTheme,
  toggleTheme,
  setFontSize,
  setViewMode,

  // Search
  setSearchQuery,
  toggleSearchOverlay,
  setSearchOverlay,
  addRecentSearch,
  clearRecentSearches,

  // Mobile Navigation
  toggleMobileMenu,
  setMobileMenu,
  toggleMobileSearch,
  setMobileSearch,
  toggleNotifications,
  setNotifications,
  toggleProfileMenu,
  setProfileMenu,

  // Scroll
  setScrolled,
  setScrollPosition,

  // Loading
  setLoading,
  setGlobalLoading,

  // Modals
  setModal,
  closeAllModals,

  // Toasts
  addToast,
  removeToast,
  clearToasts,

  // Forms
  setFormState,
  setFormErrors,
  clearFormErrors,
  resetForm,

  // Filters
  setFilter,
  resetFilters,

  // Preferences
  setPreference,

  // Device
  setDeviceInfo,

  // Utility
  closeAllMenus,
  resetUI,
  loadFromStorage,
} = uiSlice.actions;

export default uiSlice.reducer;