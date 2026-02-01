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

export const fetchPostLikeCount = createAsyncThunk(
    'postDetail/fetchPostLikeCount',
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/reaction/post/like/count?postId=${postId}`) as any;
            // The response might be a number directly, or an object like { count: number }
            // Return the count as a number
            const count = typeof response === 'number' ? response : (response?.data ?? response);
            console.log('Fetched like count:', count, 'from response:', response);
            return { postId, count: Number(count) };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch like count');
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
                console.log('Post loaded with likesCount:', action.payload.likesCount);
                console.log('Post stats.likes:', action.payload.stats?.likes);
                state.error = null;
            })
            .addCase(fetchPostById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch post';
            })
            .addCase(fetchPostLikeCount.fulfilled, (state, action) => {
                console.log('fetchPostLikeCount.fulfilled called');
                console.log('Current post:', state.currentPost);
                console.log('Payload:', action.payload);
                console.log('Post IDs match?', state.currentPost?.id === action.payload.postId);

                if (state.currentPost) {
                    console.log('Before update - likesCount:', state.currentPost.likesCount);
                    state.currentPost.likesCount = action.payload.count;
                    console.log('After update - likesCount:', state.currentPost.likesCount);
                } else {
                    console.warn('Post ID mismatch or no current post!');
                }
            });

        // Listen to actions from postsListSlice
        builder.addCase(toggleLike, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload) {
                state.currentPost.isLiked = !state.currentPost.isLiked;
                state.currentPost.likesCount += state.currentPost.isLiked ? 1 : -1;
            }
        });

        builder.addCase(toggleBookmark, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload) {
                state.currentPost.isBookmarked = !state.currentPost.isBookmarked;
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
                state.currentPost.isLiked = action.payload.liked;
                state.currentPost.likesCount = action.payload.likesCount;
            }
        });
    },
});

export const { setCurrentPost, clearDetailError } = postDetailSlice.actions;
export default postDetailSlice.reducer;
