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

interface SearchState {
    searchResults: BlogPost[];
    isSearching: boolean;
    error: string | null;
}

const initialState: SearchState = {
    searchResults: [],
    isSearching: false,
    error: null,
};

export const searchPosts = createAsyncThunk(
    'search/searchPosts',
    async (query: string, { rejectWithValue }) => {
        try {
            const response = await api.get('/post/v1/allposts', {
                params: { search: query, page: 1, limit: 20 }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Search failed');
        }
    }
);

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        clearSearch: (state) => {
            state.searchResults = [];
            state.isSearching = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchPosts.pending, (state) => {
                state.isSearching = true;
                state.error = null;
            })
            .addCase(searchPosts.fulfilled, (state, action) => {
                state.isSearching = false;
                state.searchResults = action.payload.posts || action.payload || [];
                state.error = null;
            })
            .addCase(searchPosts.rejected, (state, action) => {
                state.isSearching = false;
                state.error = action.payload as string || 'Search failed';
            });

        // Listen to actions from postsListSlice
        builder.addCase(toggleLike, (state, action) => {
            const postId = action.payload;
            const updatePostLike = (post: BlogPost) => {
                if (post.id === postId) {
                    post.isLiked = !post.isLiked;
                    post.stats.likes += post.isLiked ? 1 : -1;
                }
            };
            state.searchResults.forEach(updatePostLike);
        });

        builder.addCase(toggleBookmark, (state, action) => {
            const postId = action.payload;
            const updatePostBookmark = (post: BlogPost) => {
                if (post.id === postId) {
                    post.isBookmarked = !post.isBookmarked;
                }
            };
            state.searchResults.forEach(updatePostBookmark);
        });

        builder.addCase(toggleSubscribe, (state, action) => {
            const authorName = action.payload;
            const updateSubscription = (post: BlogPost) => {
                if (post.author.name === authorName) {
                    post.author.isSubscribed = !post.author.isSubscribed;
                }
            };
            state.searchResults.forEach(updateSubscription);
        });

        builder.addCase(incrementViews, (state, action) => {
            const postId = action.payload;
            const updateViews = (post: BlogPost) => {
                if (post.id === postId) {
                    post.stats.views += 1;
                }
            };
            state.searchResults.forEach(updateViews);
        });

        builder.addCase(updatePost, (state, action) => {
            const { postId, updates } = action.payload;
            const updatePostData = (post: BlogPost) => {
                if (post.id === postId) {
                    Object.assign(post, updates);
                }
            };
            state.searchResults.forEach(updatePostData);
        });

        builder.addCase(deletePost.fulfilled, (state, action) => {
            const postId = action.payload;
            state.searchResults = state.searchResults.filter(post => post.id !== postId);
        });

        builder.addCase(likePost.fulfilled, (state, action) => {
            const { postId, isLiked, likesCount } = action.payload;
            const updatePostFromAPI = (post: BlogPost) => {
                if (post.id === postId) {
                    post.isLiked = isLiked;
                    post.stats.likes = likesCount;
                }
            };
            state.searchResults.forEach(updatePostFromAPI);
        });
    },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
