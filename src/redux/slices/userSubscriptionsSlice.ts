import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Types
interface SubscriptionState {
    subscribedBloggers: Set<string>; // Set of blogger IDs user is subscribed to
    isLoading: boolean;
    error: string | null;
    subscriptionCounts: Record<string, number>; // bloggerId -> follower count
}

interface SubscribeResponse {
    success: boolean;
    isSubscribed: boolean;
    bloggerId: string;
    followerCount: number;
    message: string;
}

interface CheckSubscriptionResponse {
    isSubscribed: boolean;
    bloggerId: string;
}

const initialState: SubscriptionState = {
    subscribedBloggers: new Set(),
    isLoading: false,
    error: null,
    subscriptionCounts: {},
};

// Async Thunks
// ============================================================

/**
 * Check if current user is subscribed to a blogger
 * GET /api/user/action/is-subscribed?bloggerId={id}
 */
export const checkSubscription = createAsyncThunk(
    'subscriptions/checkSubscription',
    async (bloggerId: string, { rejectWithValue }) => {
        try {
            const response = await api.get<CheckSubscriptionResponse>(
                `/user/action/is-subscribed?bloggerId=${bloggerId}`
            );
            return {
                bloggerId,
                isSubscribed: response.data,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to check subscription status'
            );
        }
    }
);

/**
 * Toggle subscription (subscribe/unsubscribe)
 * POST /api/user/action/subscribe
 */
export const subscribeToUser = createAsyncThunk(
    'subscriptions/subscribeToUser',
    async (bloggerId: string, { rejectWithValue }) => {
        try {
            const response = await api.post<SubscribeResponse>(
                `/user/action/subscribe?bloggerId=${bloggerId}`
            );
            return {
                bloggerId,
                isSubscribed: true,
                followerCount: (response as any).followerCount || 0,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to subscribe'
            );
        }
    }
);

export const unsubscribeFromUser = createAsyncThunk(
    'subscriptions/unsubscribeFromUser',
    async (bloggerId: string, { rejectWithValue }) => {
        try {
            const response = await api.post<SubscribeResponse>(
                `/user/action/unsubscribe?bloggerId=${bloggerId}`
            );
            return {
                bloggerId,
                isSubscribed: false,
                followerCount: (response as any).followerCount || 0,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to unsubscribe'
            );
        }
    }
);

// Toggle wrapper for convenience
export const toggleSubscription = createAsyncThunk(
    'subscriptions/toggleSubscription',
    async (bloggerId: string, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState() as { subscriptions: SubscriptionState };
            const isCurrentlySubscribed = state.subscriptions.subscribedBloggers.has(bloggerId);
            console.log("isCurrentlySubscribed", isCurrentlySubscribed);
            if (isCurrentlySubscribed) {
                return await dispatch(unsubscribeFromUser(bloggerId)).unwrap();
            } else {
                return await dispatch(subscribeToUser(bloggerId)).unwrap();
            }
        } catch (error: any) {
            return rejectWithValue(
                error.message || 'Failed to toggle subscription'
            );
        }
    }
);

/**
 * Get list of all subscribed bloggers
 * GET /api/user/action/subscriptions
 */
export const fetchSubscriptions = createAsyncThunk(
    'subscriptions/fetchSubscriptions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<{ bloggerIds: string[] }>(
                '/user/action/subscriptions'
            );
            return (response as any).bloggerIds;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch subscriptions'
            );
        }
    }
);

/**
 * Get follower count for a blogger
 * GET /api/user/action/follower-count?bloggerId={id}
 */
export const fetchFollowerCount = createAsyncThunk(
    'subscriptions/fetchFollowerCount',
    async (bloggerId: string, { rejectWithValue }) => {
        try {
            const response = await api.get<{ count: number }>(
                `/user/action/follower-count?bloggerId=${bloggerId}`
            );
            return {
                bloggerId,
                count: (response as any).count,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch follower count'
            );
        }
    }
);

// Slice
// ============================================================

const userSubscriptionsSlice = createSlice({
    name: 'subscriptions',
    initialState,
    reducers: {
        // Manual subscription toggle (for optimistic updates)
        setSubscription: (state, action: PayloadAction<{ bloggerId: string; isSubscribed: boolean }>) => {
            if (action.payload.isSubscribed) {
                state.subscribedBloggers.add(action.payload.bloggerId);
            } else {
                state.subscribedBloggers.delete(action.payload.bloggerId);
            }
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Reset state (on logout)
        resetSubscriptions: (state) => {
            state.subscribedBloggers = new Set();
            state.subscriptionCounts = {};
            state.error = null;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        // Check Subscription
        builder
            .addCase(checkSubscription.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkSubscription.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.isSubscribed) {
                    state.subscribedBloggers.add(action.payload.bloggerId);
                } else {
                    state.subscribedBloggers.delete(action.payload.bloggerId);
                }
            })
            .addCase(checkSubscription.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Subscribe to User
        builder
            .addCase(subscribeToUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(subscribeToUser.fulfilled, (state, action) => {
                state.isLoading = false;
                const { bloggerId, followerCount } = action.payload;
                state.subscribedBloggers.add(bloggerId);
                state.subscriptionCounts[bloggerId] = followerCount;
            })
            .addCase(subscribeToUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Unsubscribe from User
        builder
            .addCase(unsubscribeFromUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(unsubscribeFromUser.fulfilled, (state, action) => {
                state.isLoading = false;
                const { bloggerId, followerCount } = action.payload;
                state.subscribedBloggers.delete(bloggerId);
                state.subscriptionCounts[bloggerId] = followerCount;
            })
            .addCase(unsubscribeFromUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Toggle Subscription (uses subscribe/unsubscribe internally)
        builder
            .addCase(toggleSubscription.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(toggleSubscription.fulfilled, (state, action) => {
                state.isLoading = false;
                const { bloggerId, isSubscribed, followerCount } = action.payload;

                if (isSubscribed) {
                    state.subscribedBloggers.add(bloggerId);
                } else {
                    state.subscribedBloggers.delete(bloggerId);
                }

                state.subscriptionCounts[bloggerId] = followerCount;
            })
            .addCase(toggleSubscription.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch All Subscriptions
        builder
            .addCase(fetchSubscriptions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSubscriptions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.subscribedBloggers = new Set(action.payload);
            })
            .addCase(fetchSubscriptions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Follower Count
        builder
            .addCase(fetchFollowerCount.fulfilled, (state, action) => {
                state.subscriptionCounts[action.payload.bloggerId] = action.payload.count;
            });
    },
});

// Actions
export const { setSubscription, clearError, resetSubscriptions } = userSubscriptionsSlice.actions;

// Selectors
export const selectIsSubscribed = (state: { subscriptions: SubscriptionState }, bloggerId: string) => {
    return state.subscriptions.subscribedBloggers.has(bloggerId);
};

export const selectFollowerCount = (state: { subscriptions: SubscriptionState }, bloggerId: string) => {
    return state.subscriptions.subscriptionCounts[bloggerId] || 0;
};

export const selectAllSubscriptions = (state: { subscriptions: SubscriptionState }) => {
    return Array.from(state.subscriptions.subscribedBloggers);
};

export const selectSubscriptionsLoading = (state: { subscriptions: SubscriptionState }) => {
    return state.subscriptions.isLoading;
};

export const selectSubscriptionsError = (state: { subscriptions: SubscriptionState }) => {
    return state.subscriptions.error;
};

export default userSubscriptionsSlice.reducer;