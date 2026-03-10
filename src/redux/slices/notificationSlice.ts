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
            const apiData: any = await api.get(`/notifications?page=${page}&limit=${limit}`);
            
            // Handle various backend response structures
            let notificationsArray = [];
            if (Array.isArray(apiData)) {
                notificationsArray = apiData;
            } else if (Array.isArray(apiData?.data?.notifications)) {
                notificationsArray = apiData.data.notifications;
            } else if (Array.isArray(apiData?.notifications)) {
                notificationsArray = apiData.notifications;
            } else if (Array.isArray(apiData?.data)) {
                notificationsArray = apiData.data;
            } else if (Array.isArray(apiData?.content)) {
                notificationsArray = apiData.content;
            }

            const totalPages = apiData?.totalPages || apiData?.data?.totalPages || 0;

            // Robust mapping of backend fields to frontend interface
            const mappedNotifications = notificationsArray.map((n: any) => ({
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
                hasMore: page < (totalPages || 0) - 1
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
            const apiData: any = await api.get('/notifications/count');
            // Handle various backend response structures for count
            if (typeof apiData === 'number') return apiData;
            if (typeof apiData?.data?.unreadCount === 'number') return apiData.data.unreadCount;
            if (typeof apiData?.unreadCount === 'number') return apiData.unreadCount;
            if (typeof apiData?.data === 'number') return apiData.data;
            
            return 0;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
    'notifications/markOneAsRead',
    async (notificationId: string, { rejectWithValue }) => {
        try {
            await api.post(`/notifications/read?notificationId=${notificationId}`);
            return notificationId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
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
                const payload = action.payload as any;
                if (payload.page === 0) {
                    state.notifications = payload.notifications;
                } else {
                    state.notifications = [...state.notifications, ...payload.notifications];
                }
                state.page = payload.page;
                state.hasMore = payload.hasMore;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Unread Count
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload as number;
            })
            // Mark All As Read
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.unreadCount = 0;
                state.notifications = state.notifications.map(n => ({ ...n, read: true }));
            })
            // Mark One As Read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload as string);
                if (notification && !notification.read) {
                    notification.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            });
    },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
