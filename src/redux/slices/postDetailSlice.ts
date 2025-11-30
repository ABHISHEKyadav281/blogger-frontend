import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { BlogPost } from '../../types';
import api from '../../utils/api';
import {
    toggleLike,
    toggleBookmark,
    toggleSubscribe,
    incrementViews,
    updatePost,
    deletePost,
    likePost
} from './postsListSlice';

interface PostDetailState {
    currentPost: BlogPost | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: PostDetailState = {
    currentPost: null,
    isLoading: false,
    error: null,
};

export const fetchPostById = createAsyncThunk(
    'postDetail/fetchPostById',
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/post/v1/posts/${postId}`);
            // api.ts interceptor already returns response.data (the actual data), but TS thinks it's AxiosResponse
            return response as unknown as BlogPost;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
        }
    }
);

const postDetailSlice = createSlice({
    name: 'postDetail',
    initialState,
    reducers: {
        setCurrentPost: (state, action: PayloadAction<BlogPost | null>) => {
            state.currentPost = action.payload;
        },
        clearDetailError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPostById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPostById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPost = action.payload;
                state.error = null;
            })
            .addCase(fetchPostById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch post';
            });

        // Listen to actions from postsListSlice
        builder.addCase(toggleLike, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload) {
                state.currentPost.stats.isLiked = !state.currentPost.stats.isLiked;
                state.currentPost.stats.likes += state.currentPost.stats.isLiked ? 1 : -1;
            }
        });

        builder.addCase(toggleBookmark, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload) {
                state.currentPost.stats.isBookmarked = !state.currentPost.stats.isBookmarked;
            }
        });

        builder.addCase(toggleSubscribe, (state, action) => {
            if (state.currentPost && state.currentPost.author.name === action.payload) {
                state.currentPost.author.isSubscribed = !state.currentPost.author.isSubscribed;
            }
        });

        builder.addCase(incrementViews, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload) {
                state.currentPost.stats.views += 1;
            }
        });

        builder.addCase(updatePost, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload.postId) {
                Object.assign(state.currentPost, action.payload.updates);
            }
        });

        builder.addCase(deletePost.fulfilled, (state, action) => {
            if (state.currentPost?.id === action.payload) {
                state.currentPost = null;
            }
        });

        builder.addCase(likePost.fulfilled, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload.postId) {
                state.currentPost.stats.isLiked = action.payload.isLiked;
                state.currentPost.stats.likes = action.payload.likesCount;
            }
        });
    },
});

export const { setCurrentPost, clearDetailError } = postDetailSlice.actions;
export default postDetailSlice.reducer;
