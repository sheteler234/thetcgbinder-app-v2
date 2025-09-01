import { create } from 'zustand';
import type { Notification } from '../lib/types';

interface UiState {
  // Navigation
  currentPage: number;
  isNavigating: boolean;
  
  // Modals and overlays
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  isAdminMenuOpen: boolean;
  isOrdersMenuOpen: boolean;
  isEmailTemplateAdminOpen: boolean;
  
  // Loading states
  isLoading: boolean;
  loadingMessage: string;
  
  // Notifications
  notifications: Notification[];
  
  // Search
  searchQuery: string;
  searchResults: any[];
  
  // Filters
  activeFilters: {
    category?: string;
    rarity?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };

  // Actions
  setCurrentPage: (page: number) => void;
  setNavigating: (isNavigating: boolean) => void;
  
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  
  openAdminMenu: () => void;
  closeAdminMenu: () => void;
  toggleAdminMenu: () => void;
  
  openOrdersMenu: () => void;
  closeOrdersMenu: () => void;
  toggleOrdersMenu: () => void;
  
  openEmailTemplateAdmin: () => void;
  closeEmailTemplateAdmin: () => void;
  toggleEmailTemplateAdmin: () => void;
  
  setLoading: (isLoading: boolean, message?: string) => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: any[]) => void;
  clearSearch: () => void;
  
  setFilter: (key: string, value: any) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
}

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const useUiStore = create<UiState>((set, get) => ({
  // Initial state
  currentPage: 1,
  isNavigating: false,
  
  isCartOpen: false,
  isSearchOpen: false,
  isMobileMenuOpen: false,
  isAdminMenuOpen: false,
  isOrdersMenuOpen: false,
  isEmailTemplateAdminOpen: false,
  
  isLoading: false,
  loadingMessage: '',
  
  notifications: [],
  
  searchQuery: '',
  searchResults: [],
  
  activeFilters: {},

  // Navigation actions
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  setNavigating: (isNavigating: boolean) => {
    set({ isNavigating });
  },

  // Cart actions
  openCart: () => {
    set({ isCartOpen: true });
  },

  closeCart: () => {
    set({ isCartOpen: false });
  },

  toggleCart: () => {
    set((state) => ({ isCartOpen: !state.isCartOpen }));
  },

  // Search actions
  openSearch: () => {
    set({ isSearchOpen: true });
  },

  closeSearch: () => {
    set({ isSearchOpen: false, searchQuery: '', searchResults: [] });
  },

  toggleSearch: () => {
    set((state) => ({ isSearchOpen: !state.isSearchOpen }));
  },

  // Mobile menu actions
  openMobileMenu: () => {
    set({ isMobileMenuOpen: true });
  },

  closeMobileMenu: () => {
    set({ isMobileMenuOpen: false });
  },

  toggleMobileMenu: () => {
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  },

  // Admin menu actions
  openAdminMenu: () => {
    set({ isAdminMenuOpen: true });
  },

  closeAdminMenu: () => {
    set({ isAdminMenuOpen: false });
  },

  toggleAdminMenu: () => {
    set((state) => ({ isAdminMenuOpen: !state.isAdminMenuOpen }));
  },

  // Orders menu actions
  openOrdersMenu: () => {
    set({ isOrdersMenuOpen: true });
  },

  closeOrdersMenu: () => {
    set({ isOrdersMenuOpen: false });
  },

  toggleOrdersMenu: () => {
    set((state) => ({ isOrdersMenuOpen: !state.isOrdersMenuOpen }));
  },

  // Email template admin actions
  openEmailTemplateAdmin: () => {
    set({ isEmailTemplateAdminOpen: true });
  },

  closeEmailTemplateAdmin: () => {
    set({ isEmailTemplateAdminOpen: false });
  },

  toggleEmailTemplateAdmin: () => {
    set((state) => ({ isEmailTemplateAdminOpen: !state.isEmailTemplateAdminOpen }));
  },

  // Loading actions
  setLoading: (isLoading: boolean, message = '') => {
    set({ isLoading, loadingMessage: message });
  },

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration
    const duration = notification.duration || 5000;
    setTimeout(() => {
      get().removeNotification(newNotification.id);
    }, duration);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Search actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSearchResults: (results: any[]) => {
    set({ searchResults: results });
  },

  clearSearch: () => {
    set({ searchQuery: '', searchResults: [] });
  },

  // Filter actions
  setFilter: (key: string, value: any) => {
    set((state) => ({
      activeFilters: {
        ...state.activeFilters,
        [key]: value,
      },
    }));
  },

  clearFilter: (key: string) => {
    set((state) => {
      const newFilters = { ...state.activeFilters };
      delete newFilters[key as keyof typeof newFilters];
      return { activeFilters: newFilters };
    });
  },

  clearAllFilters: () => {
    set({ activeFilters: {} });
  },
}));

// Helper hooks for specific UI states
export const useNotifications = () => {
  const notifications = useUiStore(state => state.notifications);
  const addNotification = useUiStore(state => state.addNotification);
  const removeNotification = useUiStore(state => state.removeNotification);
  const clearNotifications = useUiStore(state => state.clearNotifications);

  const showSuccess = (title: string, message: string, duration?: number) => {
    addNotification({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, duration?: number) => {
    addNotification({ type: 'error', title, message, duration });
  };

  const showWarning = (title: string, message: string, duration?: number) => {
    addNotification({ type: 'warning', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    addNotification({ type: 'info', title, message, duration });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export const useSearch = () => {
  const searchQuery = useUiStore(state => state.searchQuery);
  const searchResults = useUiStore(state => state.searchResults);
  const isSearchOpen = useUiStore(state => state.isSearchOpen);
  const setSearchQuery = useUiStore(state => state.setSearchQuery);
  const setSearchResults = useUiStore(state => state.setSearchResults);
  const openSearch = useUiStore(state => state.openSearch);
  const closeSearch = useUiStore(state => state.closeSearch);
  const clearSearch = useUiStore(state => state.clearSearch);

  return {
    searchQuery,
    searchResults,
    isSearchOpen,
    setSearchQuery,
    setSearchResults,
    openSearch,
    closeSearch,
    clearSearch,
  };
};

export const useFilters = () => {
  const activeFilters = useUiStore(state => state.activeFilters);
  const setFilter = useUiStore(state => state.setFilter);
  const clearFilter = useUiStore(state => state.clearFilter);
  const clearAllFilters = useUiStore(state => state.clearAllFilters);

  return {
    activeFilters,
    setFilter,
    clearFilter,
    clearAllFilters,
  };
};
