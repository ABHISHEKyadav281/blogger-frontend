// store/index.ts
import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import authSlice, { loginSuccess, logout, updateUser } from './slices/authSlice';
import postsListSlice from './slices/postsListSlice';
import postDetailSlice from './slices/postDetailSlice';
import searchSlice from './slices/searchSlice';
import uiSlice from './slices/uiSlice';
import subscriptionsReducer from './slices/userSubscriptionsSlice';
import userProfileReducer from './slices/userProfileSlice';

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(loginSuccess, logout, updateUser),
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as any;
    if (action.type === loginSuccess.type || action.type === updateUser.type) {
      if (state.auth.user) {
        localStorage.setItem('animeblog_user', JSON.stringify(state.auth.user));
      }
      if (state.auth.token) {
        localStorage.setItem('animeblog_token', state.auth.token);
      }
    } else if (action.type === logout.type) {
      localStorage.removeItem('animeblog_user');
      localStorage.removeItem('animeblog_token');
    }
  },
});

export const store = configureStore({
  reducer: {
    auth: authSlice,
    postsList: postsListSlice,
    postDetail: postDetailSlice,
    search: searchSlice,
    ui: uiSlice,
    subscriptions: subscriptionsReducer,
    userProfile: userProfileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;