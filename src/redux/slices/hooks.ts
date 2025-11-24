// store/hooks.ts
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../store";

// Typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Slice-specific selectors
export const useAuth = () => {
  return useAppSelector((state) => state.auth);
};

// Custom hook to access posts state
export const usePosts = () => {
  return useAppSelector((state) => state.postsList);
};

export const useNotifications = () => {
  // return useAppSelector((state) => state.notifications);
};

export const useUI = () => {
  return useAppSelector((state) => state.ui);
};

// Compound hooks with both state and dispatch
export const useAuthActions = () => {
  const dispatch = useAppDispatch();
  const authState = useAuth();

  return {
    ...authState,
    dispatch,
  };
};

export const usePostsActions = () => {
  const dispatch = useAppDispatch();
  const postsState = usePosts();

  return {
    ...postsState,
    dispatch,
  };
};

export const useNotificationsActions = () => {
  const dispatch = useAppDispatch();
  const notificationsState = useNotifications();

  return {
    // ...notificationsState,
    dispatch,
  };
};

export const useUIActions = () => {
  const dispatch = useAppDispatch();
  const uiState = useUI();

  return {
    ...uiState,
    dispatch,
  };
};