import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface UserProfileData {
    id: string | null;
    username: string;
    profileImage: string | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
    name?: string; // Potential combined name
    bio: string | null;
    location: string | null;
    website: string | null;
    followers: number;
    followerCount?: number; // Potential field name
    followersCount?: number; // Potential field name
    following: number;
    followingCount?: number; // Potential field name
    posts: number;
    postCount?: number; // Potential field name
    totalLikes: number;
    likes?: number; // Potential field name
    coverImage: string | null;
}

interface UserProfileState {
    data: UserProfileData | null;
    posts: any[];
    isLoading: boolean;
    isPostsLoading: boolean;
    error: string | null;
    postsError: string | null;
}

const initialState: UserProfileState = {
    data: null,
    posts: [],
    isLoading: false,
    isPostsLoading: false,
    error: null,
    postsError: null,
};

export const fetchUserDetails = createAsyncThunk(
    'userProfile/fetchDetails',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/user/details/?bloggerId=${userId}`);
            console.log('📡 User Details Response:', response);
            if (response && response.data) {
                return response.data as UserProfileData;
            }
            return rejectWithValue('Invalid response format');
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch user details'
            );
        }
    }
);

export const fetchUserPosts = createAsyncThunk(
    'userProfile/fetchPosts',
    async ({ userId, page = 1, limit = 10 }: { userId: string, page?: number, limit?: number }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/post/v1/user`, {
                params: { bloggerId: userId, page, limit }
            });
            if (response && response.data) {
                return response.data;
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch user posts'
            );
        }
    }
);

const userProfileSlice = createSlice({
    name: 'userProfile',
    initialState,
    reducers: {
        clearProfile: (state) => {
            state.data = null;
            state.posts = [];
            state.isLoading = false;
            state.isPostsLoading = false;
            state.error = null;
            state.postsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserDetails.fulfilled, (state, action: PayloadAction<UserProfileData>) => {
                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(fetchUserDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchUserPosts.pending, (state) => {
                state.isPostsLoading = true;
                state.postsError = null;
            })
            .addCase(fetchUserPosts.fulfilled, (state, action: PayloadAction<any>) => {
                state.isPostsLoading = false;
                // Based on other slices, it might be action.payload.posts or action.payload
                state.posts = action.payload.posts || action.payload.content || action.payload || [];
                state.postsError = null;
            })
            .addCase(fetchUserPosts.rejected, (state, action) => {
                state.isPostsLoading = false;
                state.postsError = action.payload as string;
            });
    },
});

export const { clearProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;
