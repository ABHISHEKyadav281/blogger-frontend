import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { BlogPost } from '../../types';
import api from '../../utils/api';

interface PostsListState {
    posts: BlogPost[];
    isLoading: boolean;
    error: string | null;
    bookmarkedPosts: BlogPost[];
    totalPosts: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
    filters: {
        category: string | null;
        status: string | null;
        featured: boolean | null;
        search: string | null;
    };
}

const initialState: PostsListState = {
    posts: [],
    isLoading: false,
    error: null,
    bookmarkedPosts: [],
    totalPosts: 0,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    filters: {
        category: null,
        status: null,
        featured: null,
        search: null,
    }
};

// Async thunks
export const fetchPosts = createAsyncThunk(
    'postsList/fetchPosts',
    async ({
        page = 1,
        limit = 10,
        category = null,
        status = 'PUBLISHED',
        featured = null,
        search = null,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    }: {
        page?: number;
        limit?: number;
        category?: string | null;
        status?: string | null;
        featured?: boolean | null;
        search?: string | null;
        sortBy?: string;
        sortOrder?: string;
    } = {}, { rejectWithValue }) => {
        try {
            const params: any = { page, limit, sortBy, sortOrder };
            if (category) params.category = category;
            if (status) params.status = status;
            if (featured !== null) params.featured = featured;
            if (search) params.search = search;

            const response = await api.get('/post/v1/allposts', { params });
            console.log('📡 Full API Response:', response);
            console.log('📡 Response Keys:', Object.keys(response));
            console.log('📡 Response.data:', response.data);
            console.log('📡 Response.content:', response.content);
            console.log('📡 Response.posts:', response.posts);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
        }
    }
);

export const fetchFeaturedPosts = createAsyncThunk(
    'postsList/fetchFeaturedPosts',
    async ({ page = 1, limit = 6 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/post/v1/featured', {
                params: { page, limit }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured posts');
        }
    }
);

export const fetchUserPosts = createAsyncThunk(
    'postsList/fetchUserPosts',
    async ({
        userId,
        page = 1,
        limit = 10
    }: {
        userId: number;
        page?: number;
        limit?: number;
    }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/post/v1/user/${userId}`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user posts');
        }
    }
);

export const createPost = createAsyncThunk(
    'postsList/createPost',
    async (postData: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/post/v1/createPost', postData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create post');
        }
    }
);

export const deletePost = createAsyncThunk(
    'postsList/deletePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/post/v1/posts/${postId}`);
            return postId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
        }
    }
);

export const likePost = createAsyncThunk(
    'postsList/likePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await api.post(`/post/v1/posts/${postId}/like`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to like post');
        }
    }
);

export const fetchBookmarkedPosts = createAsyncThunk(
    'postsList/fetchBookmarkedPosts',
    async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/post/v1/bookmarks', {
                params: { page, limit }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookmarked posts');
        }
    }
);

const postsListSlice = createSlice({
    name: 'postsList',
    initialState,
    reducers: {
        toggleLike: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            const updatePostLike = (post: BlogPost) => {
                if (post.id === postId) {
                    post.stats.isLiked = !post.stats.isLiked;
                    post.stats.likes += post.stats.isLiked ? 1 : -1;
                }
            };
            state.posts.forEach(updatePostLike);
            state.bookmarkedPosts.forEach(updatePostLike);
        },
        toggleBookmark: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            const updatePostBookmark = (post: BlogPost) => {
                if (post.id === postId) {
                    post.stats.isBookmarked = !post.stats.isBookmarked;
                    if (post.stats.isBookmarked) {
                        if (!state.bookmarkedPosts.find(p => p.id === postId)) {
                            state.bookmarkedPosts.push(post);
                        }
                    } else {
                        state.bookmarkedPosts = state.bookmarkedPosts.filter(p => p.id !== postId);
                    }
                }
            };
            state.posts.forEach(updatePostBookmark);
        },
        toggleSubscribe: (state, action: PayloadAction<string>) => {
            const authorName = action.payload;
            const updateSubscription = (post: BlogPost) => {
                if (post.author.name === authorName) {
                    post.author.isSubscribed = !post.author.isSubscribed;
                }
            };
            state.posts.forEach(updateSubscription);
            state.bookmarkedPosts.forEach(updateSubscription);
        },
        incrementViews: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            const updateViews = (post: BlogPost) => {
                if (post.id === postId) {
                    post.stats.views += 1;
                }
            };
            state.posts.forEach(updateViews);
            state.bookmarkedPosts.forEach(updateViews);
        },
        addPost: (state, action: PayloadAction<BlogPost>) => {
            state.posts.unshift(action.payload);
            state.totalPosts += 1;
        },
        updatePost: (state, action: PayloadAction<{ postId: string; updates: Partial<BlogPost> }>) => {
            const { postId, updates } = action.payload;
            const updatePostData = (post: BlogPost) => {
                if (post.id === postId) {
                    Object.assign(post, updates);
                }
            };
            state.posts.forEach(updatePostData);
            state.bookmarkedPosts.forEach(updatePostData);
        },
        resetPosts: (state) => {
            state.posts = [];
            state.currentPage = 1;
            state.totalPages = 1;
            state.hasMore = false;
            state.totalPosts = 0;
        },
        setFilters: (state, action: PayloadAction<Partial<PostsListState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
            state.currentPage = 1;
            state.posts = [];
        },
        clearFilters: (state) => {
            state.filters = {
                category: null,
                status: null,
                featured: null,
                search: null,
            };
            state.currentPage = 1;
            state.posts = [];
        },
        clearListError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // fetchPosts
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                const { posts, totalPosts, currentPage, totalPages, hasMore } = action.payload;
                if (currentPage === 1) {
                    state.posts = posts || [];
                } else {
                    const newPosts = (posts || []).filter(
                        (newPost: BlogPost) => !state.posts.find(p => p.id === newPost.id)
                    );
                    state.posts.push(...newPosts);
                }
                state.totalPosts = totalPosts || 0;
                state.currentPage = currentPage || 1;
                state.totalPages = totalPages || 1;
                state.hasMore = hasMore || false;
                state.error = null;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch posts';
            });

        // fetchFeaturedPosts
        builder
            .addCase(fetchFeaturedPosts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchFeaturedPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.posts = action.payload.posts || [];
                state.error = null;
            })
            .addCase(fetchFeaturedPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch featured posts';
            });

        // fetchUserPosts
        builder
            .addCase(fetchUserPosts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                const { posts, totalPosts, currentPage, totalPages, hasMore } = action.payload;
                if (currentPage === 1) {
                    state.posts = posts || [];
                } else {
                    state.posts.push(...(posts || []));
                }
                state.totalPosts = totalPosts || 0;
                state.currentPage = currentPage || 1;
                state.totalPages = totalPages || 1;
                state.hasMore = hasMore || false;
                state.error = null;
            })
            .addCase(fetchUserPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch user posts';
            });

        // createPost
        builder
            .addCase(createPost.fulfilled, (state, action) => {
                state.posts.unshift(action.payload);
                state.totalPosts += 1;
            });

        // deletePost
        builder
            .addCase(deletePost.fulfilled, (state, action) => {
                const postId = action.payload;
                state.posts = state.posts.filter(post => post.id !== postId);
                state.bookmarkedPosts = state.bookmarkedPosts.filter(post => post.id !== postId);
                state.totalPosts = Math.max(0, state.totalPosts - 1);
            });

        // likePost
        builder
            .addCase(likePost.fulfilled, (state, action) => {
                const { postId, isLiked, likesCount } = action.payload;
                const updatePostFromAPI = (post: BlogPost) => {
                    if (post.id === postId) {
                        post.stats.isLiked = isLiked;
                        post.stats.likes = likesCount;
                    }
                };
                state.posts.forEach(updatePostFromAPI);
                state.bookmarkedPosts.forEach(updatePostFromAPI);
            });


        // fetchBookmarkedPosts
        builder
            .addCase(fetchBookmarkedPosts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBookmarkedPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.bookmarkedPosts = action.payload.posts || [];
                // If we want to show them in the main list, we can also set state.posts
                // For a specific "My Bookmarks" page, we might want to use state.posts or state.bookmarkedPosts
                // Let's assume the page will read from state.posts if we use a separate page logic,
                // or we can just populate state.posts to reuse the list component.
                // However, the interface has a specific `bookmarkedPosts` field.
                // Let's populate state.posts so we can reuse generic list selectors/components if they rely on it,
                // BUT wait, `bookmarkedPosts` exists in state.
                // Let's settle on using state.posts for the current view to allow pagination etc using the same variables.
                state.posts = action.payload.posts || [];
                state.totalPosts = action.payload.totalPosts || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 1;
                state.hasMore = action.payload.hasMore || false;
            })
            .addCase(fetchBookmarkedPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch bookmarked posts';
            });
    },
});

export const {
    toggleLike,
    toggleBookmark,
    toggleSubscribe,
    incrementViews,
    addPost,
    updatePost,
    resetPosts,
    setFilters,
    clearFilters,
    clearListError
} = postsListSlice.actions;

export default postsListSlice.reducer;
