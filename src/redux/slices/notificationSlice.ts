import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import type { Notification as NotificationType } from '../../types';

interface NotificationState {
    notifications: NotificationType[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    page: number;
    hasMore: boolean;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    page: 0,
    hasMore: true,
};

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async ({ page = 0, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const response: any = await api.get(`/notifications?page=${page}&limit=${limit}`);
            const apiData = response.data; // Already returned response.data by interceptor

            // Robust mapping of backend fields to frontend interface
            const mappedNotifications = (apiData.notifications || []).map((n: any) => ({
                ...n,
                id: String(n.id),
                type: n.type || 'info',
                message: n.message || `New interaction from ${n.authorName || 'someone'}`,
                timestamp: n.createdAt || n.timestamp || new Date().toISOString(),
                read: !!n.read,
                postId: n.postId ? String(n.postId) : undefined
            }));

            return {
                notifications: mappedNotifications,
                page,
                hasMore: page < (apiData.totalPages || 0) - 1
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchCount',
    async (_, { rejectWithValue }) => {
        try {
            const response: any = await api.get('/notifications/count');
            const apiData = response.data;
            return apiData.unreadCount;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/notifications/mark-read-all');
            return null;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearNotifications: (state) => {
            state.notifications = [];
            state.page = 0;
            state.hasMore = true;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.page === 0) {
                    state.notifications = action.payload.notifications;
                } else {
                    state.notifications = [...state.notifications, ...action.payload.notifications];
                }
                state.page = action.payload.page;
                state.hasMore = action.payload.hasMore;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Unread Count
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            // Mark All As Read
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.unreadCount = 0;
                state.notifications = state.notifications.map(n => ({ ...n, read: true }));
            });
    },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
